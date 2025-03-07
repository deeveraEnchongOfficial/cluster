<?php

namespace App\Modules\Acumatica\SalesOrder;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\Acumatica;
use App\Facades\TSM;
use App\Modules\Acumatica\SOLineItem\ProcessSOLineItemTransaction;
use App\Modules\Acumatica\SOLineItem\SOLineItemSync;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsProcessing;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsSynchronizing;
use App\Modules\Acumatica\Transaction\Transaction;
use App\Modules\Acumatica\Transaction\TransactionRepository;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use LogicException;

class SalesOrderSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(?string $file = null): void
    {
        Log::info('Starting SalesOrder Sync...');
        $inputDirectoryPath = config('filesystems.acumatica.path');
        $directory = Storage::disk('local')->path("$inputDirectoryPath/SalesOrder/");
        $customerFile = Storage::disk('local')->path("$inputDirectoryPath/Customer/Customer-acu-response.json");
        $invoiceFile = Storage::disk('local')->path("$inputDirectoryPath/Invoice/Invoice-acu-response.json");

        if (!Storage::disk('local')->exists("$inputDirectoryPath/Customer/Customer-acu-response.json")) {
            Log::warning("Customer JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('Customer', [
                '$expand' => 'MainContact'
            ]);
        }

        if (!Storage::disk('local')->exists("$inputDirectoryPath/Invoice/Invoice-acu-response.json")) {
            Log::warning("Invoice JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('Invoice');
        }

        $customer = $this->loadFromFile($customerFile, 'Customer');
        $invoice = $this->loadFromFile($invoiceFile, 'Invoice');

        if ($file) {
            $filePath = Storage::disk('local')->path("$inputDirectoryPath/SalesOrder/$file");
            $salesOrders = $this->loadFromFile($filePath, 'SalesOrder');

            if (!$salesOrders || empty($salesOrders)) {
                Log::info('No salesOrders found in the JSON file: ' . $file);
                return;
            }

            foreach ($salesOrders as $salesOrderData) {
                if (is_array($salesOrderData)) {
                    $this->upsert($salesOrderData, $file, $customer, $invoice);
                }
            }

            Log::info('SalesOrder Sync Completed.');
            return;
        }

        $files = File::files($directory);
        $jsonFiles = collect($files)->filter(function ($file) {
            return preg_match('/SalesOrder-acu-response\d+\.json$/', $file->getFilename());
        })->sortBy(fn($file) => (int) filter_var($file->getFilename(), FILTER_SANITIZE_NUMBER_INT));

        if ($jsonFiles->isEmpty()) {
            Log::warning("No SalesOrder JSON files found. Fetching fresh data...");
            Acumatica::fetchAndSaveDataInChunks('SalesOrder', [
                '$expand' => 'Details,Shipments',
            ]);
            return;
        }

        foreach ($jsonFiles as $file) {
            $filePath = $file->getPathname();
            Log::info("Processing file: " . $file->getFilename());

            $salesOrders = $this->loadFromFile($filePath, 'SalesOrder');

            if (!$salesOrders || empty($salesOrders)) {
                Log::info('No salesOrders found in the JSON file: ' . $file->getFilename());
                continue;
            }

            foreach ($salesOrders as $salesOrderData) {
                if (is_array($salesOrderData)) {
                    $this->upsert($salesOrderData, $file->getFilename(), $customer, $invoice);
                }
            }
        }

        Log::info('SalesOrder Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting SalesOrder Sync...');
        if (empty($records)) {
            Log::info('Empty Sales Order records.');
            return;
        }
        $action = $this->transaction->action === 'upsert' ? 'upsertByRecord' : 'delete';
        if (! method_exists($this, $action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $salesOrderData) {
            if (is_array($salesOrderData)) {
                $this->{$action}($salesOrderData);
            }
        }
        $this->syncRelatedLineItems();
        Log::info('SalesOrder Sync Completed.');
    }

    private function loadFromFile($filePath, $entity): ?array
    {
        if (!File::exists($filePath)) {
            Log::error($entity . "JSON file not found at: " . $filePath);
            return null;
        }

        $jsonContent = File::get($filePath);
        $decodedData = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Error decoding JSON file: ' . json_last_error_msg());
            return null;
        }

        return $decodedData;
    }

    private function upsert(
        array $data,
        string $filename = '',
        ?array $customer,
        ?array $invoice
    ): void {
        $filteredCustomer = collect($customer)->first(
            fn($c) => isset($c['CustomerID']['value']) && $c['CustomerID']['value'] === ($data['CustomerID']['value'] ?? null)
        );

        $orderType = $data['OrderType']['value'] ?? '';
        $orderNbr = $data['OrderNbr']['value'] ?? '';
        $customerName = $filteredCustomer['CustomerName']['value'] ?? '';

        $name = trim("{$orderType} {$orderNbr} {$customerName}");
        $salesOrderId = $data['OrderNbr']['value'] ?? null;

        if (!$salesOrderId) {
            Log::warning("Skipping Sales Order with missing SalesOrderID.");
            return;
        }

        echo "Syncing Filename: {$filename} SalesOrder ID: {$salesOrderId}" . PHP_EOL;

        $shipmentData = collect($data['Shipments'] ?? [])->map(function ($shipment) use ($invoice) {
            $invoiceData = collect($invoice)->first(
                fn($i) => isset($i['ReferenceNbr']['value']) && $i['ReferenceNbr']['value'] === ($shipment['InvoiceNbr']['value'] ?? null)
            );

            return [
                'inventory_ref_nbr' => $shipment['InventoryRefNbr']['value'] ?? null,
                'invoice_nbr' => $shipment['InvoiceNbr']['value'] ?? null,
                'invoice_type' => $shipment['InvoiceType']['value'] ?? null,
                'shipment_date' => $shipment['ShipmentDate']['value'] ?? null,
                'shipment_nbr' => $shipment['ShipmentNbr']['value'] ?? null,
                'shipment_type' => $shipment['ShipmentType']['value'] ?? null,
                'shipped_qty' => $shipment['ShippedQty']['value'] ?? null,
                'status' => $shipment['Status']['value'] ?? null,
                'invoice_amount' => $invoiceData['Amount']['value'] ?? null,
                'remarks' => $invoiceData['Description']['value'] ?? null,
            ];
        })->filter()->values()->toArray();

        $detailsData = collect($data['Details'] ?? [])->map(function ($detail) {
            return [
                'inventory_id' => $detail['InventoryID']['value'] ?? null,
                'order_qty' => $detail['OrderQty']['value'] ?? null,
                'unit_price' => $detail['UnitPrice']['value'] ?? null,
                'discount_amount' => $detail['DiscountAmount']['value'] ?? null,
                'amount' => $detail['Amount']['value'] ?? null,
                'extended_price' => $detail['ExtendedPrice']['value'] ?? null,
                'unit_cost' => $detail['UnitCost']['value'] ?? null,
                'average_cost' => $detail['AverageCost']['value'] ?? null,
                'location' => $detail['Location']['value'] ?? null,
                'line_description' => $detail['LineDescription']['value'] ?? null,
                'warehouse_id' => $detail['WarehouseID']['value'] ?? null,
            ];
        })->filter(fn($item) => !empty(array_filter($item)))->values()->toArray();

        if (empty($detailsData)) {
            Log::warning("No valid details found for SalesOrder ID: {$salesOrderId}");
        }

        $payload = [
            'id' => $salesOrderId,
            'name' => $name,
            'contact_id' => $data['ContactID']['value'] ?? null,
            'created_date' => $data['CreatedDate']['value'] ?? null,
            'currency' => $data['CurrencyID']['value'] ?? null,
            'account_id' => $data['CustomerID']['value'] ?? null,
            'date' => $data['Date']['value'] ?? null,
            'description' => $data['Description']['value'] ?? null,
            'effective_date' => $data['EffectiveDate']['value'] ?? null,
            'last_modified' => $data['LastModified']['value'] ?? null,
            'order_qty' => $data['OrderedQty']['value'] ?? null,
            'order_nbr' => $data['OrderNbr']['value'] ?? null,
            'order_total' => $data['OrderTotal']['value'] ?? null,
            'status' => $data['Status']['value'] ?? null,
            'details' => $detailsData,
            'shipments' => $shipmentData,
        ];

        Log::info("Payload for SalesOrder ID {$salesOrderId}: ", $payload);

        $this->sendRequest(
            'put',
            '/integrations/deals/upsert',
            $payload,
            $salesOrderId
        );
    }

    private function upsertByRecord(array $data): void
    {
        $orderType = $data['OrderType']['value'] ?? '';
        $salesOrderId = $data['OrderNbr']['value'] ?? '';
        $customerName = $data['CustomerName']['value'] ?? '';

        $name = trim("{$orderType} {$salesOrderId} {$customerName}");

        if (!$salesOrderId) {
            Log::warning("Skipping Sales Order with missing SalesOrderID.");
            return;
        }

        $payload = [
            'id' => $salesOrderId,
            'name' => $name,
            'contact_id' => $data['ContactID']['value'] ?? null,
            'created_date' => $data['CreatedDate']['value'] ?? null,
            'currency' => $data['CurrencyID']['value'] ?? null,
            'account_id' => $data['CustomerID']['value'] ?? null,
            'date' => $data['Date']['value'] ?? null,
            'description' => $data['Description']['value'] ?? null,
            'effective_date' => $data['EffectiveDate']['value'] ?? null,
            'last_modified' => $data['LastModified']['value'] ?? null,
            'order_qty' => $data['OrderedQty']['value'] ?? null,
            'order_nbr' => $data['OrderNbr']['value'] ?? null,
            'order_total' => $data['OrderTotal']['value'] ?? null,
            'status' => $data['Status']['value'] ?? null,
        ];
        Log::info("Payload for SalesOrder ID {$salesOrderId}: ", $payload);

        $this->sendRequest(
            'put',
            '/integrations/deals/upsert-record',
            $payload,
            $salesOrderId
        );
    }

    private function syncRelatedLineItems(): void
    {
        $lineItemTransaction = app(TransactionRepository::class)->findById($this->transaction->id.'::DSM-SOLineItems');
        if ($lineItemTransaction) {
            app(MarkTransactionAsProcessing::class)->execute($lineItemTransaction);
            tap(
                app(ProcessSOLineItemTransaction::class)->handle($lineItemTransaction),
                function ($processedData) use ($lineItemTransaction) {
                    if (! empty($processedData)) {
                        app(MarkTransactionAsSynchronizing::class)->execute($lineItemTransaction);
                        app(SOLineItemSync::class, [
                            'transaction' => $lineItemTransaction,
                        ])->syncByRecords($processedData['records']);
                    }
                }
            );
        }
    }

    private function delete(array $data): void
    {
        $salesOrderId = $data['OrderNbr']['value'] ?? null;
        if (! $salesOrderId) {
            Log::warning("Skipping sales order with missing Order ID $salesOrderId.");
            return;
        }

        $payload = [
            'id' => $salesOrderId,
        ];

        $this->sendRequest('post', '/integrations/deals/delete', $payload, $salesOrderId);
    }

    private function sendRequest(
        string $method,
        string $endpoint,
        array $payload,
        string $recordId
    ): void {
        $maxAttempts = 5;
        $attempt = 0;
        $delay = 2;

        while ($attempt < $maxAttempts) {
            try {
                $response = TSM::request($method, $endpoint, $payload);
                $responseData = $response->json();

                if ($response->successful()) {
                    Log::info("Successfully synced Order ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Order ID: {$recordId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if (is_string($responseData) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Order ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Order ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Order ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync Order ID: {$recordId} after $maxAttempts attempts.");
    }

    private function logError(string $errorMsg): void
    {
        Log::error($errorMsg);
        echo $errorMsg . PHP_EOL;
        if (! empty($transaction)) {
            app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
        }
    }
}

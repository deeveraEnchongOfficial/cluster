<?php

namespace App\Modules\Acumatica\SOLineItem;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\TSM;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;

class SOLineItemSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function syncByRecords(array $records): void
    {
        Log::info('Starting SOLineItem Sync...');

        if (! $records || empty($records)) {
            Log::warning("No SOLineItems found.");
            return;
        }
    
        if ($this->transaction->action === 'upsert') {
            $this->upsert($records);
        }

        if ($this->transaction->action === 'delete') {
            foreach ($records as $lineItemData) {
                $this->delete($lineItemData);
            }
        }
    
        Log::info('SOLineItem Sync Completed.');
    }

    private function upsert(array $lineItems): void
    {
        $itemsCollection = collect($lineItems);
        $lineItemIds = $itemsCollection->pluck('id.value')->values()->all();
        $implodedIds = implode(",", $lineItemIds);

        $payload = [
            'entries' => $itemsCollection->map(function ($detail) {
                return [
                    'id' => $detail['id']['value'],
                    'order_id' => $detail['OrderID']['value'],
                    'inventory_id' => $detail['InventoryID']['value'],
                    'unit_price' => $detail['UnitPrice']['value'] ?? 0,
                    'amount' => $detail['Amount']['value'] ?? 0,
                    'discount_amount' => $detail['DiscountAmount']['value'] ?? 0,
                    'location' => $detail['Location']['value'] ?? null,
                    'order_qty' => $detail['Quantity']['value'] ?? 0,
                    'warehouse_id' => $detail['WarehouseID']['value'] ?? null,
                    'extended_price' => $detail['ExtendedPrice']['value'] ?? 0,  
                ];
            })->toArray(),
        ];

        $this->sendRequest(
            'put',
            '/integrations/deals/upsert-deal-item',
            $payload,
            $implodedIds
        );
    }

    private function delete(array $data): void
    {
        $salesOrderId = $data['OrderID']['value'] ?? null;
        if (! $salesOrderId) {
            Log::warning("Skipping line item with missing Order ID $salesOrderId.");
            return;
        }
        $inventoryId = $data['InventoryID']['value'] ?? null;
        if (! $inventoryId) {
            Log::warning("Skipping line item with missing Inventory ID $inventoryId.");
            return;
        }

        $payload = [
            'order_id' => $salesOrderId,
            'inventory_id' => $inventoryId,
        ];

        $this->sendRequest('post', '/integrations/deals/delete-deal-item', $payload, $salesOrderId);
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
                    Log::info("Successfully synced SOLineItems For ID(s): {$recordId}");
                    app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    return;
                }

                // Handle HTTP 500 (Internal Server Error) - Retry
                if ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    $errorMsg = "Attempt $attempt: Failed to sync SOLineItems ID(s): {$recordId} - Status: 500";
                    Log::warning($errorMsg);
                    echo $errorMsg . PHP_EOL;
                    app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
                }

                // Handle Rate Limit Errors
                if ($response->status() === Response::HTTP_TOO_MANY_REQUESTS) {
                    $exceptionMessage = $responseData['exception_message'] ?? '';

                    if (is_string($exceptionMessage) && str_contains($exceptionMessage, 'Too Many Attempts')) {
                        $errorMsg = "Rate limit hit for SOLineItems ID(s): {$recordId}. Retrying in {$delay} seconds...";
                        echo $errorMsg . PHP_EOL;
                        app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
                    }
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if ($responseData['error']) {
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }
            } catch (\Exception $e) {
                $this->logError("Error syncing SOLineItems ID(s): {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync SOLineItems ID(s): {$recordId} after $maxAttempts attempts.", $this->transaction);
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

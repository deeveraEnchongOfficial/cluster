<?php

namespace App\Modules\Acumatica\NonStockItem;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\TSM;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\Facades\Acumatica;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;
use LogicException;

class NonStockItemSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(): void
    {
        Log::info('Starting Non-Stock Item Sync...');
        // $stockItemsfilePath = Storage::disk('local')->path('acumatica-api-response/NonStockItem/stock-item.json');

        $inputDirectoryPath = config('filesystems.acumatica.path');
        $filePath = Storage::disk('local')->path("$inputDirectoryPath/NonStockItem/NonStockItem-acu-response.json");

        if (!Storage::disk('local')->exists("$inputDirectoryPath/Contact/NonStockItem-acu-response.json")) {
            Log::warning("Contact JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('NonStockItem');
        }

        $nonstock_items = $this->loadFromFile($filePath, 'Non-Stock Item');

        if (!$nonstock_items || empty($nonstock_items)) {
            Log::info('No non-stock_items found in the JSON file.');
            return;
        }


        foreach ($nonstock_items as $nonStockItemData) {
            if (is_array($nonStockItemData)) {
                $this->upsert($nonStockItemData);
            }
        }

        Log::info('Non-Non-StockItem Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Non Stock Item Sync...');
        if (empty($records)) {
            Log::info('Empty Non Stock Item records.');
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $nonStockItem) {
            if (is_array($nonStockItem)) {
                $this->{$action}($nonStockItem);
            }
        }
        Log::info('Non Stock Item Sync Completed.');
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

    private function upsert(array $data): void
    {
        $nonStockItemId = $data['InventoryID']['value'] ?? null;

        if (!$nonStockItemId) {
            Log::warning("Skipping stock Item with missing Non-StockItemID $nonStockItemId.");
            return;
        }

        echo "Syncing Non-StockItem ID: {$nonStockItemId}" . PHP_EOL;

        $payload = [
            'stock_item_id' => $nonStockItemId,
            'item_name' => $data['Description']['value'] ?? 'No Name',
            'item_code' => $data['InventoryID']['value'] ?? null,
            'description' => $data['Description']['value'] ?? '',
            'cost' => $data['CurrentStdCost']['value'] ?? 0,
            'price' => $data['DefaultPrice']['value'] ?? 0,
            'inventory_locations' => !empty($entries) ? ['entries' => $entries] : [],
            'default_location' => $data['DefaultWarehouseID']['value'] ?? null,
            'vendor' => $data['PreferredVendor']['value'] ?? null,
            'item_type' => $data['ItemType']['value'] ?? null,
        ];

        $this->sendRequest(
            'put',
            '/integrations/inventory/upsert',
            $payload,
            $nonStockItemId
        );
    }

    private function delete(array $data): void
    {
        $inventoryId = $data['InventoryID']['value'] ?? null;
        if (! $inventoryId) {
            Log::warning("Skipping inventory with missing InventoryID $inventoryId.");
            return;
        }

        $payload = [
            'stock_item_id' => $inventoryId,
        ];

        $this->sendRequest('post', '/integrations/inventory/delete', $payload, $inventoryId);
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
                    Log::info("Successfully synced Non-Stock Item ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Non-Stock Item ID: {$recordId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    Log::error($responseData);
                    if (is_string($responseData) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Non-Stock Item ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Non-Stock Item ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Non-Stock Item ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync Non-Stock Item ID: {$recordId} after $maxAttempts attempts.");
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

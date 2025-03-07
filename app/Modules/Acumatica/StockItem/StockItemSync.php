<?php

namespace App\Modules\Acumatica\StockItem;

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

class StockItemSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(?string $file = null): void
    {
        Log::info('Starting Stock Item Sync...');
        $inputDirectoryPath = config('filesystems.acumatica.path');
        $directory = Storage::disk('local')->path("$inputDirectoryPath/StockItem/");

        if ($file) {
            $filePath = Storage::disk('local')->path("$inputDirectoryPath/StockItem/$file");
            $stockItems = $this->loadFromFile($filePath, 'StockItem');

            if (!$stockItems || empty($stockItems)) {
                Log::info('No stockItems found in the JSON file: ' . $file);
                return;
            }

            foreach ($stockItems as $stockItem) {
                if (is_array($stockItem)) {
                    $this->upsert($stockItem);
                }
            }

            Log::info('StockItem Sync Completed.');
            return;
        }

        $files = File::files($directory);
        $jsonFiles = collect($files)->filter(function ($file) {
            return preg_match('/StockItem-acu-response\d+\.json$/', $file->getFilename());
        })->sortBy(fn($file) => (int) filter_var($file->getFilename(), FILTER_SANITIZE_NUMBER_INT));

        if ($jsonFiles->isEmpty()) {
            Log::warning("No StockItem JSON files found. Fetching fresh data...");
            Acumatica::fetchAndSaveDataInChunks('StockItem', [
                '$expand' => 'WarehouseDetails',
                '$select' => 'InventoryID,Description,WarehouseDetails/WarehouseID,WarehouseDetails/QtyOnHand,ItemClass,BaseUOM,CurrentStdCost,DefaultPrice,DefaultWarehouseID,WarehouseDetails/PreferredVendor',
            ]);
            return;
        }

        foreach ($jsonFiles as $file) {
            $filePath = $file->getPathname();
            Log::info("Processing file: " . $file->getFilename());

            $stockItems = $this->loadFromFile($filePath, 'StockItem');

            if (!$stockItems || empty($stockItems)) {
                Log::info('No stockItems found in the JSON file: ' . $file->getFilename());
                continue;
            }

            foreach ($stockItems as $stockItem) {
                if (is_array($stockItem)) {
                    $this->upsert($stockItem);
                }
            }
        }

        Log::info('StockItem Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Stock Item Sync...');
        if (empty($records)) {
            Log::info('Empty Stock Item records.');
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $stockItem) {
            if (is_array($stockItem)) {
                $this->{$action}($stockItem);
            }
        }
        Log::info('Stock Item Sync Completed.');
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
        $stockItemId = $data['InventoryID']['value'] ?? null;

        if (!$stockItemId) {
            Log::warning("Skipping stock Item with missing StockItemID $stockItemId.");
            return;
        }

        echo "Syncing StockItem ID: {$stockItemId}" . PHP_EOL;

        $warehouseDetails = $data['WarehouseDetails'] ?? [];

        $entries = collect($warehouseDetails)
            ->map(function ($warehouse, $index) {
                return [
                    'index' => "item-{$index}",
                    'location-item-0' => $warehouse['WarehouseID']['value'] ?? '',
                    'quantity-item-0' => $warehouse['QtyOnHand']['value'] ?? 0,
                ];
            })
            ->values()
            ->all();

        $payload = [
            'stock_item_id' => $stockItemId,
            'item_name' => $data['Description']['value'] ?? 'No Name',
            'item_code' => $data['InventoryID']['value'] ?? null,
            'description' => $data['Description']['value'] ?? '',
            'cost' => $data['CurrentStdCost']['value'] ?? 0,
            'price' => $data['DefaultPrice']['value'] ?? 0,
            'inventory_locations' => !empty($entries) ? ['entries' => $entries] : [],
            'default_location' => $data['DefaultWarehouseID']['value'] ?? null,
            'vendor' => $data['PreferredVendor']['value'] ?? null,
        ];

        $this->sendRequest(
            'put',
            '/integrations/inventory/upsert',
            $payload,
            $stockItemId
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
                    Log::info("Successfully synced StockItem ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync StockItem ID: {$recordId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    Log::error($responseData);
                    if (is_string($responseData) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for StockItem ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync StockItem ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing StockItem ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync StockItem ID: {$recordId} after $maxAttempts attempts.");
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

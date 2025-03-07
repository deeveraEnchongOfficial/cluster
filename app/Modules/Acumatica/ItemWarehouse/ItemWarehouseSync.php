<?php

namespace App\Modules\Acumatica\ItemWarehouse;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\TSM;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;
use LogicException;

class ItemWarehouseSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Item Warehouse Sync...');

        if (! $records || empty($records)) {
            Log::info('Empty item warehouse array.');
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $warehouseData) {
            if (is_array($warehouseData)) {
                $this->{$action}($warehouseData);
            }
        }

        Log::info('Item Warehouse Sync Completed.');
    }

    private function upsert(array $data): void
    {

        $warehouseId = $data['WarehouseID']['value'] ?? null;
        if (!$warehouseId) {
            Log::warning("Skipping Item Warehouse with missing Warehouse ID $warehouseId.");
            return;
        }

        $inventoryId = $data['InventoryID']['value'] ?? null;
        if (!$warehouseId) {
            Log::warning("Skipping Item Warehouse with missing Inventory ID $inventoryId.");
            return;
        }

        echo "Syncing Item Warehouse ID: {$warehouseId} with Inventory ID: {$inventoryId}" . PHP_EOL;

        $payload = [
            'inventory_id' => $inventoryId,
            'location' => $warehouseId,
            'quantity' => $data['Quantity']['value'] ?? 0,
        ];

        $maxAttempts = 5;
        $attempt = 0;
        $delay = 2;

        while ($attempt < $maxAttempts) {
            try {
                $response = TSM::request('put', '/integrations/inventory/upsert-inventory-location', $payload);
                $responseData = $response->json();

                if ($response->successful()) {
                    Log::info("Successfully synced Item Warehouse ID: {$warehouseId}");
                    app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    $this->logError("Attempt $attempt: Failed to sync Item Warehouse ID: {$warehouseId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if (is_string($responseData['exception_message']) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Item Warehouse ID: {$warehouseId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Warehouse ID: {$warehouseId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Item Warehouse ID: {$warehouseId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync Item Warehouse ID: {$warehouseId} after $maxAttempts attempts.");
    }

    private function logError(string $errorMsg): void
    {
        Log::error($errorMsg);
        echo $errorMsg . PHP_EOL;
        app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
    }
}

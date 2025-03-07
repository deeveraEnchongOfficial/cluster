<?php

namespace App\Modules\Acumatica\Warehouse;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\TSM;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class WarehouseSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(array $warehouse = [], bool $isFromFile = true): void
    {
        Log::info('Starting Warehouse Sync...');
        $inputDirectoryPath = config('filesystems.acumatica.path');
        $filePath = Storage::disk('local')->path("$inputDirectoryPath/Warehouse/Warehouse-acu-response.json");

        $warehouse = $isFromFile ? $this->loadFromFile($filePath) : $warehouse;

        if (!$warehouse || empty($warehouse)) {
            Log::info('No warehouse found in the JSON file.');
            return;
        }

        foreach ($warehouse as $warehouseData) {
            if (is_array($warehouseData)) {
                $this->upsert($warehouseData);
            }
        }

        Log::info('Warehouse Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Warehouse Sync...');
        if (! $records || empty($records)) {
            Log::warning('Records array is empty.');
            return;
        }
        foreach ($records as $warehouseData) {
            if (is_array($warehouseData)) {
                $this->upsert($warehouseData);
            }
        }
        Log::info('Warehouse Sync Completed.');
    }

    private function loadFromFile($filePath): ?array
    {
        if (!File::exists($filePath)) {
            Log::error("Warehouse JSON file not found at: " . $filePath);
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

    private function upsert(array $data, ?Transaction $transaction = null): void
    {

        $warehouseId = $data['WarehouseID']['value'] ?? null;

        if (!$warehouseId) {
            Log::warning("Skipping stock Item with missing WarehouseID $warehouseId.");
            return;
        }

        echo "Syncing Warehouse ID: {$warehouseId}" . PHP_EOL;

        $payload = [
            'warehouse_id' => $warehouseId,
            'name' => $data['Description']['value'] ?? 'No Name',
        ];

        $this->sendRequest(
            'put',
            '/integrations/inventory/upsert-warehouse',
            $payload,
            $warehouseId
        );
    }

    private function delete(array $data): void
    {
        $warehouseId = $data['Warehouse']['value'] ?? null;
        if (! $warehouseId) {
            Log::warning("Skipping warehouse with missing Item WarehouseID $warehouseId.");
            return;
        }

        $payload = [
            'warehouse_id' => $warehouseId,
        ];

        $this->sendRequest('post', '/integrations/inventory/delete-warehouse', $payload, $warehouseId);
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
                    Log::info("Successfully synced Warehouse ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Warehouse ID: {$recordId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    Log::error($responseData);
                    if (is_string($responseData) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Warehouse ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Warehouse ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Warehouse ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync Warehouse ID: {$recordId} after $maxAttempts attempts.");
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

<?php

namespace App\Modules\Acumatica\Contact;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\Acumatica;
use App\Facades\TSM;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use LogicException;

class ContactSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(): void
    {
        Log::info('Starting Contact Sync...');
        $inputDirectoryPath = config('filesystems.acumatica.path');
        $filePath = Storage::disk('local')->path("$inputDirectoryPath/Contact/Contact-acu-response.json");

        if (!Storage::disk('local')->exists("$inputDirectoryPath/Contact/Contact-acu-response.json")) {
            Log::warning("Contact JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('Contact');
        }

        $contacts = $this->loadContactsFromFile($filePath);

        if (!$contacts || empty($contacts)) {
            Log::info('No contacts found in the JSON file.');
            return;
        }

        foreach ($contacts as $contactData) {
            if (is_array($contactData)) {
                $this->upsert($contactData);
            }
        }

        Log::info('Contact Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Contact Sync...');
        if (empty($records)) {
            Log::info('Empty Contact records.');
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $contactData) {
            if (is_array($contactData)) {
                $this->{$action}($contactData);
            }
        }
        Log::info('Contact Sync Completed.');
    }

    private function loadContactsFromFile($filePath): ?array
    {
        if (!File::exists($filePath)) {
            Log::error("Contact JSON file not found at: " . $filePath);
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

    private function extractPhones(array $data): array
    {
        $mobile = '';
        $phone  = '';

        for ($i = 1; $i <= 4; $i++) {
            $phoneValue = $data["Phone{$i}"]['value'] ?? '';
            $phoneType  = $data["Phone{$i}Type"]['value'] ?? '';

            if (!empty($phoneValue)) {
                if ($phoneType === 'Cell' && empty($mobile)) {
                    $mobile = $phoneValue;
                } elseif (empty($phone)) {
                    $phone = $phoneValue;
                }
            }
        }

        return compact('mobile', 'phone');
    }

    private function upsert(array $data): void
    {
        $contactId = $data['ContactID']['value'] ?? null;

        if (!$contactId) {
            Log::warning("Skipping contact with missing ContactID $contactId.");
            return;
        }

        echo "Syncing Contact ID: {$contactId}" . PHP_EOL;

        $phoneNumbers = $this->extractPhones($data);

        $payload = [
            'id'          => $contactId,
            'first_name'  => $data['FirstName']['value'] ?? $data['LastName']['value'] ?? $data['DisplayName']['value'] ?? 'No Name',
            'middle_name' => $data['MiddleName']['value'] ?? '',
            'last_name'   => $data['LastName']['value'] ?? '',
            'email'       => $data['Email']['value'] ?? '',
            'mobile'      => $data['Phone']['value'] ?? $phoneNumbers['mobile'],
            'phone'       => $data['Mobile']['value'] ?? $phoneNumbers['phone'],
            'website'     => $data['Website']['value'] ?? null,
            'status'      => $data['Status']['value'] ?? '',
            'address1'    => $data['Address']['AddressLine1']['value'] ?? null,
            'address2'    => $data['Address']['AddressLine2']['value'] ?? null,
            'city'        => $data['Address']['City']['value'] ?? null,
            'state'       => $data['Address']['State']['value'] ?? null,
            'zip_code'    => $data['ZipCode']['value'] ?? null,
            'country'     => $data['Address']['Country']['value'] ?? null,
        ];

        $this->sendRequest(
            'put',
            '/integrations/contacts/upsert',
            $payload,
            $contactId
        );
    }

    private function logError(string $errorMsg): void
    {
        Log::error($errorMsg);
        echo $errorMsg . PHP_EOL;
        if (! $this->transaction || ! empty($this->transaction)) {
            app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
        }
    }

    private function delete(array $data): void
    {
        $contactId = $data['ContactID']['value'] ?? null;
        if (! $contactId) {
            Log::warning("Skipping contact with missing ContactID $contactId.");
            return;
        }

        $payload = [
            'id' => $contactId,
        ];

        $this->sendRequest('delete', '/integrations/contacts/delete', $payload, $contactId);
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
                    Log::info("Successfully synced Contact ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Contact ID: {$recordId} - Status: 500");
                    // return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if (str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Contact ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Contact ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Contact ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync Contact ID: {$recordId} after $maxAttempts attempts.");
    }
}

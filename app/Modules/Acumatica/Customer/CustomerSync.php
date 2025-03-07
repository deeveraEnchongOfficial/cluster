<?php

namespace App\Modules\Acumatica\Customer;

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

class CustomerSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function sync(): void
    {
        Log::info('Starting Customer Sync...');
        $inputDirectoryPath = config('filesystems.acumatica.path');
        $filePath = Storage::disk('local')->path("$inputDirectoryPath/Customer/Customer-acu-response.json");
        $business_account_json = Storage::disk('local')->path("$inputDirectoryPath/BusinessAccount/BusinessAccount-acu-response.json");

        if (!Storage::disk('local')->exists("$inputDirectoryPath/Customer/Customer-acu-response.json")) {
            Log::warning("Customer JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('Customer',[
                '$expand' => 'MainContact',
                '$select' => 'CustomerID,CustomerName,CustomerClass,MainContact/Email,MainContact/Phone1,MainContact/Address/AddressLine1,MainContact/Address/AddressLine2,MainContact/Address/City,MainContact/Address/State,MainContact/Address/PostalCode,PrimaryContactID'
            ]);
        }

        if (!Storage::disk('local')->exists("$inputDirectoryPath/BusinessAccount/BusinessAccount-acu-response.json")) {
            Log::warning("Business Account JSON file not found. Fetching fresh data...");
            Acumatica::fetchAndSaveData('BusinessAccount');
        }

        $customer = $this->loadFromFile($filePath, 'Customer');
        $businessAccounts = $this->loadFromFile($business_account_json, 'Business Account');

        if (!$customer || empty($customer)) {
            Log::info('No customer found in the JSON file.');
            return;
        }

        if (!$businessAccounts || empty($businessAccounts)) {
            Log::info('No Business Account found in the JSON file.');
            return;
        }

        foreach ($customer as $customerData) {
            if (is_array($customerData)) {
                $this->upsert($customerData, $businessAccounts);
            }
        }

        Log::info('Customer Sync Completed.');
    }

    public function syncByRecords(array $records): void
    {
        Log::info('Starting Customer Sync...');
        if (empty($records)) {
            Log::info('Empty Customer records.');
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $contactData) {
            if (is_array($contactData)) {
                $this->{$action}($contactData, []);
            }
        }
        Log::info('Customer Sync Completed.');
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

    private function upsert(array $data, array $businessAccounts): void
    {
        $customerId = $data['CustomerID']['value'] ?? null;

        if (!$customerId) {
            Log::warning("Skipping customer with missing CustomerID $customerId.");
            return;
        }

        echo "Syncing Customer ID: {$customerId}" . PHP_EOL;

        $phoneNumbers = $this->extractPhones($data['MainContact'] ?? []);

        $filteredBusinessAccount = collect($businessAccounts)->first(
            fn($account) =>
            isset($account['BusinessAccountID']['value']) && $account['BusinessAccountID']['value'] == $customerId
        );

        $payload = [
            'customer_id'  => $customerId,
            'account_name' => $data['CustomerName']['value'] ?? '',
            'email'      => $data['Email']['value'] ?? $data['MainContact']['Email']['value'] ?? '',
            'mobile'     => $data['Mobile']['value'] ?? $phoneNumbers['mobile'] ?? '',
            'phone'      => $data['Phone']['value'] ?? $phoneNumbers['phone'] ?? '',
            'primary_contact_id' => $data['PrimaryContactID']['value'] ?? '',
            'parent_company' => $filteredBusinessAccount ? ($filteredBusinessAccount['Name']['value'] ?? '') : ($data['ParentAccount']['value'] ?? ''),
            'address1'    => $data['AddressLine1']['value'] ?? null,
            'address2'    => $data['AddressLine2']['value'] ?? null,
            'city'        => $data['City']['value'] ?? null,
            'state'       => $data['State']['value'] ?? null,
            'zip'    => $data['ZipCode']['value'] ?? null,
            'country'     => $data['CountryID']['value'] ?? null,
            'website'     => $data['Website']['value'] ?? null,
        ];

        $this->sendRequest(
            'put',
            '/integrations/accounts/upsert',
            $payload,
            $customerId
        );
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

    private function delete(array $data): void
    {
        $customerId = $data['CustomerID']['value'] ?? null;
        if (! $customerId) {
            Log::warning("Skipping customer with missing CustomerID $customerId.");
            return;
        }

        $payload = [
            'customer_id' => $customerId,
        ];

        $this->sendRequest('post', '/integrations/accounts/delete', $payload, $customerId);
    }

    private function sendRequest(
        string $method,
        string $endpoint,
        array $payload,
        string $recordId
    ): void {
        $maxAttempts = 5; // Increased to allow handling rate limits
        $attempt = 0;
        $delay = 2; // Initial delay (seconds)

        while ($attempt < $maxAttempts) {
            try {
                $response = TSM::request($method, $endpoint, $payload);
                $responseData = $response->json();

                if ($response->successful()) {
                    Log::info("Successfully synced Customer ID: {$recordId}");
                    if (! empty($this->transaction)) {
                        app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    }
                    return; // Exit loop if successful
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Customer ID: {$recordId} - Status: 500");
                    // return;
                }

                // Check if the error is "Too Many Attempts."
                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if (is_string($responseData['exception_message']) && str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Customer ID: {$recordId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Customer ID: {$recordId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                $this->logError("Error syncing Customer ID: {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2; // Increase delay with each retry
        }

        $this->logError("Failed to sync Customer ID: {$recordId} after $maxAttempts attempts.");
    }

    private function logError(string $errorMsg): void
    {
        Log::error($errorMsg);
        echo $errorMsg . PHP_EOL;
        if (! empty($this->transaction)) {
            app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
        }
    }
}

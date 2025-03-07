<?php

namespace App\Modules\Acumatica\Lead;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Facades\Acumatica;
use App\Facades\TSM;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class LeadSync
{
    public function sync(): void
    {
        Log::info('Starting Lead Sync...');
        $filePath = Storage::disk('local')->path('acumatica-api-response/lead-acu-response.json');

        $leads = $this->loadLeadsFromFile($filePath);

        if (!$leads || empty($leads)) {
            Log::info('No leads found in the JSON file.');
            return;
        }

        foreach ($leads as $leadData) {
            if (is_array($leadData)) {
                $this->upsert($leadData);
            }
        }

        Log::info('Lead Sync Completed.');
    }

    private function loadLeadsFromFile($filePath): ?array
    {
        if (!File::exists($filePath)) {
            Log::error("Lead JSON file not found at: " . $filePath);
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
        $leadId = $data['LeadID']['value'] ?? null;

        if (!$leadId) {
            Log::warning("Skipping lead with missing LeadID $leadId.");
            return;
        }

        echo "Syncing Lead ID: {$leadId}" . PHP_EOL;

        $phoneNumbers = $this->extractPhones($data);

        $payload = [
            'id'         => $leadId,
            'first_name'  => $data['FirstName']['value'] ?? $data['LastName']['value'] ?? $data['DisplayName']['value'] ?? 'No Name',
            'middle_name' => $data['MiddleName']['value'] ?? '',
            'last_name'   => $data['LastName']['value'] ?? '',
            'email'      => $data['Email']['value'] ?? '',
            'mobile'     => $phoneNumbers['mobile'] ?? '',
            'phone'      => $phoneNumbers['phone'] ?? '',
            'company' => $data['CompanyName']['value'] ?? '',
            'designation' => $data['Description']['value'] ?? '',
        ];

        $maxAttempts = 5;
        $attempt = 0;
        $delay = 2;

        while ($attempt < $maxAttempts) {
            try {
                $response = TSM::request('put', '/integrations/leads/upsert', $payload);
                $responseData = $response->json();

                if ($response->successful()) {
                    Log::info("Successfully synced Lead ID: {$leadId}");
                    return;
                } elseif ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    Log::warning("Attempt $attempt: Failed to sync Lead ID: {$leadId} - Status: 500");
                    return;
                }

                if (isset($responseData['error']) && $responseData['error'] === "exception_occurred") {
                    if (str_contains($responseData['exception_message'] ?? '', 'Too Many Attempts')) {
                        echo "Rate limit hit for Lead ID: {$leadId}. Retrying in {$delay} seconds..." . PHP_EOL;
                        sleep($delay);
                        $delay *= 2; // Exponential backoff (2s → 4s → 8s ...)
                        continue;
                    }
                }

                Log::warning("Attempt $attempt: Failed to sync Lead ID: {$leadId} - Status: {$response->status()}");
            } catch (\Exception $e) {
                Log::error("Error syncing Lead ID: {$leadId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        Log::error("Failed to sync Lead ID: {$leadId} after $maxAttempts attempts.");
    }
}

<?php

namespace App\Services\Acumatica;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class AcumaticaApiService
{
    private $base_url;
    private $name;
    private $password;
    private $tenant;
    private $api_version;
    private $cookies;

    public function __construct(array $config = [])
    {
        $this->base_url = $config['base_url'];
        $this->name = $config['name'];
        $this->password = $config['password'];
        $this->tenant = $config['tenant'];
        $this->api_version = $config['api_version'];
        $this->cookies = Cache::get('acumatica_cookies', []);
    }

    public function authenticate()
    {
        if (!empty($this->cookies)) {
            Log::info("Using cached authentication session.");
            return true;
        }

        $url = "{$this->base_url}/entity/auth/login";
        Log::info("Authenticating with Acumatica at: " . $url);

        $maxAttempts = 3;
        $attempt = 0;
        $delay = 5;

        while ($attempt < $maxAttempts) {
            try {
                $response = Http::withOptions(['timeout' => 600]) // Set to 10 minutes
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, [
                        'name'     => $this->name,
                        'password' => $this->password,
                        'tenant'   => $this->tenant,
                    ]);

                if ($response->successful()) {
                    $this->cookies = $this->extractCookies($response->cookies());
                    Cache::put('acumatica_cookies', $this->cookies, now()->addMinutes(55));
                    Log::info("Authentication successful", ['cookies' => $this->cookies]);
                    return true;
                }

                Log::warning("Authentication failed, attempt: $attempt, Status: {$response->status()}");
                sleep($delay);
                $delay *= 2;
                $attempt++;
            } catch (\Exception $e) {
                Log::error("Authentication error: " . $e->getMessage());
                sleep($delay);
                $delay *= 2;
                $attempt++;
            }
        }

        Log::error("Authentication failed after $maxAttempts attempts.");
        return false;
    }

    private function extractCookies($cookieJar)
    {
        $cookiesArray = [];
        foreach ($cookieJar as $cookie) {
            $cookiesArray[$cookie->getName()] = $cookie->getValue();
        }
        return $cookiesArray;
    }

    public function fetchData($endpoint, $queryParams = [])
    {
        if (!$this->authenticate()) {
            Log::error("Authentication failed. Cannot fetch data.");
            return ['error' => 'Authentication failed'];
        }

        $queryString = !empty($queryParams) ? '?' . http_build_query($queryParams) : '';
        $url = "{$this->base_url}/entity/Default/{$this->api_version}{$endpoint}{$queryString}";

        Log::info("Fetching data from Acumatica", ['url' => $url]);

        $maxAttempts = 5;
        $attempt = 0;
        $delay = 5;

        while ($attempt < $maxAttempts) {
            try {
                $startTime = microtime(true);

                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->withCookies($this->cookies, parse_url($this->base_url, PHP_URL_HOST))
                ->timeout(600) // Set timeout to 10 minutes
                ->get($url);

                $endTime = microtime(true);
                Log::info("Acumatica API response time: " . round($endTime - $startTime, 2) . " seconds");

                if ($response->successful()) {
                    $data = $response->json();
                    if (empty($data)) {
                        Log::warning("Empty response received from Acumatica.");
                        return ['error' => 'Empty response from Acumatica'];
                    }
                    return $data;
                }

                Log::warning("Attempt $attempt: Failed to fetch data - Status: {$response->status()}");

                if ($response->status() == Response::HTTP_TOO_MANY_REQUESTS) {
                    Log::warning("Rate limit exceeded. Retrying in {$delay} seconds...");
                    sleep($delay);
                    $delay *= 2;
                    $attempt++;
                    continue;
                }

                break;
            } catch (\Exception $e) {
                Log::error("Error fetching data from Acumatica: " . $e->getMessage());
                sleep($delay);
                $delay *= 2;
                $attempt++;
            }
        }

        Log::error("Failed to fetch data after $maxAttempts attempts.");
        return ['error' => 'Failed to fetch data after multiple attempts'];
    }

    public function fetchAndSaveData(string $entity, $queryParams = []): void
    {
        echo "Starting Fetch for entity: {$entity}..." . PHP_EOL;

        $response = $this->fetchData("/$entity", $queryParams);

        if (empty($response) || isset($response['error'])) {
            echo "No records found for entity: $entity." . PHP_EOL;
            Log::error("No records found for entity: {$entity}. Error: " . ($response['error'] ?? 'Unknown error'));
            return;
        }

        $fileName = "$entity-acu-response.json";
        $inputDirectoryPath = config('filesystems.acumatica.path');

        Storage::disk('local')->put("$inputDirectoryPath/$entity/$fileName", json_encode($response, JSON_PRETTY_PRINT));
        echo "Saved file: $fileName with " . count($response) . " items." . PHP_EOL;

        echo "Fetch for entity: $entity completed." . PHP_EOL;
    }

    public function fetchAndSaveDataInChunks(string $entity, $queryParams = []): void
    {
        echo "Starting chunked fetch for entity: {$entity}..." . PHP_EOL;

        $top = $queryParams['$top'] ?? 2500;
        $skip = 0;
        $fileIndex = 1;

        while (true) {
            echo "Fetching records from $skip to " . ($skip + $top) . PHP_EOL;

            $queryParams['$top'] = $top;
            $queryParams['$skip'] = $skip;
            // $queryParams['$expand'] = 'Details';

            $response = $this->fetchData("/$entity", $queryParams);

            if (empty($response) || isset($response['error']) || count($response) === 0) {
                echo "No more records found. Stopping fetch." . PHP_EOL;
                break;
            }

            $fileName = "$entity-acu-response{$fileIndex}.json";
            $inputDirectoryPath = config('filesystems.acumatica.path');

            Storage::disk('local')->put("$inputDirectoryPath/$entity/$fileName", json_encode($response, JSON_PRETTY_PRINT));

            echo "Saved file: $fileName with " . count($response) . " records." . PHP_EOL;

            $skip += $top;
            $fileIndex++;
        }

        echo "Chunked fetch for entity: $entity completed." . PHP_EOL;
    }

    public function fetchReportData(string $customerID)
    {
        if (!$this->authenticate()) {
            Log::error("Authentication failed. Cannot fetch report data.");
            return ['error' => 'Authentication failed'];
        }

        $url = "{$this->base_url}/entity/Report/{$this->api_version}/CustomerStatement";
        Log::info("Fetching report data from Acumatica", ['url' => $url]);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/pdf',
            ])
            ->withCookies($this->cookies, parse_url($this->base_url, PHP_URL_HOST))
            ->timeout(600)
            ->post($url, [
                'CustomerID' => ['value' => $customerID],
            ]);

            if ($response->status() == 202) {
                $pdfUrl = $response->header('Location');

                if (!$pdfUrl) {
                    Log::error("Missing 'Location' header in response.");
                    return ['error' => 'Missing report download URL'];
                }

                if (!filter_var($pdfUrl, FILTER_VALIDATE_URL)) {
                    $pdfUrl = rtrim($this->base_url, '/') . '/' . ltrim($pdfUrl, '/');
                }

                Log::info("Report generation started. Polling for availability...", ['polling_url' => $pdfUrl]);

                $maxRetries = 10;
                $retryDelay = 5;
                $storagePath = rtrim(config('filesystems.acumatica.statement_of_account.path'), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'reports' . DIRECTORY_SEPARATOR;
                $fileName = "{$customerID}_soa.pdf";
                Storage::makeDirectory($storagePath);

                for ($i = 0; $i < $maxRetries; $i++) {
                    sleep($retryDelay);

                    $pdfResponse = Http::withHeaders([
                        'Accept' => 'application/pdf',
                    ])
                    ->withCookies($this->cookies, parse_url($this->base_url, PHP_URL_HOST))
                    ->timeout(600)
                    ->get($pdfUrl);

                    $contents = $pdfResponse->body();

                    if (!empty($contents)) {
                        $filePath = "{$storagePath}{$fileName}";
                        Storage::put($filePath, $contents);
                        Log::info("Report successfully saved", ['file_path' => $filePath]);
                        return ['success' => true, 'file_path' => $filePath];
                    }
                }

                Log::error("Report generation timed out after multiple retries.");
                return ['error' => 'Report not ready after multiple attempts'];
            }

            Log::warning("Failed to fetch report - Status: {$response->status()}");
        } catch (\Exception $e) {
            Log::error("Error fetching report data: " . $e->getMessage());
        }

        return ['error' => 'Failed to fetch report'];
    }
}

<?php

namespace App\Services\TheSalesMachine;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TSMApiService
{
    public function __construct(
        private string $tsmBaseUrl,
        private string $tsmApiKey
    ) {
        $this->tsmBaseUrl = rtrim($tsmBaseUrl, '/');
        $this->tsmApiKey = $tsmApiKey;
    }

    public function request(string $method, string $endpoint, $data)
    {
        $url = rtrim($this->tsmBaseUrl, '/') . '/' . ltrim($endpoint, '/');

        try {
            $response = Http::withOptions(['allow_redirects' => true])
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                    'x-api-key'    => $this->tsmApiKey
                ])
                ->{$method}($url, $data);

            return $response;
        } catch (\Exception $e) {
            Log::error('TSMApiService Error', [
                'Message' => $e->getMessage(),
                'Trace'   => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'TSM API request failed'], 500);
        }
    }
}

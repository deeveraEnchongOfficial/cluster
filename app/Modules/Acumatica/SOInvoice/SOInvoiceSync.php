<?php

namespace App\Modules\Acumatica\SOInvoice;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Facades\TSM;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsCompleted;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Transaction;
use LogicException;

class SOInvoiceSync
{
    public function __construct(private ?Transaction $transaction) {}

    public function syncByRecords(array $records): void
    {
        Log::info('Starting SOInvoice Sync...');
        if (! $records || empty($records)) {
            Log::warning("No SOInvoices found.");
            return;
        }
        if (! method_exists($this, $action = $this->transaction->action)) {
            throw new LogicException('Method does not exist.');
        }
        foreach ($records as $invoiceData) {
            $this->{$action}($invoiceData);
        }
        Log::info('SOInvoice Sync Completed.');
    }

    private function upsert(array $data): void
    {
        $orderNbr = $data['OrderNbr']['value'] ?? '';
        $invoiceNbr = $data['InvoiceNbr']['value'] ?? '';

        $payload = [
            'order_nbr' => $orderNbr,
            'invoice_nbr' => $invoiceNbr,
            'customer_name' => $data['CustomerName']['value'] ?? null,
            'invoice_type' => $data['InvoiceType']['value'] ?? null,
            'status' => $data['Status']['value'] ?? null,
            'invoice_amount' => $data['Amount']['value'] ?? 0,
            'remarks' => $data['Description']['value'] ?? 'N/A',
        ];

        $this->sendRequest(
            'put',
            '/integrations/deals/upsert-invoice',
            $payload,
            $invoiceNbr
        );
    }

    private function delete(array $data): void
    {
        $invoiceNbr = $data['InvoiceNbr']['value'] ?? null;
        if (! $invoiceNbr) {
            Log::warning("Skipping invoice with missing Invoice ID $invoiceNbr.");
            return;
        }

        $payload = [
            'invoice_nbr' => $invoiceNbr,
        ];

        $this->sendRequest('post', '/integrations/deals/delete-invoice', $payload, $invoiceNbr);
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
                    Log::info("Successfully synced SOInvoice For ID(s): {$recordId}");
                    app(MarkTransactionAsCompleted::class)->execute($this->transaction);
                    return;
                }

                // Handle HTTP 500 (Internal Server Error) - Retry
                if ($response->status() === Response::HTTP_INTERNAL_SERVER_ERROR) {
                    $errorMsg = "Attempt $attempt: Failed to sync SOInvoice ID(s): {$recordId} - Status: 500";
                    Log::warning($errorMsg);
                    echo $errorMsg . PHP_EOL;
                    app(MarkTransactionAsFailed::class)->execute($this->transaction, $errorMsg);
                }

                // Handle Rate Limit Errors
                if ($response->status() === Response::HTTP_TOO_MANY_REQUESTS) {
                    $exceptionMessage = $responseData['exception_message'] ?? '';

                    if (is_string($exceptionMessage) && str_contains($exceptionMessage, 'Too Many Attempts')) {
                        $errorMsg = "Rate limit hit for SOInvoice ID(s): {$recordId}. Retrying in {$delay} seconds...";
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
                $this->logError("Error syncing SOInvoice ID(s): {$recordId} - " . $e->getMessage());
            }

            $attempt++;
            sleep($delay);
            $delay *= 2;
        }

        $this->logError("Failed to sync SOInvoice ID(s): {$recordId} after $maxAttempts attempts.", $this->transaction);
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

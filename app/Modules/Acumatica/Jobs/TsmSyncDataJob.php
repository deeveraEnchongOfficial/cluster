<?php

namespace App\Modules\Acumatica\Jobs;

use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsFailed;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsProcessing;
use App\Modules\Acumatica\Transaction\Actions\MarkTransactionAsSynchronizing;
use App\Modules\Acumatica\Transaction\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use LogicException;

class TsmSyncDataJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private Transaction $transaction) {}

    public function handle(): void
    {
        $transaction = $this->transaction;

        $entity = $this->getEntity(collect($transaction)->toArray()['query']);
        if (! $entity || ! in_array($entity, collect(config('push_notification.mapping'))->keys()->all())) {
            $errorMsg = "Entity provided is not supported.";
            app(MarkTransactionAsFailed::class)->execute($transaction, $errorMsg);
            throw new LogicException($errorMsg);
        }

        $processor = config("push_notification.mapping.{$entity}.processor");
        if (! $processor) {
            $errorMsg = "Processor for entity {$entity} not found.";
            app(MarkTransactionAsFailed::class)->execute($transaction, $errorMsg);
            throw new LogicException($errorMsg);
        }
        app(MarkTransactionAsProcessing::class)->execute($transaction);
        tap(
            app($processor)->handle($transaction),
            function ($processedData) use ($transaction) {
                $synchronizer = config("push_notification.mapping.{$processedData['class']}.synchronizer");
                if (! $synchronizer) {
                    throw new LogicException("Synchronizer for entity {$processedData['class']} not found.");
                }
                app(MarkTransactionAsSynchronizing::class)->execute($transaction);
                app($synchronizer, [
                    'transaction' => $transaction,
                ])->syncByRecords($processedData['records']);
            }
        );
    }

    private function getEntity(string $query): string
    {
        return Str::lower(Str::replace('DSM-', '', $query));
    }
}

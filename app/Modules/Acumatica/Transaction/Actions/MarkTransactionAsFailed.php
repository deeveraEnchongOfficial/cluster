<?php

namespace App\Modules\Acumatica\Transaction\Actions;

use App\Modules\Acumatica\Transaction\Transaction;
use App\Modules\Acumatica\Transaction\TransactionStatus;

class MarkTransactionAsFailed
{
    public function execute(
        Transaction $transaction,
        string $failureReason,
    ): void {
        $transaction->update([
            'status' => TransactionStatus::FAILED,
            'failure_reason' => $failureReason,
            'failed_at' => now(),
        ]);
    }
}

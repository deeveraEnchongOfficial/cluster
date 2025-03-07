<?php

namespace App\Modules\Acumatica\Transaction\Actions;

use App\Modules\Acumatica\Transaction\TransactionStatus;

class MarkTransactionAsSynchronizing
{
    public function execute($transaction): void
    {
        $transaction->update([
            'status' => TransactionStatus::SYNCHRONIZING,
        ]);
    }
}

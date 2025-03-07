<?php

/**
 * This source file is proprietary and part of The Sales Machine.
 *
 * (c) The Sales Machine Software Inc.
 *
 * @see https://thesalesmachine.com/
 */

namespace App\Modules\Acumatica\Transaction\Actions;

use App\Modules\Acumatica\Transaction\Transaction;
use App\Modules\Acumatica\Transaction\TransactionStatus;

class MarkTransactionAsProcessing
{
    public function execute(Transaction $transaction): void
    {
        $transaction->update([
            'status' => TransactionStatus::PROCESSING,
        ]);
    }
}

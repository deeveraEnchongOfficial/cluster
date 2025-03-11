<?php

namespace App\Modules\Acumatica\Transaction\Actions;

use App\Modules\Acumatica\Transaction\Transaction;
use App\Modules\Acumatica\Transaction\TransactionStatus;

class CreateTransaction
{
    public function execute(
        string $id,
        array $data
    ): Transaction {
        $transaction = Transaction::forceMake([
            '_id' => $id,
            'status' => TransactionStatus::QUEUED,
            'queued_at' => now(),
            'action' => empty($data['Inserted']) && ! empty($data['Deleted']) ? 'delete' : 'upsert',
        ] + $data);

        $transaction->save();

        return $transaction;
    }
}

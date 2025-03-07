<?php

namespace App\Modules\Acumatica\Transaction;

class TransactionRepository
{
    public function findById(string $id): ?Transaction
    {
        return Transaction::find($id);
    }
}

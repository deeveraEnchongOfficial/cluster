<?php

namespace App\Modules\Acumatica\Lead;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessLeadTransaction
{
    public function handle(Transaction $transaction): array
    {
        $inserted = collect($transaction->inserted)->keyBy('LeadID')->all();

        $records = [];
        foreach($inserted as $key => $fields) {
            $records[] = [
            ];
        }

        return ['lead', $records];
    }
}

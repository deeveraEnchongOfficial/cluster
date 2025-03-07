<?php

namespace App\Modules\Acumatica\Warehouse;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessWarehouseTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'warehouses';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'WarehouseID' => [
                    'value' => (string) $fields['INSite_siteID'] ?? null,
                ],
                'Description' => [
                    'value' => $fields['Description'] ?? null,
                ],
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

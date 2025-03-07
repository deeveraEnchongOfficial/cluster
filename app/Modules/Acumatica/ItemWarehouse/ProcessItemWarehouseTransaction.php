<?php

namespace App\Modules\Acumatica\ItemWarehouse;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessItemWarehouseTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'itemwarehouses';
        $inserted = collect($transaction->inserted)->keyBy('Warehouse')->all();

        $records = [];
        foreach($inserted as $key => $fields) {
            $records[] = [
                'WarehouseID' => [
                    'value' => $key,
                ],
                'InventoryID' => [
                    'value' => $fields['InventoryID'] ?? null,
                ],
                'Description' => [
                    'value' => $fields['Description'] ?? null,
                ],
            ];
        }

        return compact('class', 'records');
    }
}

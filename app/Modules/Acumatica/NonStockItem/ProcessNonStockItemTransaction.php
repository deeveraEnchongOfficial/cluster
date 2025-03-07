<?php

namespace App\Modules\Acumatica\NonStockItem;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessNonStockItemTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'nonstockitems';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'InventoryID' => [
                    'value' => $fields['InventoryID'],
                ],
                'Description' => [
                    'value' => $fields['Description'],
                ],
                'CurrentStdCost' => [
                    'value' => $fields['CurrentCost'],
                ],
                'DefaultPrice' => [
                    'value' => $fields['DefaultPrice'],
                ],
                'PreferredVendor' => [
                    'value' => $fields['VendorName'],
                ],
                'PreferredVendor' => [
                    'value' => $fields['VendorName'],
                ],
                'ItemType' => [
                    'value' => $fields['Type'],
                ],
                'DefaultWarehouseID' => [
                    'value' => $fields['DefaultWarehouse']
                ],
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

<?php

namespace App\Modules\Acumatica\StockItem;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessStockItemTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'stockitems';
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
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

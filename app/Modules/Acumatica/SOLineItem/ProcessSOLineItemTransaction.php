<?php

namespace App\Modules\Acumatica\SOLineItem;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessSOLineItemTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'solineitems';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'id' => [
                    'value' => $fields['OrderNbr'],
                ],
                'Amount' => [
                    'value' => $fields['SOLine_lineAmt'],
                ],
                'DiscountAmount' => [
                    'value' => $fields['SOLine_discAmt'],
                ],
                'ExtendedPrice' => [
                    'value' => $fields['SOLine_extPrice'],
                ],
                'Location' => [
                    'value' => $fields['Description'],
                ],
                'WarehouseID' => [
                    'value' => $fields['Warehouse'],
                ],
                'Quantity' => [
                    'value' => $fields['Quantity'],
                ],
                'InventoryID' => [
                    'value' => (string) $fields['InventoryID'],
                ],
                'OrderID' => [
                    'value' => (string) $fields['OrderNbr'],
                ],
                'SOLine_createdDateTime' => [
                    'value' => $fields['SOLine_createdDateTime'],
                ],
                'UnitPrice' => [
                    'value' => $fields['UnitPrice'],
                ],
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

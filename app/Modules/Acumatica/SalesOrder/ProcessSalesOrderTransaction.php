<?php

namespace App\Modules\Acumatica\SalesOrder;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessSalesOrderTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'salesorders';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'id' => [
                    'value' => $fields['OrderNbr'],
                ],
                'ContactID' => [
                    'value' => $fields['Contact'],
                ],
                'CreatedDate' => [
                    'value' => $fields['CreatedOn'],
                ],
                'CurrencyID' => [
                    'value' => $fields['Currency'],
                ],
                'CustomerID' => [
                    'value' => $fields['Customer'],
                ],
                'CustomerName' => [
                    'value' => $fields['CustomerName'],
                ],
                'Date' => [
                    'value' => $fields['OrderDate'] ?? $fields['Date'],
                ],
                'Description' => [
                    'value' => $fields['Description'],
                ],
                'EffectiveDate' => [
                    'value' => $fields['EffectiveDate'] ?? $fields['Date'],
                ],
                'LastModified' => [
                    'value' => $fields['LastModifiedOn'],
                ],
                'OrderedQty' => [
                    'value' => $fields['OrderedQty'],
                ],
                'OrderNbr' => [
                    'value' => $fields['OrderNbr'],
                ],
                'OrderTotal' => [
                    'value' => $fields['SOOrder_orderTotal'],
                ],
                'OrderType' => [
                    'value' => $fields['OrderType'],
                ],
                'Status' => [
                    'value' => $fields['Status'],
                ],
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

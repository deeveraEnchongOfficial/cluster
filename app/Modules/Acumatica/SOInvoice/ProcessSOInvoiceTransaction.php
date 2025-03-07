<?php

namespace App\Modules\Acumatica\SOInvoice;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessSOInvoiceTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'soinvoices';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'InvoiceNbr' => [
                    'value' => $fields['ReferenceNbr'],
                ],
                'OrderNbr' => [
                    'value' => $fields['OrderNbr'],
                ],
                'CustomerID' => [
                    'value' => $fields['Customer'],
                ],
                'InvoiceType' => [
                    'value' => $fields['Type'],
                ],
                'Status' => [
                    'value' => $fields['Status'],
                ],
                'Amount' => [
                    'value' => $fields['SOInvoice_origDocAmt'],
                ],
                'CustomerName' => [
                    'value' => $fields['CustomerName'],
                ],
                'Description' => [
                    'value' => $fields['Description'],
                ],
            ];
        })->toArray();

        return compact('class', 'records');
    }
}

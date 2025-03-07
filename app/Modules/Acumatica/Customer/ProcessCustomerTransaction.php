<?php

namespace App\Modules\Acumatica\Customer;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessCustomerTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'customers';
        $data = $transaction->action === 'upsert' ? $transaction->getRawOriginal('inserted') : $transaction->getRawOriginal('deleted');

        $records = collect($data)->map(function ($fields) {
            return [
                'CustomerID' => [
                    'value' => (string) $fields['CustomerID'] ?? null,
                ],
                'CustomerName' => [
                    'value' => $fields['CustomerName'] ?? null,
                ],
                'PrimaryContactID' => [
                    'value' => (string) $fields['PrimaryContact'] ?? null,
                ],
                'Email' => [
                    'value' => $fields['Email'] ?? null,
                ],
                'Mobile' => [
                    'value' => $fields['Phone1'] ?? null,
                ],
                'Phone' => [
                    'value' => $fields['Phone2'] ?? null,
                ],
                'Website' => [
                    'value' => $fields['Web'] ?? null,
                ],
                'Status' => [
                    'value' => $fields['CustomerStatus'] ?? null,
                ],
                'AddressLine1' => [
                    'value' => $fields['AddressLine1'] ?? null,
                ],
                'AddressLine2' => [
                    'value' => $fields['AddressLine2'] ?? null,
                ],
                'City' => [
                    'value' => $fields['City'] ?? null,
                ],
                'State' => [
                    'value' => $fields['State']
                        ? $fields['State'] .' - '. ($fields['StateName'] ?? '')
                        : null,
                ],
                'ZipCode' => [
                    'value' => $fields['PostalCode'] ?? null,
                ],
                'CountryID' => [
                    'value' => $fields['Country'] ?? null,
                ],
                'ParentAccount' => [
                    'value' => $fields['ParentAccount'] ?? null,
                ],
                'Website' => [
                    'value' => $fields['Web'] ?? null,
                ],
            ];
        })
        ->toArray();

        return compact('class', 'records');
    }
}

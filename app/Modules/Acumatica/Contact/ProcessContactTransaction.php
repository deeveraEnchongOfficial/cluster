<?php

namespace App\Modules\Acumatica\Contact;

use App\Modules\Acumatica\Transaction\Transaction;

class ProcessContactTransaction
{
    public function handle(Transaction $transaction): array
    {
        $class = 'contacts';
        $data = $transaction->action === 'upsert' ? $transaction->inserted : $transaction->getRawOriginal('deleted');
        $values = collect($data)->keyBy('ContactID')->all();

        $records = [];
        foreach($values as $key => $fields) {
            $records[] = [
                'ContactID' => [
                    'value' => $key,
                ],
                'FirstName' => [
                    'value' => $fields['FirstName'] ?? '',
                ],
                'MiddleName' => [
                    'value' => $fields['MiddleName'] ?? '',
                ],
                'LastName' => [
                    'value' => $fields['LastName'],
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
                'CustomerName' => [
                    'value' => $fields['AccountName'] ?? $fields['AccountName_2'] ?? null,
                ],
                'Status' => [
                    'value' => $fields['LeadStatus'] ?? null,
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
                    'value' => $fields['CountryID'] ?? null,
                ],
                'ParentAccountName' => [
                    'value' => $fields['ParentAccountName'] ?? null,
                ],
                'StateName' => [
                    'value' => $fields['StateName'] ?? null,
                ]
            ];
        }

        return compact('class', 'records');
    }
}

<?php
 
namespace App\Http\Controllers\Acumatica;

use App\Modules\Acumatica\Jobs\TsmSyncDataJob;
use App\Modules\Acumatica\Transaction\Actions\CreateTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GenericWebhookController
{
    public function handle(Request $request): JsonResponse
    {
        $data = validator($request->all(), [
            'Inserted' => ['nullable','array'],
            'Deleted' => ['nullable','array'],
            'Query' => ['required','string'],
            'CompanyId' => ['required','string'],
            'Id' => ['required','string'],
            'TimeStamp' => ['required','integer'],
            'AdditionalInfo' => ['nullable'],
        ])->validate();

        $transactionId = $data['Id'].'::'.$data['Query'];
        $transaction = app(CreateTransaction::class)->execute($transactionId, $data);

        TsmSyncDataJob::dispatchSync($transaction);

        return response()->json(['message' => 'success']);
    }
}

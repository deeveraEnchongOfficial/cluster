<?php

namespace App\Http\Controllers\Acumatica;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Facades\Acumatica;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StatementOfAccountController
{
    public function handle(Request $request)
    {
        $request->validate([
            'CustomerID' => 'required|string'
        ]);

        $customerId = $request->input('CustomerID');

        $reportResponse = Acumatica::fetchReportData($customerId);

        if (isset($reportResponse['error'])) {
            return response()->json(['error' => $reportResponse['error']], 500);
        }

        $filePath = $reportResponse['file_path'] ?? null;

        if (!$filePath || !Storage::exists($filePath)) {
            Log::error("Report file not found", ['file_path' => $filePath]);
            return response()->json(['error' => 'Report file not found'], 404);
        }

        return new StreamedResponse(function () use ($filePath) {
            $stream = Storage::readStream($filePath);
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . basename($filePath) . '"'
        ]);
    }
}

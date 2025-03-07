<?php

use App\Http\Controllers\Acumatica\StatementOfAccountController;
use App\Http\Controllers\Acumatica\GenericWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('com_pioneer_adhesives')
    ->middleware(['auth-api'])
    ->group(function (): void {
        Route::controller(GenericWebhookController::class)->group(function () {
            Route::post('/generic', 'handle');
        });
    });

Route::prefix('acumatica')
    ->middleware(['auth-api'])
    ->group(function (): void {
        Route::controller(StatementOfAccountController::class)->group(function () {
            Route::post('/statement-of-account', 'handle');
        });
    });

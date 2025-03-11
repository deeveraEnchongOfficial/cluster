<?php

use App\Http\Controllers\Acumatica\StatementOfAccountController;
use App\Http\Controllers\Acumatica\GenericWebhookController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('integrations')
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


Route::middleware(['guest.check'])
->group(function (): void {
    Route::post('/authenticate', [AuthController::class, 'authenticate']);
});

Route::middleware(['jwt'])
->group(function (): void {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::get('/users', [AuthController::class, 'getUsers']);
});

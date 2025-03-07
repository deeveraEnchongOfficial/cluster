<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\TheSalesMachine\TSMApiService;
use App\Facades\TSM as TSMFacade;


class TSMServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(TSMFacade::class, function () {
            return new TSMApiService(
                config('thesalesmachine.base_url'),
                config('thesalesmachine.api_key')
            );
        });

        $this->app->alias(TSMFacade::class, 'tsm');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

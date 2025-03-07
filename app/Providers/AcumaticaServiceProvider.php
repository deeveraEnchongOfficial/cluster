<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Acumatica\AcumaticaApiService;
use App\Facades\Acumatica;

class AcumaticaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Acumatica::class, function () {
            return new AcumaticaApiService([
                'base_url' => config('acumatica.base_url'),
                'name' => config('acumatica.name'),
                'password' => config('acumatica.password'),
                'tenant' => config('acumatica.tenant'),
                'api_version' =>  config('acumatica.api_version'),
            ]);
        });
        $this->app->alias(Acumatica::class, 'acumatica');
    }

    public function boot(): void
    {
        //
    }
}

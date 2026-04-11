<?php

namespace App\Http\Controllers\App\Core\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationsController extends Controller
{
    public function __construct(
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {}

    public function show(Request $request): Response
    {
        $linkedAccounts = $this->linkedAccounts->findByUser($request->user());

        return Inertia::render('Profile/Integrations/Show', [
            'linkedAccounts' => collect($linkedAccounts)->map(function ($account) {
                return [
                    'id' => $account->id,
                    'provider' => $account->provider->value,
                    'provider_label' => $account->provider->label(),
                    'features' => collect($account->features)->map(fn($feature) => [
                        'value' => $feature->value,
                        'label' => $feature->label(),
                    ]),
                    'metadata' => $account->metadata,
                    'expires_at' => $account->expires_at,
                    'is_expired' => $account->isExpired(),
                    'needs_refresh' => $account->needsRefresh(),
                    'created_at' => $account->created_at,
                ];
            }),
        ]);
    }
}

<?php

namespace App\Services\Core\LinkedAccount\Actions;

use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\User\User;
use Carbon\Carbon;

class UpsertLinkedAccount
{
    /**
     * Execute the action to upsert a linked account for external service integration.
     */
    public function execute(
        LinkedAccount $linkedAccount,
        LinkedAccountProvider $provider,
        string $providerUserId,
        string $accessToken,
        array $scopes,
        array $features,
        User $user,
        ?string $refreshToken = null,
        ?Carbon $expiresAt = null,
        array $metadata = []
    ): LinkedAccount {

        // Direct model persistence using patterns
        $linkedAccount->forceFill([
            'provider' => $provider,
            'provider_user_id' => $providerUserId,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken ?? $linkedAccount->refresh_token,
            'expires_at' => $expiresAt ?? $linkedAccount->expires_at,
            'scopes' => $scopes,
            'features' => $features,
            'metadata' => $metadata,
            'updated_at' => now(),
        ]);

        // Handle relationships using associate()
        $linkedAccount->user()->associate($user);

        // Save the model
        $linkedAccount->save();

        return $linkedAccount;
    }
}

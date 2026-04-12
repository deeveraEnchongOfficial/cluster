<?php

namespace App\Services\Core\LinkedAccount;

use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\User\User;
use Illuminate\Database\Eloquent\Collection;

class LinkedAccountRepository
{
    /**
     * Find a linked account by provider and user.
     */
    public function findAllByProviderAndUser(LinkedAccountProvider $provider, User $user): Collection
    {
        return LinkedAccount::where('user_id', $user->id)
            ->where('provider', $provider)
            ->get();
    }

    public function findByProviderIdAndUser(LinkedAccountProvider $provider, string $providerUserId, User $user): ?LinkedAccount
    {
        return LinkedAccount::where('provider_user_id', $providerUserId)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();
    }

    /**
     * Find all linked accounts for a user.
     */
    public function findByUser(User $user): Collection
    {
        return LinkedAccount::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find a linked account by provider, feature, and user.
     */
    public function findByProviderAndFeature(LinkedAccountProvider $provider, LinkedAccountFeature $feature, User $user): ?LinkedAccount
    {
        return LinkedAccount::where('user_id', $user->id)
            ->where('provider', $provider)
            ->where('features', 'all', [$feature->value])
            ->first();
    }

    /**
     * Find a linked account by ID for a specific user (tenant-aware).
     */
    public function findByIdAndUser(string $linkedAccountId, User $user): ?LinkedAccount
    {
        return LinkedAccount::where('_id', $linkedAccountId)
            ->where('user_id', $user->id)
            ->first();
    }

    public function hasGoogleDrive(User $user): bool
    {
        return LinkedAccount::where('user_id', $user->id)
            ->where('provider', LinkedAccountProvider::GOOGLE)
            ->where('features', 'all', [LinkedAccountFeature::DRIVE->value])
            ->exists();
    }
}

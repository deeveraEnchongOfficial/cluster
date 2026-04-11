<?php

namespace App\Services\Core\LinkedAccount;

use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\User\User;
use App\Support\Database\Casts\AsEnumArray;
use App\Support\Database\Traits\ServiceModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class LinkedAccount extends Model
{
    use ServiceModel;

    protected function casts(): array
    {
        return [
            'provider' => LinkedAccountProvider::class,
            'features' => AsEnumArray::of(LinkedAccountFeature::class),
            'expires_at' => 'datetime',
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
        ];
    }

    /**
     * Get the user that owns this linked account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if the access token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at?->isPast() ?? false;
    }

    /**
     * Check if the account needs token refresh.
     */
    public function needsRefresh(): bool
    {
        return $this->isExpired() && ! empty($this->refresh_token);
    }
}

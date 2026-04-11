<?php

namespace App\Services\Core\LinkedAccount\Enums;

enum LinkedAccountProvider: string
{
    case GOOGLE = 'google';

    /**
     * Get all enum values in logical order.
     */
    public static function order(): array
    {
        return [
            self::GOOGLE,
        ];
    }

    public function label(): string
    {
        return match ($this) {
            self::GOOGLE => 'Google',
        };
    }
}

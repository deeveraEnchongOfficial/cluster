<?php

namespace App\Services\Core\LinkedAccount\Enums;

enum LinkedAccountFeature: string
{

    case EMAIL = 'email';
    case CALENDAR = 'calendar';
    case DRIVE = 'drive';

    /**
     * Get all enum values in logical order.
     */
    public static function order(): array
    {
        return [
            self::EMAIL,
            self::CALENDAR,
            self::DRIVE,
        ];
    }

    public function label(): string
    {
        return match ($this) {
            self::EMAIL => 'Email',
            self::CALENDAR => 'Calendar',
            self::DRIVE => 'Drive',
        };
    }
}

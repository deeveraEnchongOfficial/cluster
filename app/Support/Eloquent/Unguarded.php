<?php

/**
 * This source file is proprietary and part of The Sales Machine.
 *
 * (c) The Sales Machine Software Inc.
 *
 * @see https://thesalesmachine.com/
 */

namespace App\Support\Eloquent;

trait Unguarded
{
    public static function bootUnguarded(): void
    {
        static::unguard();
    }
}

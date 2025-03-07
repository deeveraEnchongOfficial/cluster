<?php

/**
 * This source file is proprietary and part of The Sales Machine.
 *
 * (c) The Sales Machine Software Inc.
 *
 * @see https://thesalesmachine.com/
 */

namespace App\Support\Eloquent;

trait ForceMake
{
    public static function forceMake(array $attributes): static
    {
        return (new static)->forceFill($attributes);
    }
}

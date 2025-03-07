<?php

/**
 * This source file is proprietary and part of The Sales Machine.
 *
 * (c) The Sales Machine Software Inc.
 *
 * @see https://thesalesmachine.com/
 */

namespace App\Support\Eloquent;

trait StaticTableName
{
    private static array $tableNames = [];

    public static function getTableName(): string
    {
        if (isset(self::$tableNames[static::class])) {
            return self::$tableNames[static::class];
        }

        return self::$tableNames[static::class] = (new static)->getTable();
    }
}

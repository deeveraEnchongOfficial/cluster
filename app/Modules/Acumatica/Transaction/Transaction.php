<?php

namespace App\Modules\Acumatica\Transaction;

use App\Support\Eloquent\CamelCasing;
use App\Support\Eloquent\ForceMake;
use App\Support\Eloquent\HasStringId;
use App\Support\Eloquent\StaticTableName;
use App\Support\Eloquent\Unguarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Transaction extends Model
{
    use CamelCasing, ForceMake, HasFactory, HasStringId,  StaticTableName, Unguarded;

    protected $primaryKey = '_id';
}

<?php

namespace App\Services\Portfolio\Project;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Support\Database\Traits\ServiceModel;
use App\Support\Database\Traits\HasCreatedBy;
use App\Support\Database\Traits\HasMetadata;
use App\Support\Database\Traits\HasOwner;

class Project extends Model
{
    use HasFactory, ServiceModel, HasCreatedBy, HasMetadata, HasOwner;

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
    ];

}

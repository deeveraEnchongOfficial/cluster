<?php

namespace App\Services\Portfolio\Blog;

use App\Support\Database\Traits\HasCreatedBy;
use App\Support\Database\Traits\HasMetadata;
use App\Support\Database\Traits\HasOwner;
use App\Support\Database\Traits\ServiceModel;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasCreatedBy, HasMetadata, HasOwner, ServiceModel;

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeForUser($query, $userId = null)
    {
        $userId = $userId ?? auth()->id();
        return $query->where('owned_by_id', $userId)->where('owned_by_type', 'core.user');
    }
}

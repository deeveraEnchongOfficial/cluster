<?php

namespace App\Services\Core\Page;

use App\Services\Core\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Support\Database\Traits\HasCreatedBy;
use App\Support\Database\Traits\HasMetadata;
use App\Support\Database\Traits\HasOwner;
use App\Support\Database\Traits\ServiceModel;

class Page extends Model
{
    use HasCreatedBy, HasMetadata, HasOwner, ServiceModel, HasFactory;

    protected $casts = [
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the page.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get published pages.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get draft pages.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }
}

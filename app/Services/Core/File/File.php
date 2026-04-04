<?php

namespace App\Services\Core\File;

use App\Support\Database\Traits\HasCreatedBy;
use App\Support\Database\Traits\HasMetadata;
use App\Support\Database\Traits\HasOwner;
use App\Support\Database\Traits\ServiceModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasCreatedBy, HasMetadata, HasOwner, ServiceModel;

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_public' => 'boolean',
        'size' => 'integer',
    ];

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function getDownloadUrlAttribute(): string
    {
        return route('files.download', $this->id);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function scopeForUser($query, $userId = null)
    {
        $userId = $userId ?? auth()->id();
        return $query->where('owned_by_id', $userId)->where('owned_by_type', 'core.user');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByType($query, $mimeType)
    {
        return $query->where('mime_type', 'like', $mimeType . '%');
    }

    // public function url(): Attribute
    // {
    //     return Attribute::make(
    //         get: fn () => Storage::disk($this->disk)->url($this->path)
    //     );
    // }
}

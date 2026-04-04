<?php

/**
 * Copyright (c) The Sales Machine (thesalesmachine.com)
 *
 * This code is owned by The Sales Machine. All rights reserved.
 */

namespace App\Services\Core\File\Actions;

use App\Services\Core\File\File;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUpload
{
    /**
     * Handle file upload and create File entry
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  string|null  $name  Optional custom name
     * @param  Model|null  $uploadedBy  User who uploaded the file
     * @param  array  $metadata  Additional metadata
     * @param  bool  $isPublic  Whether file is public
     */
    public function execute(
        UploadedFile $file,
        ?string $name = null,
        ?Model $uploadedBy = null,
        array $metadata = [],
        bool $isPublic = false
    ): File {
        // TODO: Make this configurable
        $disk = 'public';

        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $hash = hash_file('sha256', $file->getPathname());

        // Generate unique filename
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('files', $fileName, $disk);

        // Create the File entry
        $fileModel = new File([
            'name' => $fileName,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'size' => $size,
            'path' => $path,
            'disk' => $disk,
            'hash' => $hash,
            'is_public' => $isPublic,
        ]);

        // Add metadata if provided
        if (!empty($metadata)) {
            $fileModel->replaceMetadata($metadata);
        }

        // Associate with user if provided
        if ($uploadedBy) {
            $fileModel->createdBy()->associate($uploadedBy);
            $fileModel->ownedBy()->associate($uploadedBy);
        }

        $fileModel->save();

        return $fileModel;
    }

    /**
     * Handle multiple file uploads
     *
     * @param  array  $files  Array of UploadedFile objects
     * @param  Model|null  $uploadedBy  User who uploaded the files
     * @param  array  $metadata  Additional metadata
     * @param  bool  $isPublic  Whether files are public
     * @return array  Array of created File models
     */
    public function executeMultiple(
        array $files,
        ?Model $uploadedBy = null,
        array $metadata = [],
        bool $isPublic = false
    ): array {
        $uploadedFiles = [];

        foreach ($files as $file) {
            $uploadedFiles[] = $this->execute($file, null, $uploadedBy, $metadata, $isPublic);
        }

        return $uploadedFiles;
    }
}

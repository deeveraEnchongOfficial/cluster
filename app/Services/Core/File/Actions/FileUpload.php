<?php

namespace App\Services\Core\File\Actions;

use App\Services\Core\File\File;
use App\Services\Core\Storage\GoogleDriveStorage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUpload
{
    private GoogleDriveStorage $googleDriveStorage;

    public function __construct(GoogleDriveStorage $googleDriveStorage)
    {
        $this->googleDriveStorage = $googleDriveStorage;
    }

    /**
     * Handle file upload and create File entry
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  string|null  $name  Optional custom name
     * @param  Model|null  $uploadedBy  User who uploaded the file
     * @param  array  $metadata  Additional metadata
     * @param  bool  $isPublic  Whether file is public
     * @param  string|null  $storageType  Storage type: 'local' or 'google_drive'
     * @param  string|null  $folderPath  Optional folder path for cloud storage
     */
    public function execute(
        UploadedFile $file,
        ?string $name = null,
        ?Model $uploadedBy = null,
        array $metadata = [],
        bool $isPublic = false,
        ?string $storageType = 'local',
        ?string $folderPath = null
    ): File {
        // Determine storage disk
        $disk = $storageType === 'google_drive' ? 'google_drive' : 'public';

        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $hash = hash_file('sha256', $file->getPathname());

        // Handle upload based on storage type
        if ($storageType === 'google_drive') {
            if (!$uploadedBy) {
                throw new \Exception('User is required for Google Drive uploads');
            }

            $driveResult = $this->googleDriveStorage
                ->setUser($uploadedBy)
                ->uploadFile($file, $folderPath);

            $path = $driveResult['path'];
            $fileName = $driveResult['name'];
            $externalId = $driveResult['id'];
            $webViewLink = $driveResult['webViewLink'];
            $webContentLink = $driveResult['webContentLink'];
        } else {
            // Generate unique filename for local storage
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('files', $fileName, $disk);
            $externalId = null;
            $webViewLink = null;
            $webContentLink = null;
        }

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
            'external_id' => $externalId,
            'web_view_link' => $webViewLink,
            'web_content_link' => $webContentLink,
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
     * @param  string|null  $storageType  Storage type: 'local' or 'google_drive'
     * @param  string|null  $folderPath  Optional folder path for cloud storage
     * @return array  Array of created File models
     */
    public function executeMultiple(
        array $files,
        ?Model $uploadedBy = null,
        array $metadata = [],
        bool $isPublic = false,
        ?string $storageType = 'local',
        ?string $folderPath = null
    ): array {
        $uploadedFiles = [];

        foreach ($files as $file) {
            $uploadedFiles[] = $this->execute($file, null, $uploadedBy, $metadata, $isPublic, $storageType, $folderPath);
        }

        return $uploadedFiles;
    }

    // upsert file without uploading
    public function upsertWithoutUpload(
        File $file,
        ?string $name = null,
        ?string $originalName = null,
        ?string $mimeType = null,
        ?int $size = null,
        ?string $path = null,
        ?string $disk = null,
        ?string $storageType = null,
        ?string $folderPath = null,
        ?string $externalId = null,
        ?string $webViewLink = null,
        ?string $webContentLink = null,
        ?Model $uploadedBy = null,
        array $metadata = [],
        bool $isPublic = false,
    ): File
    {
        // Create the File entry
        $fileData = [
            'name' => $name,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'size' => $size,
            'path' => $path,
            'disk' => $disk,
            'hash' => $disk === 'google_drive' ? null : hash_file('sha256', $path),
            'is_public' => $isPublic,
            'external_id' => $externalId,
            'web_view_link' => $webViewLink,
            'web_content_link' => $webContentLink,
        ];

        $file->forceFill($fileData);

        // Add metadata if provided
        if (!empty($metadata)) {
            $file->replaceMetadata($metadata);
        }

        // Associate with user if provided
        if ($uploadedBy) {
            $file->createdBy()->associate($uploadedBy);
            $file->ownedBy()->associate($uploadedBy);
        }

        $file->save();

        return $file;
    }
}

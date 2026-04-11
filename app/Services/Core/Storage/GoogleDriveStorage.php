<?php

namespace App\Services\Core\Storage;

use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\User\User;
use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Psr\Http\Message\StreamInterface;

class GoogleDriveStorage
{
    private Drive $driveService;
    private LinkedAccountRepository $linkedAccounts;
    private User $user;

    public function __construct(LinkedAccountRepository $linkedAccounts)
    {
        $this->linkedAccounts = $linkedAccounts;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    private function getDriveService(): Drive
    {
        if (!isset($this->driveService)) {
            $linkedAccount = $this->linkedAccounts->findByProviderAndFeature(
                LinkedAccountProvider::GOOGLE,
                LinkedAccountFeature::DRIVE,
                $this->user
            );

            if (!$linkedAccount) {
                throw new \Exception('Google Drive account not connected');
            }

            $client = new Client();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));
            $client->setAccessToken([
                'access_token' => $linkedAccount->access_token,
                'refresh_token' => $linkedAccount->refresh_token,
                'expires_in' => $linkedAccount->expires_at?->diffInSeconds(now()),
                'created' => $linkedAccount->created_at->timestamp,
            ]);

            // Refresh token if expired
            if ($linkedAccount->isExpired()) {
                $client->fetchAccessTokenWithRefreshToken($linkedAccount->refresh_token);

                // Update the linked account with new tokens
                $newTokens = $client->getAccessToken();
                $linkedAccount->access_token = $newTokens['access_token'];
                $linkedAccount->expires_at = now()->addSeconds($newTokens['expires_in']);
                $linkedAccount->save();
            }

            $this->driveService = new Drive($client);
        }

        return $this->driveService;
    }

    public function uploadFile(UploadedFile $file, ?string $folderPath = null): array
    {
        $driveService = $this->getDriveService();

        // Create folder if specified
        $folderId = null;
        if ($folderPath) {
            $folderId = $this->getOrCreateFolder($folderPath);
        }

        $fileMetadata = new DriveFile([
            'name' => $file->getClientOriginalName(),
            'parents' => $folderId ? [$folderId] : null,
        ]);

        $content = $file->get();
        $mimeType = $file->getMimeType();

        $file = $driveService->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $mimeType,
            'uploadType' => 'multipart',
            'fields' => 'id,name,size,mimeType,webViewLink,webContentLink',
        ]);

        // Set file permissions to public
        $permission = new \Google\Service\Drive\Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]);

        $driveService->permissions->create($file->getId(), $permission);

        return [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'size' => $file->getSize(),
            'mimeType' => $file->getMimeType(),
            'webViewLink' => $file->getWebViewLink(),
            'webContentLink' => $file->getWebContentLink(),
            'path' => $folderPath ? $folderPath . '/' . $file->getName() : $file->getName(),
        ];
    }

    public function uploadFromPath(string $filePath, string $fileName, ?string $folderPath = null): array
    {
        $driveService = $this->getDriveService();

        // Create folder if specified
        $folderId = null;
        if ($folderPath) {
            $folderId = $this->getOrCreateFolder($folderPath);
        }

        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => $folderId ? [$folderId] : null,
        ]);

        $content = Storage::disk('local')->get($filePath);
        $mimeType = mime_content_type($filePath);

        $file = $driveService->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $mimeType,
            'uploadType' => 'multipart',
            'fields' => 'id,name,size,mimeType,webViewLink,webContentLink',
        ]);

        // Set file permissions to public
        $permission = new \Google\Service\Drive\Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]);

        $driveService->permissions->create($file->getId(), $permission);

        return [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'size' => $file->getSize(),
            'mimeType' => $file->getMimeType(),
            'webViewLink' => $file->getWebViewLink(),
            'webContentLink' => $file->getWebContentLink(),
            'path' => $folderPath ? $folderPath . '/' . $file->getName() : $file->getName(),
        ];
    }

    private function getOrCreateFolder(string $folderPath): string
    {
        $driveService = $this->getDriveService();
        $folders = explode('/', $folderPath);
        $parentId = null;

        foreach ($folders as $folderName) {
            // Search for existing folder
            $response = $driveService->files->listFiles([
                'q' => "name='{$folderName}' and mimeType='application/vnd.google-apps.folder'" .
                       ($parentId ? " and '{$parentId}' in parents" : " and 'root' in parents"),
                'fields' => 'files(id,name)',
            ]);

            $existingFolder = $response->getFiles()[0] ?? null;

            if ($existingFolder) {
                $parentId = $existingFolder->getId();
            } else {
                // Create new folder
                $folderMetadata = new DriveFile([
                    'name' => $folderName,
                    'mimeType' => 'application/vnd.google-apps.folder',
                    'parents' => $parentId ? [$parentId] : null,
                ]);

                $folder = $driveService->files->create($folderMetadata, [
                    'fields' => 'id,name',
                ]);

                $parentId = $folder->getId();
            }
        }

        return $parentId;
    }

    public function deleteFile(string $fileId): bool
    {
        $driveService = $this->getDriveService();

        try {
            $driveService->files->delete($fileId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function listFiles(?string $folderPath = null): array
    {
        $driveService = $this->getDriveService();

        $folderId = null;
        if ($folderPath) {
            $folderId = $this->getFolderId($folderPath);
        }

        $query = $folderId
            ? "'{$folderId}' in parents and trashed=false"
            : "'root' in parents and trashed=false";

        $response = $driveService->files->listFiles([
            'q' => $query,
            'fields' => 'files(id,name,size,mimeType,webViewLink,webContentLink,createdTime,modifiedTime)',
        ]);

        $files = [];
        foreach ($response->getFiles() as $file) {
            $files[] = [
                'id' => $file->getId(),
                'name' => $file->getName(),
                'size' => $file->getSize(),
                'mimeType' => $file->getMimeType(),
                'webViewLink' => $file->getWebViewLink(),
                'webContentLink' => $file->getWebContentLink(),
                'createdTime' => $file->getCreatedTime(),
                'modifiedTime' => $file->getModifiedTime(),
            ];
        }

        return $files;
    }

    private function getFolderId(string $folderPath): ?string
    {
        $driveService = $this->getDriveService();
        $folders = explode('/', $folderPath);
        $parentId = null;

        foreach ($folders as $folderName) {
            $response = $driveService->files->listFiles([
                'q' => "name='{$folderName}' and mimeType='application/vnd.google-apps.folder'" .
                       ($parentId ? " and '{$parentId}' in parents" : " and 'root' in parents"),
                'fields' => 'files(id,name)',
            ]);

            $folder = $response->getFiles()[0] ?? null;
            if (!$folder) {
                return null;
            }

            $parentId = $folder->getId();
        }

        return $parentId;
    }
}

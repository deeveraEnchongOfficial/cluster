<?php

namespace App\Http\Controllers\App\Core\File;

use Illuminate\Http\Request;
use App\Services\Core\File\File;
use App\Services\Core\File\Actions\FileUpload;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use App\Services\Core\User\User;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\Core\Storage\GoogleDriveStorage;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;

class UpsertFilesController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FileUpload $fileUpload,
        private readonly GoogleDriveStorage $googleDriveStorage,
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {
        $this->middleware('auth');
    }

    /**
     * Display single file details.
     */
    public function show(Request $request, File $file): Response
    {
        $this->authorize('view', $file);

        return Inertia::render('Files/Upsert', [
            'file' => $file->load(['ownedBy', 'createdBy']),
        ]);
    }

    /**
     * Handle file upload using FileUpload action.
     */
    public function upload(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => [
                'file',
                'max:5120', // 5MB max per file
                'mimes:jpeg,jpg,png,gif,webp,svg,mp4,avi,mov,wmv,flv,webm,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar'
            ],
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
            'storage_type' => 'nullable|in:local,google_drive',
            'folder_path' => 'nullable|string|max:255',
        ]);

        $uploadedFiles = [];

        $metadata = [];
        if ($validated['description']) {
            $metadata['description'] = $validated['description'];
        }

        try {
            // Get folder path from linked account metadata or config
            $folderPath = $validated['folder_path'] ?? null;
            if (!$folderPath) {
                $googleAccount = $this->linkedAccounts->findByProviderAndFeature(
                    LinkedAccountProvider::GOOGLE,
                    LinkedAccountFeature::DRIVE,
                    auth()->user()
                );
                if ($googleAccount && isset($googleAccount->metadata['folder_path'])) {
                    $folderPath = $googleAccount->metadata['folder_path'];
                } elseif (config('services.google.drive_folder_path')) {
                    $folderPath = config('services.google.drive_folder_path');
                }
            }

            $uploadedFiles = $this->fileUpload->executeMultiple(
                $validated['files'],
                auth()->user(),
                $metadata,
                $validated['is_public'] ?? false,
                'google_drive', // Storage type
                $folderPath // Optional folder path from metadata or config
            );

            return back()->withToastSuccess(count($uploadedFiles) . ' files uploaded successfully to Google Drive.');
        } catch (\Exception $e) {
            return back()->with('error', 'File upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Update file details.
     */
    public function update(Request $request, File $file): RedirectResponse
    {
        $this->authorize('update', $file);

        $validated = $request->validate([
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        // Update metadata if description is provided
        if (isset($validated['description'])) {
            $metadata = $file->metadata ?? [];
            $metadata['description'] = $validated['description'];
            $file->replaceMetadata($metadata);
        }

        $file->update([
            'is_public' => $validated['is_public'] ?? $file->is_public,
        ]);

        return back()->withToastSuccess('File updated successfully.');
    }

    /**
     * Delete file.
     */
    public function destroy(File $file): RedirectResponse
    {
        $this->authorize('delete', $file);

        Storage::disk($file->disk)->delete($file->path);
        $file->delete();

        return redirect()->route('files.browse')
            ->withToastSuccess('File deleted successfully.');
    }

    /**
     * Download file.
     */
    public function download(File $file)
    {
        $this->authorize('view', $file);

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    /**
     * Bulk delete files.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'file_ids' => 'required|array',
        ]);

        $files = File::whereIn('id', $request->file_ids)
            ->forUser()
            ->get();

        foreach ($files as $file) {
            // Storage::disk($file->disk)->delete($file->path);
            $file->delete();
        }

        return back()->withToastSuccess("Successfully deleted {$files->count()} files.");
    }

    /**
     * Resync files from Google Drive.
     */
    public function resyncFromDrive(Request $request): RedirectResponse
    {
        try {
            $user = auth()->user();
            $syncedCount = 0;

            // Define the target folder path
            $folderPath = 'Florencio(sharedFolder)/portfolio resources';

            // Set user on GoogleDriveStorage and get all files from Google Drive folder
            $driveFiles = $this->googleDriveStorage->setUser($user)->listFiles($folderPath);

            // Get existing file external IDs from database
            $existingExternalIds = File::where('disk', 'google_drive')
                ->where('created_by_id', $user->id)
                ->pluck('external_id')
                ->filter()
                ->toArray();

            // Process each Google Drive file
            foreach ($driveFiles as $driveFile) {
                // Skip if file already exists in database

                // if size is null, skip
                if (!$driveFile['size']) {
                    continue;
                }

                if (in_array($driveFile['id'], $existingExternalIds)) {
                    continue;
                }

                $this->fileUpload->upsertWithoutUpload(
                    file: new File(),
                    name: $driveFile['name'],
                    originalName: $driveFile['name'],
                    mimeType: $driveFile['mimeType'] ?? 'application/octet-stream',
                    size: (int) $driveFile['size'],
                    path: $driveFile['id'],
                    disk: 'google_drive',
                    storageType: 'google_drive',
                    folderPath: $folderPath,
                    externalId: $driveFile['id'],
                    webViewLink: $driveFile['webViewLink'] ?? null,
                    webContentLink: $driveFile['webContentLink'] ?? null,
                    uploadedBy: $user,
                    metadata: [],
                    isPublic: true,
                );


                $syncedCount++;
            }

            return redirect()->route('files.browse')->withToastSuccess("Successfully synced {$syncedCount} files from Google Drive.");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to sync files from Google Drive: ' . $e->getMessage());
        }
    }
}

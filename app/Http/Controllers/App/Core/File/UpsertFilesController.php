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

class UpsertFilesController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FileUpload $fileUpload,
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
            'files.*' => 'file|max:5120', // 5MB max per file
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        \Log::info([
            'validated' => $validated,
        ]);

        $uploadedFiles = [];

        $metadata = [];
        if ($validated['description']) {
            $metadata['description'] = $validated['description'];
        }

        try {
            $uploadedFiles = $this->fileUpload->executeMultiple(
                $validated['files'],
                auth()->user(),
                $metadata,
                $validated['is_public'] ?? false
            );

            return back()->with('success', count($uploadedFiles) . ' files uploaded successfully.');
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

        return back()->with('success', 'File updated successfully.');
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
            ->with('success', 'File deleted successfully.');
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
            'file_ids.*' => 'exists:files,id',
        ]);

        $files = File::whereIn('id', $request->file_ids)
            ->forUser()
            ->get();

        foreach ($files as $file) {
            Storage::disk($file->disk)->delete($file->path);
            $file->delete();
        }

        return back()->with('success', 'Files deleted successfully.');
    }
}

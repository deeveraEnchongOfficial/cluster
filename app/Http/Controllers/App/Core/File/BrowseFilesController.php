<?php

namespace App\Http\Controllers\App\Core\File;

use Illuminate\Http\Request;
use App\Services\Core\File\File;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;

class BrowseFilesController extends Controller
{
    public function __construct(
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {
        $this->middleware('auth');
    }

    /**
     * Display all files with search and filtering.
     */
    public function show(Request $request): Response
    {
        $query = File::with(['ownedBy', 'createdBy'])
            ->forUser();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('original_name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->type) {
            $query->byType($request->type);
        }

        if ($request->is_public !== null) {
            $query->where('is_public', $request->is_public);
        }

        $files = $query->latest()->paginate(12);

        // Get Google Drive folder URL if available
        $googleDriveFolderUrl = null;
        if ($this->linkedAccounts->hasGoogleDrive($request->user())) {
            $googleAccount = $this->linkedAccounts->findByProviderAndFeature(
                \App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider::GOOGLE,
                \App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature::DRIVE,
                $request->user()
            );

            $googleDriveFolderUrl = match (true) {
                isset($googleAccount->metadata['folder_id']) => "https://drive.google.com/drive/folders/{$googleAccount->metadata['folder_id']}",
                isset($googleAccount->metadata['folder_url']) => $googleAccount->metadata['folder_url'],
                config('services.google.drive_folder_url') !== null => config('services.google.drive_folder_url'),
                default => 'https://drive.google.com',
            };
        }

        return Inertia::render('Files/Browse', [
            'files' => $files,
            'filters' => $request->only(['search', 'type', 'is_public']),
            'hasGoogleDrive' => $this->linkedAccounts->hasGoogleDrive($request->user()),
            'googleDriveFolderUrl' => $googleDriveFolderUrl,
        ]);
    }

    /**
     * API endpoint to fetch files as JSON.
     */
    public function api(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = File::forUser();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('original_name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->type) {
            $query->byType($request->type);
        }

        $files = $query->latest()->get();

        return response()->json([
            'files' => $files,
        ]);
    }
}

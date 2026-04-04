<?php

namespace App\Http\Controllers\App\Core\File;

use Illuminate\Http\Request;
use App\Services\Core\File\File;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;

class BrowseFilesController extends Controller
{
    public function __construct()
    {
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

        return Inertia::render('Files/Browse', [
            'files' => $files,
            'filters' => $request->only(['search', 'type', 'is_public']),
        ]);
    }
}

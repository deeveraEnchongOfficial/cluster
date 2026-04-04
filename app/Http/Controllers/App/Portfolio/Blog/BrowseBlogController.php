<?php

namespace App\Http\Controllers\App\Portfolio\Blog;

use Illuminate\Http\Request;
use App\Services\Portfolio\Blog\Blog;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;

class BrowseBlogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display all blogs with search and filtering.
     */
    public function show(Request $request): Response
    {
        $query = Blog::with(['ownedBy', 'createdBy'])
            ->forUser();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->category) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        if ($request->is_published !== null) {
            $query->where('metadata->is_published', $request->is_published);
        }

        $blogs = $query->latest()->paginate(12);

        return Inertia::render('Portfolio/Blog/Browse', [
            'blogs' => $blogs,
            'filters' => $request->only(['search', 'category', 'is_published']),
        ]);
    }
}

<?php

namespace App\Http\Controllers\App\Portfolio\Blog;

use Illuminate\Http\Request;
use App\Services\Portfolio\Blog\Blog;
use App\Services\Portfolio\Blog\Actions\UpsertBlog;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UpsertBlogController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly UpsertBlog $upsertBlog,
    ) {
        $this->middleware('auth');
    }

    /**
     * Display single blog details.
     */
    public function show(Request $request, Blog $blog): Response
    {
        $this->authorize('view', $blog);

        return Inertia::render('Portfolio/Blog/Upsert', [
            'blog' => $blog->load(['ownedBy', 'createdBy']),
        ]);
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'array',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'tags' => 'array',
            'readTime' => 'nullable|string|max:50',
            'order' => 'integer|default:0',
            'is_published' => 'boolean',
        ]);

        try {
            $blog = new Blog();
            
            $this->upsertBlog->execute(
                $blog,
                $validated['title'],
                $validated['category'] ?? [],
                $validated['excerpt'] ?? '',
                [],
                [],
                $validated['order'] ?? 0,
                $validated['readTime'] ?? '1 min read',
                str()->slug($validated['title']),
                $validated['tags'] ?? [],
                auth()->user(),
                ['content' => $validated['content'], 'is_published' => $validated['is_published'] ?? false]
            );

            return redirect()->route('portfolio.blogs.browse')
                ->with('success', 'Blog post created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create blog post: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing blog post.
     */
    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $this->authorize('update', $blog);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'array',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'tags' => 'array',
            'readTime' => 'nullable|string|max:50',
            'order' => 'integer',
            'is_published' => 'boolean',
        ]);

        try {
            $this->upsertBlog->execute(
                $blog,
                $validated['title'],
                $validated['category'] ?? [],
                $validated['excerpt'] ?? '',
                [],
                [],
                $validated['order'],
                $validated['readTime'] ?? '1 min read',
                str()->slug($validated['title']),
                $validated['tags'] ?? [],
                auth()->user(),
                ['content' => $validated['content'], 'is_published' => $validated['is_published'] ?? false]
            );

            return back()->with('success', 'Blog post updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update blog post: ' . $e->getMessage());
        }
    }

    /**
     * Delete a blog post.
     */
    public function destroy(Blog $blog): RedirectResponse
    {
        $this->authorize('delete', $blog);

        try {
            $blog->delete();
            return redirect()->route('portfolio.blogs.browse')
                ->with('success', 'Blog post deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete blog post: ' . $e->getMessage());
        }
    }
}

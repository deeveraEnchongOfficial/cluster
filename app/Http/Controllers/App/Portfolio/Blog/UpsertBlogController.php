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
use Illuminate\Validation\Rule;

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
        // $this->authorize('view', $blog);

        return Inertia::render('Portfolio/Blog/Upsert', [
            'blog' => $blog->load(['ownedBy', 'createdBy']),
        ]);
    }

    /**
     * Handle both create and update operations.
     */
    public function handle(Request $request): RedirectResponse
    {
        abort_unless(
            $blog = (!$request->route('blog') || $request->route('blog') === 'create')
                ? new Blog
                : Blog::findOrFail($request->route('blog')),
            404
        );

        // Skip authorization for now
        // $this->authorize($blog->exists ? 'update' : 'create', $blog);

        // Build the unique validation rule for blog title
        $uniqueRule = Rule::unique('blogs', 'title');
        // If updating existing blog, ignore its own title
        if ($blog->exists) {
            $uniqueRule->ignore($blog->id, 'id');
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255', $uniqueRule],
            'category' => 'array',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'tags' => 'array',
            'readTime' => 'nullable|string|max:50',
            'order' => 'integer',
            'is_published' => 'boolean',
        ]);

        try {
            $blog = $this->upsertBlog->execute(
                $blog,
                $data['title'],
                $data['category'] ?? [],
                $data['excerpt'] ?? '',
                [],
                [],
                $data['order'] ?? 0,
                $data['readTime'] ?? '1 min read',
                \Illuminate\Support\Str::slug($data['title']),
                $data['tags'] ?? [],
                auth()->user(),
                ['content' => $data['content'], 'is_published' => $data['is_published'] ?? false]
            );

            return redirect()
                ->route('portfolio.blogs.browse')
                ->with('success', $blog->wasRecentlyCreated
                    ? 'Blog post created successfully.'
                    : 'Blog post updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to save blog post: ' . $e->getMessage());
        }
    }

    /**
     * Delete a blog post.
     */
    public function destroy(Blog $blog): RedirectResponse
    {
        // $this->authorize('delete', $blog);

        try {
            $blog->delete();
            return redirect()->route('portfolio.blogs.browse')
                ->with('success', 'Blog post deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete blog post: ' . $e->getMessage());
        }
    }
}

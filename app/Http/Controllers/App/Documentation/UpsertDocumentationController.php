<?php

namespace App\Http\Controllers\App\Documentation;

use App\Services\Core\Page\Page;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use App\Services\Core\Page\PageRepository;
use App\Services\Core\Page\Actions\UpsertPage;
use App\Services\Core\Page\Actions\DeletePage;

class UpsertDocumentationController extends Controller
{
    public function __construct(
        private readonly PageRepository $pages,
        private readonly UpsertPage $upsertPage,
        private readonly DeletePage $deletePage,
    ) {
        $this->middleware('auth');
    }

    /**
     * Display single page details for editing.
     */
    public function show(Request $request, ?Page $page = null): Response
    {
        $page = $page ?? new Page;

        return Inertia::render('Documentation/Upsert', [
            'page' => $page->exists ? $page : null,
        ]);
    }

    /**
     * Handle both create and update operations.
     */
    public function handle(Request $request): RedirectResponse
    {
        $page = (!$request->route('page') || $request->route('page') === 'create')
            ? new Page
            : $this->pages->findById($request->route('page'));

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,published',
        ]);

        try {
            $page = $this->upsertPage->execute(
                $page,
                auth()->user(),
                $data['title'],
                $data['content'] ?? '',
                $data['status'],
                Str::slug($data['title']) ?? null
            );

            return redirect()
                ->route('documentation.upsert', ['page' => $page->id])
                ->with('success', $page->wasRecentlyCreated
                    ? 'Page created successfully.'
                    : 'Page updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to save page: ' . $e->getMessage());
        }
    }

    /**
     * Delete a page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        try {
            $this->deletePage->execute($page);
            return redirect()->route('documentation.index')
                ->with('success', 'Page deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete page: ' . $e->getMessage());
        }
    }
}

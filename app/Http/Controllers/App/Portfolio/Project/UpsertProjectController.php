<?php

namespace App\Http\Controllers\App\Portfolio\Project;

use App\Services\Portfolio\Project\Project;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use App\Services\Portfolio\Project\ProjectRepository;
use App\Services\Portfolio\Project\Actions\UpsertProject;
use App\Services\Portfolio\Project\Actions\DeleteProject;

class UpsertProjectController extends Controller
{
    public function __construct(
        private readonly ProjectRepository $projects,
        private readonly UpsertProject $upsertProject,
        private readonly DeleteProject $deleteProject,
    ) {
        $this->middleware('auth');
    }

    /**
     * Display single project details for editing.
     */
    public function show(Request $request, ?Project $project = null): Response
    {
        $project = $project ?? new Project;

        return Inertia::render('Portfolio/Projects/Upsert', [
            'project' => $project->exists ? $project : null,
        ]);
    }

    /**
     * Handle both create and update operations.
     */
    public function handle(Request $request): RedirectResponse
    {
        $project = (!$request->route('project') || $request->route('project') === 'create')
            ? new Project
            : $this->projects->findById($request->route('project'));

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,completed,on_hold,cancelled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
        ]);

        try {
            $project = $this->upsertProject->execute(
                $project,
                auth()->user(),
                $data['name'],
                $data['description'] ?? null,
                $data['status'],
                $data['start_date'] ?? null,
                $data['end_date'] ?? null,
                $data['budget'] ?? null
            );

            return redirect()
                ->route('portfolio.projects.show', ['project' => $project->id])
                ->with('success', $project->wasRecentlyCreated
                    ? 'Project created successfully.'
                    : 'Project updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to save project: ' . $e->getMessage());
        }
    }

    /**
     * Delete a project.
     */
    public function destroy(Project $project): RedirectResponse
    {
        try {
            $this->deleteProject->execute($project);
            return redirect()->route('portfolio.projects.browse')
                ->with('success', 'Project deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete project: ' . $e->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers\App\Portfolio\Project;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use App\Services\Portfolio\Project\ProjectRepository;

class BrowseProjectController extends Controller
{
    public function __construct(
        private ProjectRepository $projects
    ) {
        $this->middleware('auth');
    }

    /**
     * Display the projects list.
     */
    public function show(Request $request): Response
    {
        $projects = $this->projects->getAllForUser(auth()->id());

        return Inertia::render('Portfolio/Projects/Index', [
            'projects' => [
                'data' => $projects,
            ],
        ]);
    }
}

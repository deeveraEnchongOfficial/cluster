<?php

namespace App\Services\Portfolio\Project\Actions;

use App\Services\Portfolio\Project\Project;

class DeleteProject
{
    public function execute(Project $project): void
    {
        $project->delete();
    }
}

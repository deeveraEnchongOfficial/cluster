<?php

namespace App\Services\Portfolio\Project;

use App\Services\Portfolio\Project\Project;

class ProjectRepository
{
    public function findById(string $id): ?Project
    {
        return Project::where('id', $id)->first();
    }

    public function getAllForUser(string $userId)
    {
        return Project::where('owned_by_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();
    }
}

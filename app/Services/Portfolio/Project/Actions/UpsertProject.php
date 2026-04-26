<?php

namespace App\Services\Portfolio\Project\Actions;

use App\Services\Portfolio\Project\Project;
use App\Services\Core\User\User;
use Illuminate\Support\Str;

class UpsertProject
{
    public function execute(
        Project $project,
        User $user,
        string $name,
        ?string $description,
        string $status,
        ?string $startDate = null,
        ?string $endDate = null,
        ?float $budget = null
    ): Project {
        $project->forceFill([
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $description,
            'status' => $status,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'budget' => $budget,
            'author' => $user->name,
        ]);

        if ($user && (! $project->exists || ! $project->ownedBy)) {
            $project->ownedBy()->associate($user);
            $project->createdBy()->associate($user);
        }

        $project->save();

        return $project;
    }
}

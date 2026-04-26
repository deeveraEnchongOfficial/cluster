<?php

namespace App\Services\Core\Page\Actions;

use App\Services\Core\Page\Page;
use App\Services\Core\User\User;
use Illuminate\Support\Str;

class UpsertPage
{
    public function execute(
        Page $page,
        User $user,
        string $title,
        string $content,
        string $status,
        ?string $slug = null
    ): Page {
        $page->forceFill([
            'title' => $title,
            'slug' => $slug ?? Str::slug($title),
            'content' => $content,
            'status' => $status,
            'author' => $user->name,
        ]);

        if ($user && (! $page->exists || ! $page->ownedBy)) {
            $page->ownedBy()->associate($user);
        }

        if ((! $page->exists || ! $page->createdBy) && $user) {
            $page->createdBy()->associate($user);
        }

        $page->save();

        return $page;
    }
}

<?php

namespace App\Services\Core\Page;

class PageRepository
{
    public function findAllByUser(string $userId)
    {
        return Page::where('owned_by_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function findById(string $id)
    {
        return Page::findOrFail($id);
    }
}

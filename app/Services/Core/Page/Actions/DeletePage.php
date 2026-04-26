<?php

namespace App\Services\Core\Page\Actions;

use App\Services\Core\Page\Page;

class DeletePage
{
    public function execute(Page $page): void
    {
        $page->delete();
    }
}

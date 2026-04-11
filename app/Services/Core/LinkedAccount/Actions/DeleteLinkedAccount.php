<?php

namespace App\Services\Core\LinkedAccount\Actions;

use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\User\User;

class DeleteLinkedAccount
{
    /**
     * Execute the action to delete a linked account.
     */
    public function execute(LinkedAccount $linkedAccount, User $deletedBy): void
    {
        // Associate actor for audit if model has relationship
        if (method_exists($linkedAccount, 'deletedBy')) {
            $linkedAccount->deletedBy()->associate($deletedBy);
            $linkedAccount->save();
        }

        $linkedAccount->delete();
    }
}

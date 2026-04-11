<?php

namespace App\Http\Controllers\App\Core\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\Actions\DeleteLinkedAccount;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DisconnectGoogleDriveController extends Controller
{
    public function __construct(
        private readonly LinkedAccountRepository $linkedAccounts,
        private readonly DeleteLinkedAccount $deleteLinkedAccount,
    ) {}

    public function disconnect(Request $request, string $linkedAccountId): RedirectResponse
    {
        $linkedAccount = $this->linkedAccounts->findByIdAndUser($linkedAccountId, $request->user());

        if (!$linkedAccount) {
            return redirect()->route('settings.integrations.show')
                ->with('error', 'Google Drive account not found.');
        }

        try {
            $this->deleteLinkedAccount->execute($linkedAccount, $request->user());

            return redirect()->route('settings.integrations.show')
                ->with('success', 'Google Drive account disconnected successfully.');
        } catch (\Exception $e) {
            return redirect()->route('settings.integrations.show')
                ->with('error', 'Failed to disconnect Google Drive account: ' . $e->getMessage());
        }
    }
}

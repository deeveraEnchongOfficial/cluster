<?php

namespace App\Http\Controllers\App\Core\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\Actions\DeleteLinkedAccount;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use Exception;
use Google\Client as GoogleClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class DisconnectGoogleMailController extends Controller
{
    public function __construct(
        private readonly DeleteLinkedAccount $deleteLinkedAccount,
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {}

    public function disconnect(Request $request, string $linkedAccount): RedirectResponse
    {
        // Resolve linked account using repository (tenant-aware)
        $linkedAccountModel = $this->linkedAccounts->findByIdAndUser($linkedAccount, $request->user());

        abort_unless($linkedAccountModel, Response::HTTP_NOT_FOUND);

        // Revoke Google OAuth token (this will also cause any associated Recall
        // calendar to naturally transition to "disconnected" status)
        try {
            if ($linkedAccountModel->access_token) {
                // Try to revoke token via Google API
                $client = new GoogleClient;
                $client->setAccessToken($linkedAccountModel->access_token);
                $client->revokeToken();
            }
        } catch (Exception $e) {
            // Log error but continue with disconnection
            Log::warning('Failed to revoke Google token', [
                'error' => $e->getMessage(),
                'linked_account_id' => $linkedAccountModel->id,
            ]);
        }

        // Delete the entire linked account (Gmail disconnect cascades to Calendar)
        $this->deleteLinkedAccount->execute($linkedAccountModel, $request->user());

        return redirect()
            ->back()
            ->withToastSuccess(__('messages.profile.integrations.google_mail.disconnected'));
    }
}

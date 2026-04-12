<?php

namespace App\Http\Controllers\App\Core\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\Actions\UpsertLinkedAccount;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Laravel\Socialite\Facades\Socialite;

class GoogleDriveIntegrationController extends Controller
{
    const DRIVE_SCOPES = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    public function __construct(
        private readonly UpsertLinkedAccount $upsertLinkedAccount,
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {}

    public function connect(Request $request)
    {
        session()->put(static::class . ':payload', $request->query());

        return Socialite::driver('google')
            ->scopes(self::DRIVE_SCOPES)
            ->with([
                'prompt' => 'consent',
                'access_type' => 'offline',
            ])
            ->redirectUrl(route('settings.integrations.google-drive.callback'))
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $payload = session()->pull(static::class . ':payload') ?? [];
        $returnUrl = $request->query('returnUrl') ?? Arr::get($payload, 'returnUrl', route('settings.integrations.show', absolute: false));

        /** @var \Laravel\Socialite\Two\User $user */
        try {
            $user = Socialite::driver('google')
                ->redirectUrl(route('settings.integrations.google-drive.callback'))
                ->user();
        } catch (\Exception $e) {
            return redirect($returnUrl)
                ->with('error', 'Failed to authenticate with Google Drive: ' . $e->getMessage());
        }

        // Check if user already has a Google Drive account connected
        $existingAccount = $this->linkedAccounts->findByProviderIdAndUser(
            LinkedAccountProvider::GOOGLE,
            $user->getId(),
            $request->user()
        );

        if ($existingAccount) {
            // Update existing account
            $this->upsertLinkedAccount->execute(
                $existingAccount,
                LinkedAccountProvider::GOOGLE,
                $user->getId(),
                $user->token,
                self::DRIVE_SCOPES,
                [LinkedAccountFeature::DRIVE],
                $request->user(),
                $user->refreshToken,
                $user->expiresIn ? now()->addSeconds($user->expiresIn) : null,
                [
                    'email' => $user->getEmail(),
                    'name' => $user->getName(),
                    'avatar' => $user->getAvatar(),
                    'verified' => $user->user['verified_email'] ?? false,
                    'hd' => $user->user['hd'] ?? null,
                ]
            );
        } else {
            // Create new account
            $this->upsertLinkedAccount->execute(
                new LinkedAccount(),
                LinkedAccountProvider::GOOGLE,
                $user->getId(),
                $user->token,
                self::DRIVE_SCOPES,
                [LinkedAccountFeature::DRIVE],
                $request->user(),
                $user->refreshToken,
                $user->expiresIn ? now()->addSeconds($user->expiresIn) : null,
                [
                    'email' => $user->getEmail(),
                    'name' => $user->getName(),
                    'avatar' => $user->getAvatar(),
                    'verified' => $user->user['verified_email'] ?? false,
                    'hd' => $user->user['hd'] ?? null,
                ]
            );
        }

        return redirect($returnUrl)
            ->with('success', 'Google Drive account connected successfully!');
    }
}

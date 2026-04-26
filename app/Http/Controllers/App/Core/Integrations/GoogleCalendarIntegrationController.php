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

class GoogleCalendarIntegrationController extends Controller
{
    const CALENDAR_SCOPES = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
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
            ->scopes(self::CALENDAR_SCOPES)
            ->with([
                'prompt' => 'consent',
                'access_type' => 'offline',
            ])
            ->redirectUrl(route('settings.integrations.google-calendar.callback'))
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $payload = session()->pull(static::class . ':payload') ?? [];
        $returnUrl = $request->query('returnUrl') ?? Arr::get($payload, 'returnUrl', route('settings.integrations.show', absolute: false));

        /** @var \Laravel\Socialite\Two\User $user */
        try {
            $user = Socialite::driver('google')
                ->redirectUrl(route('settings.integrations.google-calendar.callback'))
                ->user();
        } catch (\Exception $e) {
            return redirect($returnUrl)
                ->with('error', 'Failed to authenticate with Google Calendar: ' . $e->getMessage());
        }

        // Check if user already has a Google Calendar account connected
        $existingAccount = $this->linkedAccounts->findByProviderIdAndUser(
            LinkedAccountProvider::GOOGLE,
            $user->getId(),
            $request->user()
        );

        if ($existingAccount) {
            // Update existing account - add calendar feature if not already present
            $features = $existingAccount->features ?? [];
            if (!in_array(LinkedAccountFeature::CALENDAR->value, $features)) {
                $features[] = LinkedAccountFeature::CALENDAR->value;
            }

            $this->upsertLinkedAccount->execute(
                $existingAccount,
                LinkedAccountProvider::GOOGLE,
                $user->getId(),
                $user->token,
                self::CALENDAR_SCOPES,
                $features,
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
                self::CALENDAR_SCOPES,
                [LinkedAccountFeature::CALENDAR],
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
            ->with('success', 'Google Calendar account connected successfully!');
    }
}

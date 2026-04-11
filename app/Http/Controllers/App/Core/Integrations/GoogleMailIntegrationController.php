<?php

namespace App\Http\Controllers\App\Core\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\Actions\UpsertLinkedAccount;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Laravel\Socialite\Facades\Socialite;

class GoogleMailIntegrationController extends Controller
{
    const MAIL_SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    public function __construct(
        private readonly UpsertLinkedAccount $upsertLinkedAccount,
        private readonly LinkedAccountRepository $linkedAccounts,
    ) {}

    public function connect(Request $request)
    {
        session()->put(static::class.':payload', $request->query());

        return Socialite::driver('google')
            ->scopes(self::MAIL_SCOPES)
            ->with([
                'prompt' => 'consent',
                'access_type' => 'offline',
            ])
            ->redirectUrl(route('settings.integrations.google-mail.callback'))
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $payload = session()->pull(static::class.':payload') ?? [];
        $returnUrl = $request->query('returnUrl') ?? Arr::get($payload, 'returnUrl', route('settings.integrations.show', absolute: false));

        /** @var \Laravel\Socialite\Two\User $user */
        try {
            $user = Socialite::driver('google')
                ->redirectUrl(route('settings.integrations.google-mail.callback'))
                ->user();
        } catch (Exception $e) {
            report($e);

            return redirect()
                ->to($returnUrl)
                ->withToastError(__('messages.profile.integrations.google_mail.something_went_wrong'));
        }

        $missingScopes = array_diff(self::MAIL_SCOPES, $user->approvedScopes);
        if (! empty($missingScopes)) {
            return redirect()
                ->to($returnUrl)
                ->withToastError(__('messages.profile.integrations.google_mail.missing_scopes'));
        }

        $linkedAccount = $this->linkedAccounts->findByProviderIdAndUser(
            provider: LinkedAccountProvider::GOOGLE,
            providerUserId: $user->id,
            user: $request->user(),
        ) ?? new LinkedAccount;

        $this->upsertLinkedAccount->execute(
            linkedAccount: $linkedAccount,
            user: $request->user(),
            provider: LinkedAccountProvider::GOOGLE,
            providerUserId: $user->id,
            scopes: $user->approvedScopes,
            accessToken: $user->token,
            refreshToken: $user->refreshToken,
            expiresAt: $user->expiresAt,
            features: array_merge(
                $linkedAccount->features ?? [],
                [LinkedAccountFeature::EMAIL],
            ),
            metadata: array_merge(
                $linkedAccount->metadata ?? [],
                $user->attributes,
            ),
        );

        return redirect()
            ->to($returnUrl)
            ->withToastSuccess(__('messages.integrations.google_mail.connected', ['email' => $user->email]));
    }
}

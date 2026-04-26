<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\Core\Page\Page;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            '__toast_messages' => $request->session()->get('__toast_messages__', []),
            'pages' => $request->user()
                ? Page::where('owned_by_id', $request->user()->id)
                    ->orderBy('updated_at', 'desc')
                    ->get(['id', 'title'])
                : [],
        ];
    }
}

<?php

namespace App\Http\Controllers\App\Calendar;

use App\Http\Controllers\Controller;
use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\Calendar\GoogleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function __construct(
        private readonly LinkedAccountRepository $linkedAccounts,
        private readonly GoogleCalendarService $calendarService,
    ) {}

    public function show(Request $request)
    {
        // Check if user has Google Calendar connected
        $calendarAccount = $this->linkedAccounts->findByProviderAndFeature(
            LinkedAccountProvider::GOOGLE,
            LinkedAccountFeature::CALENDAR,
            $request->user()
        );

        $events = [];
        if ($calendarAccount) {
            $cacheKey = 'calendar_events_' . $request->user()->id . '_' . Carbon::now()->format('Y-m');

            $events = Cache::remember($cacheKey, 300, function () use ($request) {
                try {
                    return $this->calendarService
                        ->setUser($request->user())
                        ->getEvents(
                            Carbon::now()->startOfMonth()->toRfc3339String(),
                            Carbon::now()->endOfMonth()->toRfc3339String()
                        );
                } catch (\Exception $e) {
                    \Log::error('Failed to fetch calendar events: ' . $e->getMessage());
                    return [];
                }
            });
        }

        return Inertia::render('Calendar/Index', [
            'hasCalendarConnected' => $calendarAccount !== null,
            'calendarAccount' => $calendarAccount ? [
                'id' => $calendarAccount->id,
                'email' => $calendarAccount->metadata['email'] ?? null,
                'name' => $calendarAccount->metadata['name'] ?? null,
            ] : null,
            'events' => $events,
        ]);
    }

    public function sync(Request $request)
    {
        $cacheKey = 'calendar_events_' . $request->user()->id . '_' . Carbon::now()->format('Y-m');
        Cache::forget($cacheKey);

        return redirect()->back()->with('success', 'Calendar synced successfully!');
    }
}

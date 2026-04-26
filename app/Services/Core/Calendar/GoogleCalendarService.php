<?php

namespace App\Services\Core\Calendar;

use App\Services\Core\LinkedAccount\LinkedAccountRepository;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\User\User;
use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Carbon\Carbon;

class GoogleCalendarService
{
    private Calendar $calendarService;
    private LinkedAccountRepository $linkedAccounts;
    private User $user;

    public function __construct(LinkedAccountRepository $linkedAccounts)
    {
        $this->linkedAccounts = $linkedAccounts;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    private function getCalendarService(): Calendar
    {
        if (!isset($this->calendarService)) {
            $linkedAccount = $this->linkedAccounts->findByProviderAndFeature(
                LinkedAccountProvider::GOOGLE,
                LinkedAccountFeature::CALENDAR,
                $this->user
            );

            if (!$linkedAccount) {
                throw new \Exception('Google Calendar account not connected');
            }

            $client = new Client();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));
            $client->setAccessToken([
                'access_token' => $linkedAccount->access_token,
                'refresh_token' => $linkedAccount->refresh_token,
                'expires_in' => $linkedAccount->expires_at?->diffInSeconds(now()),
                'created' => $linkedAccount->created_at->timestamp,
            ]);

            // Refresh token if expired
            if ($linkedAccount->isExpired()) {
                $client->fetchAccessTokenWithRefreshToken($linkedAccount->refresh_token);

                // Update the linked account with new tokens
                $newTokens = $client->getAccessToken();
                $linkedAccount->access_token = $newTokens['access_token'];
                $linkedAccount->expires_at = now()->addSeconds($newTokens['expires_in']);
                $linkedAccount->save();
            }

            $this->calendarService = new Calendar($client);
        }

        return $this->calendarService;
    }

    public function getEvents(?string $timeMin = null, ?string $timeMax = null): array
    {
        $calendarService = $this->getCalendarService();

        $optParams = [
            'maxResults' => 250,
            'orderBy' => 'startTime',
            'singleEvents' => true,
            'timeMin' => $timeMin ?? Carbon::now()->startOfMonth()->toRfc3339String(),
            'timeMax' => $timeMax ?? Carbon::now()->endOfMonth()->toRfc3339String(),
        ];

        // Fetch events from primary calendar
        $results = $calendarService->events->listEvents('primary', $optParams);
        $events = [];

        foreach ($results->getItems() as $event) {
            $events[] = $this->formatEvent($event);
        }

        // Fetch holidays from the user's country holiday calendar
        try {
            $calendarList = $calendarService->calendarList->listCalendarList();
            foreach ($calendarList->getItems() as $calendar) {
                // Look for holiday calendars (they usually have 'holiday' in the summary or ID)
                if (stripos($calendar->getId(), 'holiday') !== false || stripos($calendar->getSummary(), 'holiday') !== false) {
                    $holidayEvents = $calendarService->events->listEvents($calendar->getId(), $optParams);
                    foreach ($holidayEvents->getItems() as $event) {
                        $formattedEvent = $this->formatEvent($event);
                        $formattedEvent['isHoliday'] = true;
                        $formattedEvent['color'] = 'bg-red-500';
                        $events[] = $formattedEvent;
                    }
                }
            }
        } catch (\Exception $e) {
            // If fetching holidays fails, continue with just primary calendar events
            \Log::warning('Failed to fetch holiday calendar: ' . $e->getMessage());
        }

        return $events;
    }

    private function formatEvent(Event $event): array
    {
        $start = $event->getStart();
        $end = $event->getEnd();

        // Determine if it's an all-day event (has date field but no dateTime)
        $isAllDay = !empty($start->getDate());

        if ($isAllDay) {
            $startDate = Carbon::parse($start->getDate());
            $endDate = Carbon::parse($end->getDate());
        } else {
            $startDate = Carbon::parse($start->getDateTime());
            $endDate = Carbon::parse($end->getDateTime());
        }

        return [
            'id' => $event->getId(),
            'summary' => $event->getSummary(),
            'description' => $event->getDescription(),
            'location' => $event->getLocation(),
            'start' => [
                'date' => $isAllDay ? $startDate->format('Y-m-d') : null,
                'dateTime' => $isAllDay ? null : $startDate->toIso8601String(),
                'timeZone' => $start->getTimeZone(),
            ],
            'end' => [
                'date' => $isAllDay ? $endDate->format('Y-m-d') : null,
                'dateTime' => $isAllDay ? null : $endDate->toIso8601String(),
                'timeZone' => $end->getTimeZone(),
            ],
            'isAllDay' => $isAllDay,
            'day' => $startDate->day,
            'color' => $this->getEventColor($event),
            'attendees' => $event->getAttendees() ? count($event->getAttendees()) : 0,
            'htmlLink' => $event->getHtmlLink(),
        ];
    }

    private function getEventColor(Event $event): string
    {
        $colorId = $event->getColorId();

        $colorMap = [
            '1' => 'bg-blue-500',
            '2' => 'bg-green-500',
            '3' => 'bg-purple-500',
            '4' => 'bg-yellow-500',
            '5' => 'bg-orange-500',
            '6' => 'bg-red-500',
            '7' => 'bg-pink-500',
            '8' => 'bg-teal-500',
            '9' => 'bg-gray-500',
            '10' => 'bg-indigo-500',
            '11' => 'bg-cyan-500',
        ];

        return $colorMap[$colorId] ?? 'bg-blue-500';
    }
}

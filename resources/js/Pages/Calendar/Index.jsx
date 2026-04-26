import React, { useState } from 'react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog'
import { Calendar as CalendarIcon, RefreshCw, Settings, ChevronLeft, ChevronRight, Clock, MapPin, Users, ExternalLink } from 'lucide-react'
import { Link, useForm } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'

const Index = () => {
  const { props } = usePage()
  const { hasCalendarConnected, calendarAccount, events } = props
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { post, processing } = useForm()

  const handleSync = () => {
    post(route('calendar.sync'))
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === new Date(year, month, i).toDateString()
      })
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventsForDay = (day) => {
    if (!day) return []

    // Filter events for the specific day in the current month
    return events.filter(event => {
      const eventDate = new Date(event.start.date || event.start.dateTime)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const days = getDaysInMonth(currentDate)

  return (
    <AdminLayout
      title="Calendar"
      description="Manage your calendar events"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Calendar', href: '/calendar' },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings className="mr-2 w-4 h-4" />
              Settings
            </Link>
          </Button>
          {hasCalendarConnected && (
            <Button onClick={handleSync} disabled={processing}>
              <RefreshCw className={`mr-2 w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </div>
      }
    >
      {!hasCalendarConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar Integration</CardTitle>
            <CardDescription>
              Connect your Google Calendar to sync events and manage your schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-center items-center py-16 text-center">
              <div className="p-4 mb-4 rounded-full bg-muted">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Connect Google Calendar</h3>
              <p className="mb-4 max-w-md text-muted-foreground">
                Connect your Google Calendar account to sync your events and manage your schedule in one place.
              </p>
              <Button asChild>
                <Link href={route('settings.integrations.google-calendar.connect')}>
                  Connect Google Calendar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Google Calendar</CardTitle>
                  <CardDescription>
                    Connected as {calendarAccount?.email}
                  </CardDescription>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid overflow-hidden grid-cols-7 gap-px rounded-lg bg-border">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-sm font-semibold text-center bg-muted">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 bg-background ${
                      !day.isCurrentMonth ? 'opacity-30' : ''
                    } ${day.isToday ? 'bg-muted' : ''}`}
                  >
                    {day.day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${day.isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                          {day.day}
                    </div>
                    <div className="space-y-1">
                      {getEventsForDay(day.day).map((event, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleEventClick(event)}
                          className={`text-xs px-1 py-0.5 rounded truncate bg-blue-500 text-white dark:bg-blue-600 dark:text-white cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors`}
                        >
                          {event.summary}
                        </div>
                      ))}
                    </div>
                  </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedEvent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.summary}</DialogTitle>
              <DialogDescription>
                Event details from your Google Calendar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedEvent.isAllDay
                    ? 'All day event'
                    : `${selectedEvent.start.dateTime} - ${selectedEvent.end.dateTime}`
                  }
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.attendees > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{selectedEvent.attendees} attendee{selectedEvent.attendees !== 1 ? 's' : ''}</span>
                </div>
              )}
              {selectedEvent.htmlLink && (
                <Button asChild variant="outline" className="w-full">
                  <a href={selectedEvent.htmlLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 w-4 h-4" />
                    View in Google Calendar
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  )
}

export default Index

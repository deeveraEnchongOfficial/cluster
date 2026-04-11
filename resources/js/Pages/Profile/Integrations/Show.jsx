import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  HardDrive
} from 'lucide-react';

const IntegrationsShow = ({ linkedAccounts }) => {
  const hasGoogleMail = linkedAccounts.some(account =>
    account.provider === 'google' &&
    account.features.some(feature => feature.value === 'email')
  );

  const hasGoogleDrive = linkedAccounts.some(account =>
    account.provider === 'google' &&
    account.features.some(feature => feature.value === 'drive')
  );

  const getGoogleMailAccount = () => {
    return linkedAccounts.find(account =>
      account.provider === 'google' &&
      account.features.some(feature => feature.value === 'email')
    );
  };

  const getGoogleDriveAccount = () => {
    return linkedAccounts.find(account =>
      account.provider === 'google' &&
      account.features.some(feature => feature.value === 'drive')
    );
  };

  const getStatusBadge = (account) => {
    if (account.is_expired) {
      return <Badge variant="destructive" className="flex gap-1 items-center">
        <AlertCircle className="w-3 h-3" />
        Expired
      </Badge>;
    }

    if (account.needs_refresh) {
      return <Badge variant="warning" className="flex gap-1 items-center">
        <RefreshCw className="w-3 h-3" />
        Needs Refresh
      </Badge>;
    }

    return <Badge variant="success" className="flex gap-1 items-center">
      <CheckCircle className="w-3 h-3" />
      Connected
    </Badge>;
  };

  const getExpirationInfo = (account) => {
    if (!account.expires_at) return null;

    const expiresAt = new Date(account.expires_at);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt - now) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 24) {
      return <Alert className="mt-2">
        <Clock className="w-4 h-4" />
        <AlertDescription>
          Token expires in {Math.round(hoursUntilExpiry)} hours. Consider refreshing soon.
        </AlertDescription>
      </Alert>;
    }

    return null;
  };

  return (
    <AdminLayout
      title="Integrations"
      description="Connect external services to enhance your experience."
      breadcrumbs={[
        { label: 'Settings', href: route('settings.integrations.show') },
        { label: 'Integrations', href: route('settings.integrations.show') }
      ]}
    >
      <div className="space-y-6">

        {/* Google Mail Integration */}
        <Card>
          <CardHeader>
            <div className="flex gap-3 items-center">
              <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle>Google Mail</CardTitle>
                <CardDescription>
                  Connect your Gmail account to send and receive emails
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasGoogleMail ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="font-medium">
                        {getGoogleMailAccount().metadata?.email || 'Connected Account'}
                      </span>
                      {getStatusBadge(getGoogleMailAccount())}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Connected on {new Date(getGoogleMailAccount().created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={route('settings.integrations.google-mail.connect')}>
                        Refresh
                      </a>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      asChild
                    >
                      <Link
                        href={route('settings.integrations.google-mail.disconnect', getGoogleMailAccount().id)}
                        method="delete"
                        as="button"
                      >
                        Disconnect
                      </Link>
                    </Button>
                  </div>
                </div>

                {getExpirationInfo(getGoogleMailAccount())}

                <div className="flex flex-wrap gap-2">
                  {getGoogleMailAccount().features.map((feature) => (
                    <Badge key={feature.value} variant="secondary">
                      {feature.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Connect your Google account to enable email functionality
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Read Emails</Badge>
                    <Badge variant="outline">Send Emails</Badge>
                    <Badge variant="outline">Compose</Badge>
                  </div>
                </div>

                <Button asChild>
                  <a href={route('settings.integrations.google-mail.connect')}>
                    Connect Google Mail
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Drive Integration */}
        <Card>
          <CardHeader>
            <div className="flex gap-3 items-center">
              <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Google Drive</CardTitle>
                <CardDescription>
                  Connect your Google Drive to access and manage files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasGoogleDrive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="font-medium">
                        {getGoogleDriveAccount().metadata?.email || 'Connected Account'}
                      </span>
                      {getStatusBadge(getGoogleDriveAccount())}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Connected on {new Date(getGoogleDriveAccount().created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={route('settings.integrations.google-drive.connect')}>
                        Refresh
                      </a>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      asChild
                    >
                      <Link
                        href={route('settings.integrations.google-drive.disconnect', getGoogleDriveAccount().id)}
                        method="delete"
                        as="button"
                      >
                        Disconnect
                      </Link>
                    </Button>
                  </div>
                </div>

                {getExpirationInfo(getGoogleDriveAccount())}

                <div className="flex flex-wrap gap-2">
                  {getGoogleDriveAccount().features.map((feature) => (
                    <Badge key={feature.value} variant="secondary">
                      {feature.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Connect your Google Drive to access files and documents
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Read Files</Badge>
                    <Badge variant="outline">Manage Files</Badge>
                    <Badge variant="outline">Upload Files</Badge>
                  </div>
                </div>

                <Button asChild>
                  <a href={route('settings.integrations.google-drive.connect')}>
                    Connect Google Drive
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Integrations Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex gap-3 items-center">
              <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Sync your calendar events (Coming Soon)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to sync events and manage your schedule
                </p>
              </div>
              <Button disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsShow;

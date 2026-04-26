import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import {
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  HardDrive,
  SlidersHorizontal,
  ArrowUpAZ,
  ArrowDownAZ,
  MessageSquare,
  Code2,
  Layers,
  CreditCard,
  Video,
  MessageCircle,
  Workflow
} from 'lucide-react';

const IntegrationsShow = ({ linkedAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sort, setSort] = useState('asc');

  const hasGoogleMail = linkedAccounts.some(account =>
    account.provider === 'google' &&
    account.features.some(feature => feature.value === 'email')
  );

  const hasGoogleDrive = linkedAccounts.some(account =>
    account.provider === 'google' &&
    account.features.some(feature => feature.value === 'drive')
  );

  const hasGoogleCalendar = linkedAccounts.some(account =>
    account.provider === 'google' &&
    account.features.some(feature => feature.value === 'calendar')
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

  const getGoogleCalendarAccount = () => {
    return linkedAccounts.find(account =>
      account.provider === 'google' &&
      account.features.some(feature => feature.value === 'calendar')
    );
  };

  // Define all integrations
  const integrations = [
    {
      id: 'google-mail',
      name: 'Google Mail',
      description: 'Connect your Gmail account to send and receive emails',
      icon: <Mail className="w-5 h-5" />,
      iconBg: 'bg-red-100 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
      connected: hasGoogleMail,
      account: hasGoogleMail ? getGoogleMailAccount() : null,
      connectRoute: 'settings.integrations.google-mail.connect',
      disconnectRoute: 'settings.integrations.google-mail.disconnect',
      features: hasGoogleMail ? getGoogleMailAccount().features : [
        { label: 'Read Emails', value: 'read' },
        { label: 'Send Emails', value: 'send' },
        { label: 'Compose', value: 'compose' }
      ]
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Connect your Google Drive to access and manage files',
      icon: <HardDrive className="w-5 h-5" />,
      iconBg: 'bg-green-100 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      connected: hasGoogleDrive,
      account: hasGoogleDrive ? getGoogleDriveAccount() : null,
      connectRoute: 'settings.integrations.google-drive.connect',
      disconnectRoute: 'settings.integrations.google-drive.disconnect',
      features: hasGoogleDrive ? getGoogleDriveAccount().features : [
        { label: 'Read Files', value: 'read' },
        { label: 'Manage Files', value: 'manage' },
        { label: 'Upload Files', value: 'upload' }
      ]
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your calendar events',
      icon: <Calendar className="w-5 h-5" />,
      iconBg: 'bg-blue-100 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      connected: hasGoogleCalendar,
      account: hasGoogleCalendar ? getGoogleCalendarAccount() : null,
      connectRoute: 'settings.integrations.google-calendar.connect',
      disconnectRoute: 'settings.integrations.google-calendar.disconnect',
      features: hasGoogleCalendar ? getGoogleCalendarAccount().features : [
        { label: 'Sync Events', value: 'sync' },
        { label: 'Create Events', value: 'create' },
        { label: 'Manage Schedule', value: 'manage' }
      ]
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect your Discord server for notifications and messaging',
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Notifications', value: 'notifications' },
        { label: 'Messaging', value: 'messaging' },
        { label: 'Server Management', value: 'server' }
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your GitHub account for repository management',
      icon: <Code2 className="w-5 h-5" />,
      iconBg: 'bg-gray-100 dark:bg-gray-950',
      iconColor: 'text-gray-600 dark:text-gray-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Repository Access', value: 'repo' },
        { label: 'Issues', value: 'issues' },
        { label: 'Pull Requests', value: 'pr' }
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your Slack workspace for team collaboration',
      icon: <Layers className="w-5 h-5" />,
      iconBg: 'bg-purple-100 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Messages', value: 'messages' },
        { label: 'Channels', value: 'channels' },
        { label: 'Workflows', value: 'workflows' }
      ]
    },
    {
      id: 'docker',
      name: 'Docker',
      description: 'Manage your Docker containers and images',
      icon: <HardDrive className="w-5 h-5" />,
      iconBg: 'bg-cyan-100 dark:bg-cyan-950',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Container Management', value: 'containers' },
        { label: 'Image Management', value: 'images' },
        { label: 'Deployments', value: 'deploy' }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments and manage subscriptions',
      icon: <CreditCard className="w-5 h-5" />,
      iconBg: 'bg-violet-100 dark:bg-violet-950',
      iconColor: 'text-violet-600 dark:text-violet-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Payments', value: 'payments' },
        { label: 'Subscriptions', value: 'subscriptions' },
        { label: 'Invoicing', value: 'invoicing' }
      ]
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Schedule and manage video meetings',
      icon: <Video className="w-5 h-5" />,
      iconBg: 'bg-blue-100 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Meetings', value: 'meetings' },
        { label: 'Webinars', value: 'webinars' },
        { label: 'Recordings', value: 'recordings' }
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Send messages and notifications via WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      iconBg: 'bg-green-100 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Messaging', value: 'messaging' },
        { label: 'Notifications', value: 'notifications' },
        { label: 'Business API', value: 'business' }
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Connect your Telegram bot for messaging',
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: 'bg-sky-100 dark:bg-sky-950',
      iconColor: 'text-sky-600 dark:text-sky-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Bot Messages', value: 'bot' },
        { label: 'Channels', value: 'channels' },
        { label: 'Groups', value: 'groups' }
      ]
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Automate workflows with n8n integration',
      icon: <Workflow className="w-5 h-5" />,
      iconBg: 'bg-orange-100 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
      connected: false,
      disabled: true,
      features: [
        { label: 'Workflows', value: 'workflows' },
        { label: 'Automations', value: 'automations' },
        { label: 'Webhooks', value: 'webhooks' }
      ]
    }
  ];

  // Filter and sort integrations
  const filteredIntegrations = integrations
    .filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === 'all' ? true :
        filterType === 'connected' ? integration.connected :
        filterType === 'notConnected' ? !integration.connected : true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Prioritize non-disabled integrations (not coming soon)
      if (a.disabled !== b.disabled) {
        return a.disabled ? 1 : -1;
      }
      // Then sort alphabetically
      return sort === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

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
      title="App Integrations"
      description="Here's a list of your apps for the integration!"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: route('settings.integrations.show') },
        { label: 'Integrations', href: route('settings.integrations.show') }
      ]}
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Filter integrations..."
              className="h-9 w-40 lg:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Apps</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="notConnected">Not Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-16">
              <SelectValue>
                <SlidersHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="asc">
                <div className="flex gap-4 items-center">
                  <ArrowUpAZ size={16} />
                  <span>Ascending</span>
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex gap-4 items-center">
                  <ArrowDownAZ size={16} />
                  <span>Descending</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="shadow-sm" />

        {/* Integrations Grid */}
        <ul className="grid gap-4 pt-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => (
            <li
              key={integration.id}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className={`flex size-10 items-center justify-center rounded-lg ${integration.iconBg} p-2`}>
                  <div className={integration.iconColor}>
                    {integration.icon}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    integration.connected
                      ? 'border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900'
                      : ''
                  }`}
                  disabled={integration.disabled}
                  asChild={!integration.disabled && !integration.connected}
                >
                  {integration.disabled ? (
                    <span>Coming Soon</span>
                  ) : integration.connected ? (
                    <Link
                      href={route(integration.disconnectRoute, integration.account.id)}
                      method="delete"
                      as="button"
                    >
                      Disconnect
                    </Link>
                  ) : (
                    <a href={route(integration.connectRoute)}>
                      Connect
                    </a>
                  )}
                </Button>
              </div>
              <div>
                <h2 className="mb-1 font-semibold">{integration.name}</h2>
                <p className="line-clamp-2 text-muted-foreground text-sm mb-3">
                  {integration.description}
                </p>
                {integration.connected && integration.account && (
                  <div className="space-y-2 mb-3">
                    <div className="flex gap-2 items-center">
                      {getStatusBadge(integration.account)}
                    </div>
                    {integration.account.metadata?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {integration.account.metadata.email}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature.label}
                    </Badge>
                  ))}
                  {integration.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{integration.features.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsShow;

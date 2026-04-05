import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, CreditCard, Activity, Download } from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const chartData = [
        { month: 'Jan', value: 3000 },
        { month: 'Feb', value: 2500 },
        { month: 'Mar', value: 3500 },
        { month: 'Apr', value: 3800 },
        { month: 'May', value: 4500 },
        { month: 'Jun', value: 4200 },
        { month: 'Jul', value: 3200 },
        { month: 'Aug', value: 3400 },
        { month: 'Sep', value: 4000 },
        { month: 'Oct', value: 4300 },
        { month: 'Nov', value: 3700 },
        { month: 'Dec', value: 3100 },
    ];

    const recentSales = [
        { id: 1, initials: 'OM', name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00' },
        { id: 2, initials: 'JL', name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00' },
        { id: 3, initials: 'IN', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00' },
        { id: 4, initials: 'WK', name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
        { id: 5, initials: 'SD', name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'reports', label: 'Reports' },
        { id: 'notifications', label: 'Notifications' },
    ];

    return (
        <AdminLayout
            title="Dashboard"
            description="Welcome back! Here's what's happening with your projects."
            action={
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            }
        >

            {/* Tabs */}
            <div className="mb-6 border-b">
                <nav className="flex -mb-px space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2,350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart and Recent Sales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Overview Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>You made 265 sales this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{sale.initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{sale.name}</p>
                                        <p className="text-sm text-muted-foreground">{sale.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {sale.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

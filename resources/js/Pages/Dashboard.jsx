import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        <DashboardLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg transition-colors hover:bg-gray-800">
                            Download
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h3 className="mb-1 text-3xl font-bold text-gray-900">$45,231.89</h3>
                    <p className="text-xs text-gray-500">+20.1% from last month</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="mb-1 text-3xl font-bold text-gray-900">+2350</h3>
                    <p className="text-xs text-gray-500">+180.1% from last month</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-600">Sales</p>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="mb-1 text-3xl font-bold text-gray-900">+12,234</h3>
                    <p className="text-xs text-gray-500">+19% from last month</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-600">Active Now</p>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="mb-1 text-3xl font-bold text-gray-900">+573</h3>
                    <p className="text-xs text-gray-500">+201 since last hour</p>
                </div>
            </div>

            {/* Chart and Recent Sales */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                {/* Overview Chart */}
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-4">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px 12px'
                                }}
                                formatter={(value) => [`$${value}`, 'Revenue']}
                            />
                            <Bar
                                dataKey="value"
                                fill="#18181b"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Sales */}
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-3">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
                        <p className="mt-1 text-sm text-gray-500">You made 265 sales this month.</p>
                    </div>
                    <div className="space-y-6">
                        {recentSales.map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="flex justify-center items-center w-10 h-10 bg-gray-100 rounded-full">
                                        <span className="text-sm font-semibold text-gray-700">{sale.initials}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{sale.name}</p>
                                        <p className="text-xs text-gray-500">{sale.email}</p>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {sale.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

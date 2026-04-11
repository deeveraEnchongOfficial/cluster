import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Settings, Trash2 } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout
            title="Profile Settings"
            description="Manage your account settings and preferences"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Profile', href: '/profile' },
            ]}
        >
            <Head title="Profile" />

            <div className="space-y-6">
                {/* Profile Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Profile Information</CardTitle>
                            <Badge variant="secondary">Personal</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </CardContent>
                </Card>

                <Separator />

                {/* Password Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <CardTitle>Password & Security</CardTitle>
                            <Badge variant="outline">Security</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <UpdatePasswordForm className="max-w-2xl" />
                    </CardContent>
                </Card>

                <Separator />

                {/* Danger Zone Card */}
                <Card className="border-destructive/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <Badge variant="destructive">Irreversible</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DeleteUserForm className="max-w-2xl" />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

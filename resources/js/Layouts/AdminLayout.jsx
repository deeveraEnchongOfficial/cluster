import { Head } from '@inertiajs/react'
import { AppShell } from '@/Components/layout/app-shell'
import { PageHeader } from '@/Components/layout/page-header'

export default function AdminLayout({ children, title, description, action, breadcrumbs }) {
    return (
        <>
            <Head title={title} />
            <AppShell>
                {(title || description || action || breadcrumbs) && (
                    <PageHeader
                        title={title}
                        description={description}
                        action={action}
                        breadcrumbs={breadcrumbs}
                    />
                )}
                {children}
            </AppShell>
        </>
    )
}

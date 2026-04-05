import React from 'react'
import { Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Separator } from '@/Components/ui/separator'
import { Edit, ArrowLeft } from 'lucide-react'

const Show = ({ project }) => {
  return (
    <AdminLayout
      title={project.name}
      description="Project details and information"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Projects', href: '/projects' },
        { label: project.name, href: `/projects/${project.id}` },
      ]}
      action={(
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={route('projects.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link href={route('projects.edit', project.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="mt-1">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="mt-1">
                      <Badge variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        'outline'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {project.budget && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Budget</h4>
                      <p className="mt-1 text-lg font-semibold">
                        ${Number(project.budget).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                    <p className="mt-1">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                    <p className="mt-1">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                  <p className="mt-1">{project.user.name}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                  <p className="mt-1">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                  <p className="mt-1">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={route('projects.edit', project.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={route('projects.index')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Show

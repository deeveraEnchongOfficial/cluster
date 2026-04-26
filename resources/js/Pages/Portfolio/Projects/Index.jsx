import React from 'react'
import { Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { PlusCircle, Eye, Edit } from 'lucide-react'

const Index = ({ projects }) => {
  const projectsData = projects?.data || [];

  return (
    <AdminLayout
      title="Projects"
      description="Manage your projects"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Projects', href: '/portfolio/projects' },
      ]}
      action={
        <Button asChild>
          <Link href={route('portfolio.projects.create')}>
            <PlusCircle className="mr-2 w-4 h-4" />
            Create Project
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projectsData.map((project) => (
          <Card key={project.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1.5">{project.description}</CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === 'active' ? 'default' :
                    project.status === 'completed' ? 'secondary' :
                    'outline'
                  }
                >
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">${project.budget.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={route('portfolio.projects.show', project.id)}>
                    <Eye className="mr-2 w-4 h-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={route('portfolio.projects.show', project.id)}>
                    <Edit className="mr-2 w-4 h-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projectsData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col justify-center items-center py-16">
            <div className="p-3 mb-4 rounded-full bg-muted">
              <PlusCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
            <p className="mb-4 text-muted-foreground">Get started by creating your first project.</p>
            <Button asChild>
              <Link href={route('portfolio.projects.create')}>
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

    </AdminLayout>
  )
}

export default Index

import React from 'react'
import { Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { PlusCircle, Eye, Edit } from 'lucide-react'

const Index = ({ projects }) => {
  return (
    <AdminLayout
      title="Projects"
      description="Manage your projects"
      action={
        <Button asChild>
          <Link href={route('projects.create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.data.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
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
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={route('projects.show', project.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={route('projects.edit', project.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
            <Button asChild>
              <Link href={route('projects.create')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.links && projects.links.length > 3 && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1">
            {projects.links.map((link, index) => (
              <Button
                key={index}
                asChild={!!link.url}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                disabled={!link.url}
              >
                {link.url ? (
                  <Link
                    href={link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Index

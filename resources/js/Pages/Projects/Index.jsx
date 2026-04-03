import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'

const Index = ({ projects }) => {
  return (
    <DashboardLayout
      header={
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600">Manage your projects</p>
          </div>
          <Link href={route('projects.create')}>
            <Button>Create Project</Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.data.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`text-sm font-medium ${
                    project.status === 'active' ? 'text-green-600' :
                    project.status === 'completed' ? 'text-blue-600' :
                    project.status === 'on_hold' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {project.budget && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Budget:</span>
                    <span className="text-sm font-medium">${project.budget}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Link href={route('projects.show', project.id)}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link href={route('projects.edit', project.id)}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.data.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
          <Link href={route('projects.create')}>
            <Button>Create Project</Button>
          </Link>
        </div>
      )}

      {projects.links && projects.links.length > 3 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {projects.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`px-3 py-2 text-sm ${
                  link.active
                    ? 'bg-primary-500 text-white'
                    : link.url
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Index

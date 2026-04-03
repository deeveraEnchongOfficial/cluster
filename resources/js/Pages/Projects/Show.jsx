import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'

const Show = ({ project }) => {
  return (
    <DashboardLayout
      header={
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-600">Project details and information</p>
          </div>
          <div className="flex space-x-3">
            <Link href={route('projects.edit', project.id)}>
              <Button>Edit Project</Button>
            </Link>
          </div>
        </div>
      }
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
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-gray-900">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {project.budget && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Budget</h4>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ${project.budget}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                    <p className="mt-1 text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                    <p className="mt-1 text-gray-900">
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
                  <h4 className="text-sm font-medium text-gray-500">Created By</h4>
                  <p className="mt-1 text-gray-900">{project.user.name}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                  <p className="mt-1 text-gray-900">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="mt-1 text-gray-900">
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
                <Link href={route('projects.edit', project.id)} className="block">
                  <Button className="w-full">Edit Project</Button>
                </Link>
                <Link href={route('projects.index')} className="block">
                  <Button variant="outline" className="w-full">Back to Projects</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Show

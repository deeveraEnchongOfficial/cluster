import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'

const Upsert = ({ project }) => {
  const { data, setData, post, patch, processing, errors } = useForm({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    budget: project?.budget || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (project?.id) {
      patch(route('portfolio.projects.update', project.id))
    } else {
      post(route('portfolio.projects.handle'))
    }
  }

  return (
    <AdminLayout
      title={project?.id ? 'Edit Project' : 'Create Project'}
      description={project?.id ? 'Edit project details' : 'Create a new project'}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Projects', href: '/portfolio/projects' },
        { label: project?.id ? 'Edit' : 'Create', href: '#' },
      ]}
    >
      <Card>
          <CardHeader>
            <CardTitle>{project?.id ? 'Edit Project' : 'Create Project'}</CardTitle>
            <CardDescription>
              {project?.id ? 'Update the project information below.' : 'Fill in the project details below.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Enter project name"
                  error={errors.name}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  error={errors.description}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={data.status} onValueChange={value => setData('status', value)}>
                  <SelectTrigger error={errors.status}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    error={errors.start_date}
                  />
                  {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                    error={errors.end_date}
                  />
                  {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={data.budget}
                  onChange={e => setData('budget', e.target.value)}
                  placeholder="Enter budget amount"
                  error={errors.budget}
                />
                {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : project?.id ? 'Update Project' : 'Create Project'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </AdminLayout>
  )
}

export default Upsert

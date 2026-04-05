import React from 'react'
import { useForm, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/Components/ui/alert'

const Edit = ({ project }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'active',
    start_date: project.start_date || '',
    end_date: project.end_date || '',
    budget: project.budget || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    put(route('projects.update', project.id))
  }

  return (
    <AdminLayout
      title="Edit Project"
      description="Update project information"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Projects', href: '/projects' },
        { label: project.name, href: `/projects/${project.id}` },
        { label: 'Edit', href: `/projects/${project.id}/edit` },
      ]}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Update the information below to modify the project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
                {errors.name && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.name}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  className="mt-1"
                />
                {errors.description && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.description}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.status}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.budget}
                  onChange={(e) => setData('budget', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                {errors.budget && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.budget}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  className="mt-1"
                />
                {errors.start_date && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.start_date}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  className="mt-1"
                />
                {errors.end_date && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.end_date}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href={route('projects.show', project.id)}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

export default Edit

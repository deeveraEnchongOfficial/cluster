import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { AlertCircle, Save, ArrowLeft, X, Image as ImageIcon, Video } from 'lucide-react';
import FileSelectorDialog from '@/Components/FileSelectorDialog';

export default function Upsert({ blog }) {
    const [isPreview, setIsPreview] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: blog?.title || '',
        category: blog?.category || [],
        excerpt: blog?.excerpt || '',
        content: blog?.__metadata?.content || '',
        tags: blog?.tags || [],
        readTime: blog?.readTime || '1 min read',
        order: blog?.order || 0,
        is_published: blog?.metadata?.is_published || false,
        images: blog?.images || [],
        videos: blog?.videos || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (blog?.id) {
            patch(route('portfolio.blogs.update', blog), {
                onSuccess: () => {
                    // Handle success
                }
            });
        } else {
            post(route('portfolio.blogs.handle'), {
                onSuccess: () => {
                    reset();
                }
            });
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!data.tags.includes(newTag)) {
                setData('tags', [...data.tags, newTag]);
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    const addCategory = (category) => {
        if (!data.category.includes(category)) {
            setData('category', [...data.category, category]);
        }
    };

    const removeCategory = (categoryToRemove) => {
        setData('category', data.category.filter(cat => cat !== categoryToRemove));
    };

    const commonCategories = ['Technology', 'Design', 'Business', 'Marketing', 'Development', 'Tutorial'];

    return (
        <AdminLayout
            title={blog?.id ? 'Edit Blog Post' : 'Create Blog Post'}
            description={blog?.id ? 'Update your blog post content' : 'Create a new blog post'}
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Blogs', href: '/portfolio/blogs' },
                { label: blog?.id ? 'Edit' : 'Create', href: blog?.id ? `/portfolio/blogs/${blog.id}` : '/portfolio/blogs/create' },
            ]}
            action={
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route('portfolio.blogs.browse')}>
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        variant={isPreview ? 'default' : 'outline'}
                        onClick={() => setIsPreview(!isPreview)}
                    >
                        {isPreview ? 'Edit' : 'Preview'}
                    </Button>
                </div>
            }
        >
            <div className="w-full">
                <Card>
                    {!isPreview ? (
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Title
                                    </Label>
                                <Input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter blog title..."
                                    required
                                />
                                {errors.title && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{errors.title}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div>
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        rows={3}
                                        placeholder="Brief description of your blog post..."
                                    />
                                </div>
                                {errors.excerpt && (
                                    <p className="mt-1 text-sm text-destructive">{errors.excerpt}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Content
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={12}
                                    className="px-3 py-2 w-full rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                    placeholder="Write your blog content here..."
                                    required
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-destructive">{errors.content}</p>
                                )}
                            </div>

                            {/* Categories and Tags Row */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Categories */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Categories
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {data.category.map((cat, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-200"
                                                >
                                                    {cat}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategory(cat)}
                                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {commonCategories
                                                .filter(cat => !data.category.includes(cat))
                                                .map((cat, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => addCategory(cat)}
                                                        className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                    >
                                                        + {cat}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Tags
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {data.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 text-xs text-green-800 bg-green-100 rounded dark:bg-green-900 dark:text-green-200"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            onKeyPress={handleAddTag}
                                            className="px-3 py-2 w-full rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                            placeholder="Add tags and press Enter..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Settings */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Read Time
                                    </label>
                                    <input
                                        type="text"
                                        value={data.readTime}
                                        onChange={(e) => setData('readTime', e.target.value)}
                                        className="px-3 py-2 w-full rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                        placeholder="e.g., 5 min read"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        className="px-3 py-2 w-full rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="rounded text-primary border-input focus:ring-ring"
                                    />
                                    <label htmlFor="is_published" className="ml-2 text-sm">
                                        Published
                                    </label>
                                </div>
                            </div>

                            {/* Images and Videos */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Images */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Images
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setImageDialogOpen(true)}
                                        className="w-full"
                                    >
                                        <ImageIcon className="mr-2 w-4 h-4" />
                                        Select Images ({data.images.length})
                                    </Button>
                                    {data.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.images.map((imageUrl, index) => (
                                                <div
                                                    key={index}
                                                    className="overflow-hidden relative w-16 h-16 rounded-lg border"
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Image ${index + 1}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('images', data.images.filter(url => url !== imageUrl))}
                                                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Videos */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Videos
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setVideoDialogOpen(true)}
                                        className="w-full"
                                    >
                                        <Video className="mr-2 w-4 h-4" />
                                        Select Videos ({data.videos.length})
                                    </Button>
                                    {data.videos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.videos.map((videoUrl, index) => (
                                                <div
                                                    key={index}
                                                    className="flex overflow-hidden relative justify-center items-center w-16 h-16 rounded-lg border bg-muted"
                                                >
                                                    <Video className="w-6 h-6 text-muted-foreground" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('videos', data.videos.filter(url => url !== videoUrl))}
                                                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-6 space-x-3 border-t">
                                <Link
                                    href={route('portfolio.blogs.browse')}
                                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (blog?.id ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                        </CardContent>
                    ) : (
                        <CardContent className="pt-6">
                            <h1 className="mb-4 text-2xl font-bold">{data.title}</h1>
                            {data.excerpt && (
                                <p className="mb-4 text-muted-foreground">{data.excerpt}</p>
                            )}
                            <Separator className="my-4" />
                            <div className="max-w-none prose">
                                <div className="whitespace-pre-wrap">{data.content}</div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* File Selector Dialogs */}
                <FileSelectorDialog
                    open={imageDialogOpen}
                    onOpenChange={setImageDialogOpen}
                    onSelect={(selected) => setData('images', selected)}
                    mime_type="image"
                    selectedFiles={data.images}
                />
                <FileSelectorDialog
                    open={videoDialogOpen}
                    onOpenChange={setVideoDialogOpen}
                    onSelect={(selected) => setData('videos', selected)}
                    mime_type="video"
                    selectedFiles={data.videos}
                />
            </div>
        </AdminLayout>
    );
}

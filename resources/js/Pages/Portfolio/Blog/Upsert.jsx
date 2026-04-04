import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Upsert({ blog }) {
    const [isPreview, setIsPreview] = useState(false);
    
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: blog?.title || '',
        category: blog?.category || [],
        excerpt: blog?.excerpt || '',
        content: blog?.metadata?.content || '',
        tags: blog?.tags || [],
        readTime: blog?.readTime || '1 min read',
        order: blog?.order || 0,
        is_published: blog?.metadata?.is_published || false,
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
            post(route('portfolio.blogs.store'), {
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
        <DashboardLayout header={blog?.id ? 'Edit Blog Post' : 'Create Blog Post'}>
            <Head title={blog?.id ? 'Edit Blog Post' : 'Create Blog Post'} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            {blog?.id ? 'Edit Blog Post' : 'Create Blog Post'}
                        </h1>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsPreview(!isPreview)}
                                className={`px-3 py-1 rounded text-sm ${
                                    isPreview 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {isPreview ? 'Edit' : 'Preview'}
                            </button>
                            <Link
                                href={route('portfolio.blogs.browse')}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>

                    {!isPreview ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter blog title..."
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt
                                </label>
                                <textarea
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Brief description of the blog post..."
                                />
                                {errors.excerpt && (
                                    <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={12}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Write your blog content here..."
                                    required
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            {/* Categories and Tags Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Categories */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categories
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {data.category.map((cat, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                >
                                                    {cat}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategory(cat)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
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
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                                    >
                                                        + {cat}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {data.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1 text-green-600 hover:text-green-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            onKeyPress={handleAddTag}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Add tags and press Enter..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Read Time
                                    </label>
                                    <input
                                        type="text"
                                        value={data.readTime}
                                        onChange={(e) => setData('readTime', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 5 min read"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                                        Published
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('portfolio.blogs.browse')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (blog?.id ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{data.title}</h1>
                            {data.excerpt && (
                                <p className="text-gray-600 mb-4">{data.excerpt}</p>
                            )}
                            <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap">{data.content}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

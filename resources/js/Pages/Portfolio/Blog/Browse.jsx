import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable, DataTableCard } from '@/Components/data-table';
import SearchFilter from '@/Components/SearchFilter';

export default function Browse({ blogs, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const handleBlogSelect = (blogIds) => {
        setSelectedBlogs(blogIds);
        setShowBulkActions(blogIds.length > 0);
    };

    const handleSearch = (searchFilters) => {
        router.get(route('portfolio.blogs.browse'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBulkDelete = () => {
        if (confirm('Are you sure you want to delete the selected blog posts?')) {
            router.post(route('portfolio.blogs.bulk-delete'), {
                blog_ids: selectedBlogs
            }, {
                onSuccess: () => {
                    setSelectedBlogs([]);
                    setShowBulkActions(false);
                }
            });
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {blog.title}
                        </div>
                        {blog.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                {blog.excerpt}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <div className="flex flex-wrap gap-1">
                        {blog.category && blog.category.slice(0, 2).map((cat, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                                {cat}
                            </span>
                        ))}
                        {blog.category && blog.category.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{blog.category.length - 2}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        blog.metadata?.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {blog.metadata?.is_published ? 'Published' : 'Draft'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'tags',
            header: 'Tags',
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <div className="flex flex-wrap gap-1">
                        {blog.tags && blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                                {tag}
                            </span>
                        ))}
                        {blog.tags && blog.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{blog.tags.length - 3}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'readTime',
            header: 'Read Time',
            cell: ({ row }) => (
                <span className="text-sm text-gray-500">
                    {row.original.readTime}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-sm text-gray-500">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <div className="flex space-x-2">
                        <Link
                            href={route('portfolio.blogs.show', blog)}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => router.delete(route('portfolio.blogs.destroy', blog))}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <DashboardLayout header="Blogs">
            <Head title="Blogs" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                        <p className="text-gray-600 mt-1">Manage your blog content</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Blog Post
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <SearchFilter
                        filters={filters}
                        onSearch={handleSearch}
                        placeholder="Search blog posts..."
                    />
                </div>

                {/* Bulk Actions */}
                {showBulkActions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
                        <span className="text-blue-800">
                            {selectedBlogs.length} blog{selectedBlogs.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="space-x-2">
                            <button
                                onClick={() => setSelectedBlogs([])}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* DataTable */}
                <DataTableCard>
                    <DataTable
                        columns={columns}
                        items={blogs.data}
                        selectable={true}
                        selected={selectedBlogs}
                        onSelect={handleBlogSelect}
                        placeholder="No blog posts yet. Create your first blog post to get started."
                    />
                </DataTableCard>

                {/* Pagination */}
                {blogs.links && blogs.links.length > 3 && (
                    <div className="mt-8">
                        <div className="flex justify-center">
                            <div className="flex space-x-1">
                                {blogs.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal - Would need to be implemented */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Create Blog Post</h2>
                        <p className="text-gray-600 mb-4">
                            Blog creation form would go here. For now, you can implement this component.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

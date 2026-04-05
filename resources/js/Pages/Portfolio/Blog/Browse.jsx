import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { DataTable } from '@/Components/data-table/data-table';
import { DataTableToolbar } from '@/Components/data-table/data-table-toolbar';
import { createSelectColumn, createSortableHeader } from '@/Components/data-table/columns';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { PlusCircle, Trash2, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

export default function Browse({ blogs, filters }) {
    const handleDelete = (blog) => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            router.delete(route('portfolio.blogs.destroy', blog));
        }
    };

    const columns = useMemo(() => [
        createSelectColumn(),
        {
            accessorKey: 'title',
            header: ({ column }) => createSortableHeader(column, 'Title'),
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <div className="max-w-[500px]">
                        <div className="font-medium">
                            {blog.title}
                        </div>
                        {blog.excerpt && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
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
                            <Badge key={index} variant="secondary">
                                {cat}
                            </Badge>
                        ))}
                        {blog.category && blog.category.length > 2 && (
                            <Badge variant="outline">
                                +{blog.category.length - 2}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => createSortableHeader(column, 'Status'),
            cell: ({ row }) => {
                const blog = row.original;
                const status = blog.metadata?.is_published ? 'Published' : 'Draft';
                return (
                    <Badge variant={blog.metadata?.is_published ? 'default' : 'secondary'}>
                        {status}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
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
                            <Badge key={index} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                        {blog.tags && blog.tags.length > 3 && (
                            <Badge variant="outline">
                                +{blog.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'readTime',
            header: 'Read Time',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.readTime}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => createSortableHeader(column, 'Created'),
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return (
                    <div className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const blog = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(blog.id)}
                            >
                                Copy blog ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('portfolio.blogs.show', blog)}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(blog)}
                                className="text-destructive"
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], []);

    return (
        <AdminLayout
            title="Blog Posts"
            description="Manage your blog content"
            action={
                <Button asChild>
                    <Link href={route('portfolio.blogs.create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Blog Post
                    </Link>
                </Button>
            }
        >
            <DataTable
                columns={columns}
                data={blogs.data || []}
                searchKey="title"
            />
        </AdminLayout>
    );
}

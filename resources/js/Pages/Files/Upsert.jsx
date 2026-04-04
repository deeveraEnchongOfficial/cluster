import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Upsert({ file }) {
    const [description, setDescription] = useState(file.description || '');
    const [isPublic, setIsPublic] = useState(file.is_public || false);

    const handleDownload = () => {
        window.open(route('files.download', file.id), '_blank');
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        router.patch(route('files.update', file.id), {
            description: description,
            is_public: isPublic,
        }, {
            onSuccess: () => {
                // Show success message
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this file?')) {
            router.delete(route('files.destroy', file.id));
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) {
            return '🖼️';
        } else if (mimeType.startsWith('video/')) {
            return '🎥';
        } else if (mimeType.startsWith('audio/')) {
            return '🎵';
        } else if (mimeType.includes('pdf')) {
            return '📄';
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return '📝';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return '📊';
        } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
            return '📈';
        } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) {
            return '📦';
        } else {
            return '📎';
        }
    };

    return (
        <DashboardLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        File Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            Download
                        </button>
                        <Link
                            href={route('files.browse')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            Back to Files
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`File - ${file.original_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <div className="text-6xl mb-4">{getFileIcon(file.mime_type)}</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {file.original_name}
                                        </h3>

                                        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={3}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Add a description for this file..."
                                                />
                                            </div>

                                            <div className="flex items-center justify-start">
                                                <input
                                                    type="checkbox"
                                                    id="is_public"
                                                    checked={isPublic}
                                                    onChange={(e) => setIsPublic(e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                                                    Make file public
                                                </label>
                                            </div>

                                            <div className="flex justify-center gap-4">
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
                                                >
                                                    Update File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDelete}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
                                                >
                                                    Delete File
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">File Information</h4>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Size</dt>
                                                <dd className="text-sm text-gray-900">{file.formatted_size}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Type</dt>
                                                <dd className="text-sm text-gray-900">{file.mime_type}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {file.is_public ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Public
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Private
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {new Date(file.created_at).toLocaleDateString()} at {new Date(file.created_at).toLocaleTimeString()}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Owner Information</h4>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                                    {file.ownedBy.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.ownedBy.name}</p>
                                                <p className="text-sm text-gray-500">{file.ownedBy.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {file.hash && (
                                        <div className="bg-gray-50 rounded-lg p-6">
                                            <h4 className="font-semibold text-gray-900 mb-4">File Integrity</h4>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">SHA-256 Hash</dt>
                                                <dd className="text-xs text-gray-900 font-mono break-all mt-1">
                                                    {file.hash}
                                                </dd>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

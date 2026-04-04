import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import UploadModal from '@/Components/UploadModal';

export default function Browse({ files, filters }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const handleFileSelect = (fileId) => {
        setSelectedFiles(prev => {
            const newSelection = prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId];
            setShowBulkActions(newSelection.length > 0);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === files.data.length) {
            setSelectedFiles([]);
            setShowBulkActions(false);
        } else {
            setSelectedFiles(files.data.map(file => file.id));
            setShowBulkActions(true);
        }
    };

    const handleBulkDelete = () => {
        if (confirm('Are you sure you want to delete the selected files?')) {
            router.post(route('files.bulk-delete'), {
                file_ids: selectedFiles
            }, {
                onSuccess: () => {
                    setSelectedFiles([]);
                    setShowBulkActions(false);
                }
            });
        }
    };

    const handleDownload = (file) => {
        window.open(route('files.download', file.id), '_blank');
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
                        Files
                    </h2>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Upload Files
                    </button>
                </div>
            }
        >
            <Head title="Files" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <SearchFilter
                                    placeholder="Search files..."
                                    filters={filters}
                                    onFilter={(newFilters) => {
                                        router.get(route('files.browse'), newFilters, {
                                            preserveState: true,
                                            replace: true
                                        });
                                    }}
                                />

                                <div className="flex items-center gap-4">
                                    <select
                                        value={filters.type || ''}
                                        onChange={(e) => {
                                            const newFilters = { ...filters, type: e.target.value };
                                            router.get(route('files.browse'), newFilters, {
                                                preserveState: true,
                                                replace: true
                                            });
                                        }}
                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        <option value="image">Images</option>
                                        <option value="video">Videos</option>
                                        <option value="audio">Audio</option>
                                        <option value="application/pdf">PDF</option>
                                        <option value="text">Text</option>
                                    </select>

                                    <select
                                        value={filters.is_public !== undefined ? filters.is_public : ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? undefined : e.target.value === 'true';
                                            const newFilters = { ...filters, is_public: value };
                                            router.get(route('files.browse'), newFilters, {
                                                preserveState: true,
                                                replace: true
                                            });
                                        }}
                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Visibility</option>
                                        <option value="true">Public</option>
                                        <option value="false">Private</option>
                                    </select>
                                </div>
                            </div>

                            {showBulkActions && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-800">
                                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                        </span>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Delete Selected
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {files.data.length > 0 ? (
                                    files.data.map((file) => (
                                        <div
                                            key={file.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFiles.includes(file.id)}
                                                        onChange={() => handleFileSelect(file.id)}
                                                        className="border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {file.is_public && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="font-medium text-gray-900 truncate mb-1" title={file.original_name}>
                                                {file.original_name}
                                            </h3>

                                            <p className="text-sm text-gray-500 mb-2">
                                                {file.formatted_size}
                                            </p>

                                            {file.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {file.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownload(file)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Download
                                                    </button>
                                                    <Link
                                                        href={route('files.show', file.id)}
                                                        className="text-gray-600 hover:text-gray-800 text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📁</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                                        <p className="text-gray-500 mb-4">Get started by uploading your first file.</p>
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Upload Files
                                        </button>
                                    </div>
                                )}
                            </div>

                            {files.data.length > 0 && (
                                <div className="mt-6">
                                    <Pagination links={files.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UploadModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    setShowUploadModal(false);
                    router.reload();
                }}
            />
        </DashboardLayout>
    );
}

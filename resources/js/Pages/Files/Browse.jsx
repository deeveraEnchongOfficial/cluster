import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import {
  Upload, Download, Eye, Trash2, FileImage, FileVideo, FileAudio,
  FileText, FileSpreadsheet, File, Archive, Globe, Lock
} from 'lucide-react';
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
        const iconClass = "h-8 w-8 text-muted-foreground";
        if (mimeType.startsWith('image/')) {
            return <FileImage className={iconClass} />;
        } else if (mimeType.startsWith('video/')) {
            return <FileVideo className={iconClass} />;
        } else if (mimeType.startsWith('audio/')) {
            return <FileAudio className={iconClass} />;
        } else if (mimeType.includes('pdf')) {
            return <FileText className={iconClass} />;
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return <FileText className={iconClass} />;
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return <FileSpreadsheet className={iconClass} />;
        } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
            return <FileText className={iconClass} />;
        } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) {
            return <Archive className={iconClass} />;
        } else {
            return <File className={iconClass} />;
        }
    };

    return (
        <AdminLayout
            title="Files"
            description="Manage and organize your files"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Files', href: '/files' },
            ]}
            action={
                <Button onClick={() => setShowUploadModal(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                </Button>
            }
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <Input
                                placeholder="Search files..."
                                value={filters.search || ''}
                                onChange={(e) => {
                                    router.get(route('files.browse'), { ...filters, search: e.target.value }, {
                                        preserveState: true,
                                        replace: true
                                    });
                                }}
                                className="max-w-sm"
                            />

                            <div className="flex items-center gap-2">
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(value) => {
                                        const newFilters = { ...filters, type: value === 'all' ? undefined : value };
                                        router.get(route('files.browse'), newFilters, {
                                            preserveState: true,
                                            replace: true
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="image">Images</SelectItem>
                                        <SelectItem value="video">Videos</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="application/pdf">PDF</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.is_public !== undefined ? String(filters.is_public) : 'all'}
                                    onValueChange={(value) => {
                                        const newValue = value === 'all' ? undefined : value === 'true';
                                        const newFilters = { ...filters, is_public: newValue };
                                        router.get(route('files.browse'), newFilters, {
                                            preserveState: true,
                                            replace: true
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Visibility</SelectItem>
                                        <SelectItem value="true">Public</SelectItem>
                                        <SelectItem value="false">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {showBulkActions && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-sm font-medium">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.data.length > 0 ? (
                        files.data.map((file) => (
                            <Card key={file.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={selectedFiles.includes(file.id)}
                                                onCheckedChange={() => handleFileSelect(file.id)}
                                            />
                                            {getFileIcon(file.mime_type)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {file.is_public ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    Public
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    Private
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-medium truncate mb-1" title={file.original_name}>
                                        {file.original_name}
                                    </h3>

                                    <p className="text-sm text-muted-foreground mb-2">
                                        {file.formatted_size}
                                    </p>

                                    {file.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {file.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(file)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={route('files.show', file.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-3 mb-4">
                                    <File className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No files found</h3>
                                <p className="text-muted-foreground mb-4">Get started by uploading your first file.</p>
                                <Button onClick={() => setShowUploadModal(true)}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Files
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {files.links && files.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className="flex gap-1">
                            {files.links.map((link, index) => (
                                <Button
                                    key={index}
                                    asChild={!!link.url}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <UploadModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    setShowUploadModal(false);
                    router.reload();
                }}
            />
        </AdminLayout>
    );
}

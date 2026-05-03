import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import {
    Upload, Download, Eye, Trash2, FileImage, FileVideo, FileAudio,
    FileText, FileSpreadsheet, File, Archive, Globe, Lock, RefreshCw, ExternalLink
} from 'lucide-react';
import UploadModal from '@/Components/UploadModal';

export default function Browse({ files, filters, hasGoogleDrive, googleDriveFolderUrl }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isResyncing, setIsResyncing] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [showResyncDialog, setShowResyncDialog] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

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
        if (selectedFiles.length === 0) return;
        setShowBulkDeleteDialog(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('files.bulk-delete'), { file_ids: selectedFiles }, {
            onSuccess: () => {
                setSelectedFiles([]);
                setShowBulkActions(false);
                setShowBulkDeleteDialog(false);
            }
        });
    };

    const handleResyncFromDrive = () => {
        setShowResyncDialog(true);
    };

    const confirmResyncFromDrive = () => {
        setIsResyncing(true);
        setShowResyncDialog(false);

        router.post(route('files.resync-drive'), {}, {
            onSuccess: () => {
                router.reload();
            },
            onError: (errors) => {
                console.error('Resync errors:', errors);
            },
            onFinish: () => {
                setIsResyncing(false);
            }
        });
    };

    const handleDownload = (file) => {
        window.open(route('files.download', file.id), '_blank');
    };

    const handleViewImage = (file) => {
        // Check if file is an image type
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/heif', 'image/heic'];

        if (imageTypes.includes(file.mime_type)) {
            // Use webContentLink for direct image access
            let imageUrl = file.web_content_link;

            // If webContentLink is not available, try the thumbnail format
            if (!imageUrl) {
                imageUrl = `https://drive.google.com/thumbnail?id=${file.external_id}&sz=w1000`;
            }

            setImageLoading(true);
            setCurrentImage({
                url: imageUrl,
                name: file.original_name,
                mimeType: file.mime_type
            });
            setShowImageModal(true);
        } else {
            // For non-image files, use the original behavior
            window.open(file.web_view_link, '_blank');
        }
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
                hasGoogleDrive ? (
                    <div className="flex gap-2">
                        {googleDriveFolderUrl && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(googleDriveFolderUrl, '_blank')}
                            >
                                <ExternalLink className="mr-2 w-4 h-4" />
                                Open Drive Folder
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => handleResyncFromDrive()}
                            disabled={isResyncing}
                        >
                            {isResyncing ? (
                                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 w-4 h-4" />
                            )}
                            {isResyncing ? 'Syncing...' : 'Resync from Drive'}
                        </Button>
                        <Button onClick={() => setShowUploadModal(true)}>
                            <Upload className="mr-2 w-4 h-4" />
                            Upload Files
                        </Button>
                    </div>
                ) : (
                    <></>
                )
            }
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
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

                            <div className="flex gap-2 items-center">
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
                        <CardContent className="flex justify-between items-center py-4">
                            <span className="text-sm font-medium">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 w-4 h-4" />
                                Delete Selected
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {files.data.length > 0 ? (
                        files.data.map((file) => (
                            <Card key={file.id} className="transition-shadow hover:shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2 items-center">
                                            <Checkbox
                                                checked={selectedFiles.includes(file.id)}
                                                onCheckedChange={() => handleFileSelect(file.id)}
                                            />
                                            {getFileIcon(file.mime_type)}
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            {file.is_public ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    Public
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Lock className="w-3 h-3" />
                                                    Private
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="mb-1 font-medium truncate" title={file.original_name}>
                                        {file.original_name}
                                    </h3>

                                    <p className="mb-2 text-sm text-muted-foreground">
                                        {file.formatted_size}
                                    </p>

                                    {file.description && (
                                        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                            {file.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-1 items-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(file)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewImage(file)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col justify-center items-center py-16">
                                <div className="p-3 mb-4 rounded-full bg-muted">
                                    <File className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">No files found</h3>
                                <p className="mb-6 text-muted-foreground">Get started by connecting your Gmail account and uploading files.</p>

                                <div className="flex gap-4 items-center">
                                    {hasGoogleDrive ? (
                                        <Button onClick={() => setShowUploadModal(true)}>
                                            <Upload className="mr-2 w-4 h-4" />
                                            Upload Files
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/settings/integrations/google-drive/connect'}
                                            className="gap-2"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Connect Google Drive
                                        </Button>
                                    )}
                                </div>
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
            {/* Image Modal */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{currentImage?.name}</DialogTitle>
                        <DialogDescription>
                            Image preview
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                        {currentImage && (
                            <div className="relative">
                                {imageLoading && (
                                    <div className="flex absolute inset-0 justify-center items-center rounded-lg bg-muted">
                                        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
                                    </div>
                                )}
                                <img
                                    src={currentImage.url}
                                    alt={currentImage.name}
                                    className={`max-w-full max-h-[70vh] object-contain rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    onLoad={() => setImageLoading(false)}
                                    onError={(e) => {
                                        console.error('Image failed to load:', currentImage.url);
                                        setImageLoading(false);
                                        // Try fallback URL
                                        if (!e.target.src.includes('thumbnail')) {
                                            const externalId = currentImage.url.match(/id=([^&]+)/)?.[1];
                                            if (externalId) {
                                                e.target.src = `https://drive.google.com/thumbnail?id=${externalId}&sz=w1000`;
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resync Confirmation Dialog */}
            <Dialog open={showResyncDialog} onOpenChange={setShowResyncDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resync from Google Drive</DialogTitle>
                        <DialogDescription>
                            This will scan Google Drive and add any missing files to the system. Continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResyncDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmResyncFromDrive} disabled={isResyncing}>
                            {isResyncing ? (
                                <>
                                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 w-4 h-4" />
                                    Continue
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Files</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmBulkDelete}>
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

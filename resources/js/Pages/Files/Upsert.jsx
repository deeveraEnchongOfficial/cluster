import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import {
  Download, ArrowLeft, Save, Trash2, FileImage, FileVideo, FileAudio,
  FileText, FileSpreadsheet, File, Archive, Globe, Lock
} from 'lucide-react';

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
        const iconClass = "h-16 w-16 text-muted-foreground";
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
            title={file.original_name}
            description="View and manage file details"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Files', href: '/files' },
                { label: file.original_name, href: `/files/${file.id}` },
            ]}
            action={
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route('files.browse')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="mb-4">{getFileIcon(file.mime_type)}</div>
                                <h3 className="text-xl font-semibold mb-1">
                                    {file.original_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{file.formatted_size}</p>
                            </div>

                            <Separator className="my-6" />

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Add a description for this file..."
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_public"
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                    />
                                    <Label htmlFor="is_public" className="cursor-pointer">
                                        Make file public
                                    </Label>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete File
                                    </Button>
                                    <Button type="submit">
                                        <Save className="mr-2 h-4 w-4" />
                                        Update File
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>File Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Size</dt>
                                <dd className="text-sm mt-1">{file.formatted_size}</dd>
                            </div>
                            <Separator />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                                <dd className="text-sm mt-1 font-mono">{file.mime_type}</dd>
                            </div>
                            <Separator />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Visibility</dt>
                                <dd className="mt-1">
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
                                </dd>
                            </div>
                            <Separator />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Uploaded</dt>
                                <dd className="text-sm mt-1">
                                    {new Date(file.created_at).toLocaleDateString()} at {new Date(file.created_at).toLocaleTimeString()}
                                </dd>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Owner Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {file.ownedBy.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{file.ownedBy.name}</p>
                                    <p className="text-sm text-muted-foreground">{file.ownedBy.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {file.hash && (
                        <Card>
                            <CardHeader>
                                <CardTitle>File Integrity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">SHA-256 Hash</dt>
                                    <dd className="text-xs font-mono break-all mt-2 p-2 bg-muted rounded">
                                        {file.hash}
                                    </dd>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

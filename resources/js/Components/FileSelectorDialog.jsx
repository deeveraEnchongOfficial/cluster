import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Search, X } from 'lucide-react';

export default function FileSelectorDialog({ open, onOpenChange, onSelect, mime_type, selectedFiles = [] }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (files.length > 0 && selectedFiles.length > 0) {
            const selectedIds = selectedFiles.map(url => {
                const match = url.match(/id=([^&]+)/);
                return match ? match[1] : null;
            }).filter(Boolean);
            setSelected(selectedIds);
        }
    }, [selectedFiles, files]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/files/api?type=${mime_type}&search=${search}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open, mime_type, search]);

    const handleToggleFile = (fileId) => {
        setSelected(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const handleConfirm = () => {
        const selectedFileObjects = selected.map(id => files.find(f => f.id === id)).filter(Boolean);
        const thumbnailUrls = selectedFileObjects.map(file => `https://drive.google.com/thumbnail?id=${file.external_id}&sz=w1000`);
        onSelect(thumbnailUrls);
        onOpenChange(false);
    };

    const handleRemoveFile = (fileId) => {
        setSelected(prev => prev.filter(id => id !== fileId));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select {mime_type === 'image' ? 'Images' : 'Videos'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Currently Selected */}
                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted">
                            {selected.map(fileId => {
                                const file = files.find(f => f.id === fileId);
                                return (
                                    <div
                                        key={fileId}
                                        className="flex gap-1 items-center px-2 py-1 text-sm rounded bg-primary text-primary-foreground"
                                    >
                                        <span className="max-w-[200px] truncate">{file?.name || fileId}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(fileId)}
                                            className="ml-1 rounded hover:bg-primary/80"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Files Grid */}
                    <ScrollArea className="h-[400px] border rounded-lg p-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <p>Loading...</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-muted-foreground">
                                <p>No files found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`relative border rounded-lg p-2 cursor-pointer transition-colors ${
                                            selected.includes(file.id)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                        onClick={() => handleToggleFile(file.id)}
                                    >
                                        <div className="overflow-hidden mb-2 rounded aspect-square bg-muted">
                                            {mime_type === 'image' ? (
                                                <img
                                                // https://drive.google.com/thumbnail?id=${file.external_id}&sz=w1000
                                                    src={`https://drive.google.com/thumbnail?id=${file.external_id}&sz=w1000`}
                                                    alt={file.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="flex justify-center items-center w-full h-full text-muted-foreground">
                                                    <span className="text-4xl">🎬</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            <Checkbox
                                                checked={selected.includes(file.id)}
                                                onChange={() => handleToggleFile(file.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <p className="text-xs font-medium line-clamp-2">{file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>
                        Confirm Selection ({selected.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

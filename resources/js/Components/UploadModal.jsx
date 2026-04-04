import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function UploadModal({ show, onClose, onSuccess }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        files: [],
        description: '',
        is_public: false,
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            const validFiles = droppedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
            setFiles(prev => [...prev, ...validFiles]);
            setData('files', [...files, ...validFiles]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
            setFiles(validFiles);
            setData('files', validFiles);
        }
    };

    const handleRemoveFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setData('files', newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        formData.append('description', data.description);
        formData.append('is_public', data.is_public);

        post(route('files.upload'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFiles([]);
                onSuccess();
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
            }
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: '📄',
            doc: '📝', docx: '📝',
            xls: '📊', xlsx: '📊',
            ppt: '📈', pptx: '📈',
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
            mp4: '🎥', avi: '🎥', mov: '🎥',
            mp3: '🎵', wav: '🎵', flac: '🎵',
            zip: '📦', rar: '📦', '7z': '📦',
            txt: '📄', csv: '📄',
        };
        return iconMap[extension] || '📎';
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Upload Files
                                </h3>

                                <form onSubmit={handleSubmit}>
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors ${
                                            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-2">
                                            <div className="text-4xl">📁</div>
                                            <p className="text-gray-600">
                                                Drag and drop files here, or click to select files
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Maximum file size: 10MB
                                            </p>
                                        </div>
                                    </div>

                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <h4 className="font-medium text-gray-900">Selected Files:</h4>
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-lg">{getFileIcon(file.name)}</span>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Add a description for these files..."
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_public"
                                                checked={data.is_public}
                                                onChange={(e) => setData('is_public', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                                                Make files public
                                            </label>
                                        </div>
                                    </div>

                                    {errors.files && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {errors.files}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing || files.length === 0}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

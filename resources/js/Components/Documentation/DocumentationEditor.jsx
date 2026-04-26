import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import parse from 'html-react-parser';
import CodeBlock from '@/Components/CodeBlock';
import PageEditor from './PageEditor';

export default function DocumentationEditor({ page: initialPage }) {
    const [activePage, setActivePage] = useState(initialPage || null);
    const [title, setTitle] = useState(initialPage?.title || 'Untitled');
    const [content, setContent] = useState(initialPage?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setActivePage(initialPage || null);
        setTitle(initialPage?.title || 'Untitled');
        setContent(initialPage?.content || '');
        // Only set view mode if page has an id and is published, never for new pages
        setIsViewMode(initialPage?.id && initialPage?.status === 'published');
    }, [initialPage]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsDirty(true);
    };

    const handleContentUpdate = (newContent) => {
        setContent(newContent);
        setIsDirty(true);
    };

    const handleSaveAndPublish = () => {
        setIsSaving(true);

        const data = {
            title: title || 'Untitled',
            content: content,
            status: 'published',
        };

        const routeName = activePage?.id ? 'documentation.update' : 'documentation.handle';
        const routeParams = activePage?.id ? { page: activePage.id } : {};
        const method = activePage?.id ? 'patch' : 'post';

        router[method](
            route(routeName, routeParams),
            data,
            {
                onSuccess: () => {
                    toast.success('Page saved and published successfully');
                    setIsDirty(false);
                    setIsViewMode(true);
                },
                onError: (errors) => {
                    toast.error('Failed to save page');
                },
                onFinish: () => {
                    setIsSaving(false);
                },
            }
        );
    };

    const handleSaveDraft = () => {
        setIsSaving(true);

        const data = {
            title: title || 'Untitled',
            content: content,
            status: 'draft',
        };

        const routeName = activePage?.id ? 'documentation.update' : 'documentation.handle';
        const routeParams = activePage?.id ? { page: activePage.id } : {};
        const method = activePage?.id ? 'patch' : 'post';

        router[method](
            route(routeName, routeParams),
            data,
            {
                onSuccess: () => {
                    toast.success('Draft saved successfully');
                    setIsDirty(false);
                },
                onError: (errors) => {
                    toast.error('Failed to save draft');
                },
                onFinish: () => {
                    setIsSaving(false);
                },
            }
        );
    };

    const handleEdit = () => {
        setIsViewMode(false);
    };

    const parseContent = (html) => {
        const options = {
            replace: ({ name, children, attribs }) => {
                if (name === 'pre' && children && children[0] && children[0].name === 'code') {
                    const codeContent = children[0].children;
                    let text = '';

                    if (Array.isArray(codeContent)) {
                        text = codeContent.map(child => {
                            if (typeof child === 'string') {
                                return child;
                            }
                            if (child && typeof child === 'object' && child.type === 'text') {
                                return child.data;
                            }
                            return '';
                        }).join('');
                    } else if (typeof codeContent === 'string') {
                        text = codeContent;
                    } else if (codeContent && typeof codeContent === 'object') {
                        text = codeContent.data || '';
                    }

                    return <CodeBlock>{text}</CodeBlock>;
                }
            },
        };

        return parse(html, options);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header with Save & Publish / Edit */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex gap-1 items-center">
                    {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isViewMode ? 'Documentation View' : 'Documentation Editor'}
                    </h1> */}
                    {isDirty && !isViewMode && (
                        <span className="text-sm italic text-gray-500 dark:text-gray-400">Unsaved changes</span>
                    )}
                </div>
                <div className="flex gap-3 items-center">
                    {isViewMode ? (
                        <Button onClick={handleEdit}>
                            Edit
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </Button>
                            <Button
                                onClick={handleSaveAndPublish}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Publishing...' : 'Save & Publish'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <div className="overflow-y-auto flex-1">
                <div className="px-6 py-8 mx-auto max-w-3xl">
                    {/* Title */}
                    {isViewMode ? (
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {title || 'Untitled'}
                        </h2>
                    ) : (
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Untitled"
                            className="mb-4 w-full text-4xl font-bold placeholder-gray-400 text-gray-900 bg-transparent border-none dark:placeholder-gray-500 dark:text-gray-100 focus:outline-none focus:ring-0"
                        />
                    )}

                    {/* Author Metadata */}
                    {activePage && (
                        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Authored by {activePage.author || 'Unknown'}
                        </div>
                    )}

                    {/* Rich Text Editor */}
                    {isViewMode ? (
                        <div className="max-w-none prose prose-lg dark:prose-invert prose-code:bg-gray-900 prose-code:dark:bg-gray-950 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-100 prose-code:dark:text-gray-100">
                            {parseContent(content)}
                        </div>
                    ) : (
                        <PageEditor page={activePage || { content: '' }} onUpdate={handleContentUpdate} />
                    )}
                </div>
            </div>
        </div>
    );
}

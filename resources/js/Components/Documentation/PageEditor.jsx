import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import EditorToolbar from './EditorToolbar';

export default function PageEditor({ page, onUpdate }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your page content here...',
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Underline,
        ],
        content: page?.content || '',
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert mx-auto focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
    });

    // Update editor content when page changes
    useEffect(() => {
        if (editor && page?.content !== editor.getHTML()) {
            editor.commands.setContent(page?.content || '');
        }
    }, [page?.content, editor]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

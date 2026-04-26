import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Image as ImageIcon,
    Eraser,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Code,
    FileCode
} from 'lucide-react';

export default function EditorToolbar({ editor }) {
    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded transition-colors ${
                isActive ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-1 flex-wrap bg-white dark:bg-gray-900">
            {/* Text Style Dropdown */}
            <select
                value={editor.getAttributes('paragraph').node?.attrs?.level || 'p'}
                onChange={(e) => {
                    if (e.target.value === 'h1') {
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                    } else if (e.target.value === 'h2') {
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                    } else if (e.target.value === 'h3') {
                        editor.chain().focus().toggleHeading({ level: 3 }).run();
                    } else {
                        editor.chain().focus().setParagraph().run();
                    }
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
            </select>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Basic Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
            >
                <Underline className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Image */}
            <ToolbarButton
                onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                }}
                title="Insert Image"
            >
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>

            {/* Clear Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear Formatting"
            >
                <Eraser className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Quote */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </ToolbarButton>

            {/* Link */}
            <ToolbarButton
                onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                title="Insert Link"
            >
                <LinkIcon className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Code */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
            >
                <Code className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
            >
                <FileCode className="w-4 h-4" />
            </ToolbarButton>
        </div>
    );
}

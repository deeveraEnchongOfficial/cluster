import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ children, className = '' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const codeText = typeof children === 'string' ? children : children?.props?.children || '';

        try {
            await navigator.clipboard.writeText(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative group my-4">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                title={copied ? 'Copied!' : 'Copy code'}
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                )}
            </button>
            <pre className={`bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto ${className}`}>
                <code className="block text-sm font-mono text-white whitespace-pre">
                    {children}
                </code>
            </pre>
        </div>
    );
}

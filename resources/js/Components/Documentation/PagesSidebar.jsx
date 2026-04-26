import { Plus, Settings } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function PagesSidebar({ pages, activePageId, onPageCreate, onPageSelect }) {
    const handleCreatePage = () => {
        onPageCreate();
    };

    const handleSelectPage = (page) => {
        onPageSelect(page);
    };

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* Pages Section */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pages</h2>
                        <button
                            onClick={handleCreatePage}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Create new page"
                        >
                            <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Page List */}
                <div className="py-2">
                    {pages.length === 0 ? (
                        <button
                            onClick={handleCreatePage}
                            className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            + New Page
                        </button>
                    ) : (
                        <>
                            {pages.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => handleSelectPage(page)}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                        activePageId === page.id
                                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="truncate">{page.title || 'Untitled'}</div>
                                </button>
                            ))}
                            <button
                                onClick={handleCreatePage}
                                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                + New Page
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Section */}
            <div className="px-4 py-3 border-t border-gray-200">
                <button
                    onClick={() => router.visit('/settings')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>
        </div>
    );
}

import DocumentationEditor from '@/Components/Documentation/DocumentationEditor';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DocumentationIndex({ pages }) {
    return (
        <AdminLayout title="Documentation">
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <p className="text-lg mb-2">Select a page from the sidebar</p>
                    <p className="text-sm">Or create a new page to get started</p>
                </div>
            </div>
        </AdminLayout>
    );
}

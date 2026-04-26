import DocumentationEditor from '@/Components/Documentation/DocumentationEditor';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DocumentationUpsert({ page, pages }) {
    return (
        <AdminLayout title={page ? page.title : 'New Page'}>
            <DocumentationEditor page={page} />
        </AdminLayout>
    );
}

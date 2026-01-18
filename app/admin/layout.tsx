import { requireAdmin } from '@/lib/admin/auth';
import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    //  Require admin authentication
    await requireAdmin();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header */}
                <AdminHeader />

                {/* Page Content */}
                <main className="py-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

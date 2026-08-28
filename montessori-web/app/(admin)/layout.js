import AdminShell from '../../components/shells/AdminShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_ADMIN']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}

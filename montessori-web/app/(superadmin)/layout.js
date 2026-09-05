import SuperAdminShell from '../../components/shells/SuperAdminShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export default function SuperAdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <SuperAdminShell>{children}</SuperAdminShell>
    </ProtectedRoute>
  );
}

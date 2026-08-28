import ParentShell from '../../components/shells/ParentShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export default function ParentLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <ParentShell>{children}</ParentShell>
    </ProtectedRoute>
  );
}

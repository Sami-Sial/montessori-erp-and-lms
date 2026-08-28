import ProtectedRoute from '../../components/shared/ProtectedRoute';
import StudentShell from '../../components/shells/StudentShell';

export default function StudentLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <StudentShell>{children}</StudentShell>
    </ProtectedRoute>
  );
}

import TeacherShell from '../../components/shells/TeacherShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['TEACHER', 'GUIDE', 'FRONT_DESK']}>
      <TeacherShell>{children}</TeacherShell>
    </ProtectedRoute>
  );
}

import HRShell from '../../components/shells/HRShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export const metadata = {
  title: 'HR Dashboard | Montessori',
};

export default function HRLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'HR_STAFF']}>
      <HRShell>
        {children}
      </HRShell>
    </ProtectedRoute>
  );
}

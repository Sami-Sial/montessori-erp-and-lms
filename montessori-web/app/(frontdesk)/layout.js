import FrontDeskShell from '../../components/shells/FrontDeskShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export const metadata = {
  title: 'Front Desk Dashboard | Montessori',
};

export default function FrontDeskLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['FRONT_DESK', 'ORG_ADMIN', 'SUPER_ADMIN']}>
      <FrontDeskShell>{children}</FrontDeskShell>
    </ProtectedRoute>
  );
}

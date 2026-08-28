import FinanceShell from '../../components/shells/FinanceShell';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

export default function FinanceLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['FINANCE_STAFF', 'HR_STAFF']}>
      <FinanceShell>{children}</FinanceShell>
    </ProtectedRoute>
  );
}

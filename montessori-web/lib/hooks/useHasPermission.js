import { useSelector } from 'react-redux';
import { selectPermissions } from '../../store/authSlice';

/**
 * Returns true if the current user holds the given permission key.
 * Pass null/undefined to always return true (no permission required).
 *
 * Usage:
 *   const canMark = useHasPermission('attendance:mark');
 *   const canAll  = useHasPermission(['student:read', 'attendance:read']); // AND
 */
export default function useHasPermission(permissionKey) {
  const permissions = useSelector(selectPermissions);

  if (!permissionKey) return true;

  if (Array.isArray(permissionKey)) {
    return permissionKey.every((k) => permissions.includes(k));
  }

  return permissions.includes(permissionKey);
}

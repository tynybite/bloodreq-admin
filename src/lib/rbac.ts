export type AdminRole = 'super_admin' | 'admin' | 'manager';

export const ROLES: Record<string, AdminRole> = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
};

// Define which roles can access which paths (roughly mapping to Sidebar items)
export const PERMISSIONS: Record<string, AdminRole[]> = {
  '/admin/dashboard': ['super_admin', 'admin', 'manager'],
  '/admin/blood-requests': ['super_admin', 'admin', 'manager'],
  '/admin/fundraisers': ['super_admin', 'admin', 'manager'],
  '/admin/donations': ['super_admin', 'admin', 'manager'],
  '/admin/users': ['super_admin', 'admin', 'manager'],
  '/admin/locations': ['super_admin', 'admin', 'manager'],
  '/admin/moderators': ['super_admin', 'admin'],
  '/admin/ads': ['super_admin', 'admin', 'manager'],
  '/admin/translations': ['super_admin', 'admin', 'manager'],
  '/admin/reports': ['super_admin', 'admin', 'manager'],
  '/admin/notifications': ['super_admin', 'admin', 'manager'],
  '/admin/email': ['super_admin'],
  '/admin/payment-settings': ['super_admin', 'admin'],
  '/admin/settings': ['super_admin', 'admin'],
};

export function hasAccess(role: AdminRole, path: string): boolean {
  // If path is not strictly defined, assume strictly restricted or default allow? 
  // Let's iterate exact matches or startsWith for sub-routes
  const allowedRoles = PERMISSIONS[path];
  if (allowedRoles) return allowedRoles.includes(role);
  
  // Check strict prefixes if direct match not found
  // e.g. /admin/blood-requests/new should benefit from /admin/blood-requests permission
  const parentPath = Object.keys(PERMISSIONS).find(p => path.startsWith(p));
  if (parentPath) {
      return PERMISSIONS[parentPath].includes(role);
  }

  // Default DENY for security
  return false;
}

export function filterMenuItems(menuItems: any[], role: AdminRole) {
  return menuItems.filter(item => hasAccess(role, item.href));
}

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

type UserRole = 'admin' | 'kassir' | 'yordamchi' | 'omborchi';

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const userRole = req.user.role as UserRole;
    console.log(`🔐 Authorization check: User role="${userRole}", Allowed roles=[${allowedRoles.join(', ')}]`);

    if (!allowedRoles.includes(userRole)) {
      console.log(`❌ Authorization failed: Role "${userRole}" not in allowed roles`);
      sendError(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    console.log('✅ Authorization successful');
    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('admin');

/**
 * Kassir only middleware
 */
export const kassirOnly = authorize('kassir');

/**
 * Yordamchi only middleware
 */
export const yordamchiOnly = authorize('yordamchi');

/**
 * Omborchi only middleware
 */
export const omborchiOnly = authorize('omborchi');

/**
 * Admin or Kassir middleware
 */
export const adminOrKassir = authorize('admin', 'kassir');

/**
 * Admin or Omborchi middleware
 */
export const adminOrOmborchi = authorize('admin', 'omborchi');

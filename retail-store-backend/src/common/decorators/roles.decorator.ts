import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * Access: all authenticated users may read catalog and create sales.
 * Manager-only writes: categories, products, reports.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

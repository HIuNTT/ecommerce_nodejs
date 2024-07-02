import { SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);

// ...roles là toán tử rest parameter , roles sẽ là dạng mảng string

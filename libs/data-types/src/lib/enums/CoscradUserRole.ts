import { isEnum } from '@coscrad/validation';

export enum CoscradUserRole {
    super = 'super', // Technical Admin
    admin = 'admin', // Project admin- can read and write
    viewer = 'viewer', // Authenticated user- can read including non-public materials if they are in the read ACL
}

export const isCoscardUserRole = (input: unknown): input is CoscradUserRole =>
    isEnum(input, CoscradUserRole);

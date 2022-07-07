import { isEnum } from '@coscrad/validation';

export enum CoscradUserRole {
    superAdmin = 'superAdmin', // Technical Admin
    projectAdmin = 'projectAdmin', // Project admin- can read and write
    viewer = 'viewer', // Authenticated user- can read including non-public materials if they are in the read ACL
}

export const isCoscardUserRole = (input: unknown): input is CoscradUserRole =>
    isEnum(input, CoscradUserRole);

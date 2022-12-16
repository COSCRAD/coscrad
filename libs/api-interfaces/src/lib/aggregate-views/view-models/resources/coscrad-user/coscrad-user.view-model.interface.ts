import { CoscradUserRole } from './coscrad-user-role';

export interface ICoscradUserViewModel {
    username: string;
    // TODO Make this CoscradUserRole
    roles: CoscradUserRole[];
}

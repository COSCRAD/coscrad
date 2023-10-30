import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { DeepPartial } from '../../../../../../types/DeepPartial';
import BaseDomainModel from '../../../../BaseDomainModel';
import { CoscradUserGroup } from '../../../group/entities/coscrad-user-group.entity';
import { CoscradUser } from './coscrad-user.entity';

export class CoscradUserWithGroups extends CoscradUser {
    readonly groups: CoscradUserGroup[];

    constructor(user: CoscradUser, userGroups: CoscradUserGroup[]) {
        super(user.toDTO());

        this.groups = userGroups.map((group) => group.clone({}));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override clone<T extends BaseDomainModel>(this: T, overrides?: DeepPartial<DTO<T>>): T {
        /**
         * Because this class constructor has a different API, our generic
         * implementation of clone fails.
         *
         * TODO Fix this.
         */
        throw new InternalError(`Not Implemented: CoscradUserWithGroups.clone`);
    }
}

import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { DTO } from '../../../../../../types/DTO';
import { DeepPartial } from '../../../../../../types/DeepPartial';
import { CoscradUserGroup } from '../../../group/entities/coscrad-user-group.entity';
import { CoscradUser } from './coscrad-user.entity';

export class CoscradUserWithGroups extends CoscradUser {
    readonly groups: CoscradUserGroup[];

    constructor(user: CoscradUser, userGroups: CoscradUserGroup[]) {
        super(user.toDTO());

        this.groups = userGroups.map((group) => group.clone({}));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-expect-error this is tricky
    override clone<T extends CoscradUserWithGroups>(
        this: T,
        overrides?: DeepPartial<DTO<CoscradUserWithGroups>>
    ): T {
        const groups = overrides?.groups
            ? overrides.groups.map(
                  // @ts-expect-error TODO fix this issue
                  (g) => new CoscradUserGroup(g)
              )
            : this.groups.map((g) => g.clone());

        return new CoscradUserWithGroups(
            new CoscradUser(clonePlainObjectWithOverrides(super.toDTO(), overrides)),
            groups
        ) as T;
    }
}

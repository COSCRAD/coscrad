import { CoscradUserRole } from '@coscrad/data-types';
import { CoscradUserProfile } from '../domain/models/user-management/user/entities/coscrad-user-profile.entity';
import { CoscradUser } from '../domain/models/user-management/user/entities/coscrad-user.entity';
import { AggregateType } from '../domain/types/AggregateType';
import { DTO } from '../types/DTO';

const dummyProfile: DTO<CoscradUserProfile> = {
    name: {
        first: 'James',
        last: 'Jones',
    },
    email: 'llcj1985@hotmale.com',
    contact: {},
    dateOfBirth: 'beginning of time',
    communityConnection: 'break dance instructor',
};

const dtos: DTO<CoscradUser>[] = [
    {
        type: AggregateType.user,
        id: 'auth0|123',

        profile: new CoscradUserProfile(dummyProfile),
        username: 'cool-james',
        roles: [CoscradUserRole.viewer],
    },
];

export default (): CoscradUser[] => dtos.map((dto) => new CoscradUser(dto));

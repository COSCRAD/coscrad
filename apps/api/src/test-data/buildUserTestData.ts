import { CoscradUserRole } from '@coscrad/data-types';
import { CoscradUserProfile } from '../domain/models/user-management/user/entities/user/coscrad-user-profile.entity';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateType } from '../domain/types/AggregateType';
import { DTO } from '../types/DTO';

const dummyProfile: DTO<CoscradUserProfile> = {
    name: {
        firstName: 'James',
        lastName: 'Jones',
    },
    email: 'llcj1985@aol.com',
};

const dtos: DTO<CoscradUser>[] = [
    {
        type: AggregateType.user,
        id: '1', // this is not allowed in arango! 'auth0|123',

        profile: new CoscradUserProfile(dummyProfile),
        username: 'cool-james',
        roles: [CoscradUserRole.viewer],
    },
];

export default (): CoscradUser[] => dtos.map((dto) => new CoscradUser(dto));

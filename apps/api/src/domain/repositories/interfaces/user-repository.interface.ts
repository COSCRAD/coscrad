import { Maybe } from '../../../lib/types/maybe';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { IRepositoryForAggregate } from './repository-for-aggregate.interface';

export interface IUserRepository extends IRepositoryForAggregate<CoscradUser> {
    fetchByProviderId: (authProviderUserId: string) => Promise<Maybe<CoscradUser>>;
}

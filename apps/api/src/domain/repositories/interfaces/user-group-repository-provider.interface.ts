import { IRepositoryForAggregate } from '../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { CoscradUserGroup } from '../../models/user-management/group/entities/coscrad-user-group.entity';

export interface IUserGroupRepositoryProvider {
    getUserGroupRepository: () => IRepositoryForAggregate<CoscradUserGroup>;
}

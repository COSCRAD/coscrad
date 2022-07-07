import { IRepositoryForAggregate } from '../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { CoscradUser } from '../../models/user-management/user/entities/coscrad-user.entity';

export interface IUserRepositoryProvider {
    getUserRepository: () => IRepositoryForAggregate<CoscradUser>;
}

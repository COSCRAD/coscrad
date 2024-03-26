import { CoscradContributor } from '../../models/user-management/contributor/entities/coscrad-contributor.entity';
import { IRepositoryForAggregate } from './repository-for-aggregate.interface';

export interface IContributorRepository {
    getContributorRepository: () => IRepositoryForAggregate<CoscradContributor>;
}

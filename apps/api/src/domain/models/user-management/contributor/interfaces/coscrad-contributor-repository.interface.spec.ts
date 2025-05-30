import { IRepositoryForAggregate } from '../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { CoscradContributor } from '../entities';

export const COSCRAD_CONTRIBUTOR_REPOSITORY_INJECTION_TOKEN =
    'COSCRAD_CONTRIBUTOR_REPOSITORY_INJECTION_TOKEN';

export interface ICoscradContributorRepository extends IRepositoryForAggregate<CoscradContributor> {
    fetchMultipleById(ids: string[]): Promise<CoscradContributor[]>;
}

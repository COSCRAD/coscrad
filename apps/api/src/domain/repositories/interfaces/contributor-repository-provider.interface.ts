import { ICoscradContributorQueryRepository } from '../../models/user-management';

export interface IContributorRepositoryProvider {
    getContributorRepository: () => ICoscradContributorQueryRepository;
}

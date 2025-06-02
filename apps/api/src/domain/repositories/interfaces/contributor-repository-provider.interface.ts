import { ICoscradContributorRepository } from '../../models/user-management';

export interface IContributorRepositoryProvider {
    getContributorRepository: () => ICoscradContributorRepository;
}

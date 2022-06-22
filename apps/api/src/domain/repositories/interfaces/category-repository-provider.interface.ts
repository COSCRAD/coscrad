import { ICategoryRepository } from './category-repository.interface';

export interface ICategoryRepositoryProvider {
    getCategoryRepository: () => ICategoryRepository;
}

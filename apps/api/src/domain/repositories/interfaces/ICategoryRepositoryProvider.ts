import { ICategoryRepository } from './ICategoryRepository';

export interface ICategoryRepositoryProvider {
    getCategoryRepository: () => ICategoryRepository;
}

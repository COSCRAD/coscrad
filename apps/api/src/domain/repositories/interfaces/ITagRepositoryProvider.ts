import { TagRepository } from './TagRepository';

export interface ITagRepositoryProvider {
    getTagRepository: () => TagRepository;
}

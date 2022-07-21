import { TagRepository } from './tag-repository.interface';

export interface ITagRepositoryProvider {
    getTagRepository: () => TagRepository;
}

import { Tag } from 'apps/api/src/domain/models/tag/tag.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { TagViewModel } from '../viewModels/tag.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';

export default async ({
    repositoryProvider,
}: ViewModelBuilderDependencies): Promise<TagViewModel[]> => {
    const tagRepository = repositoryProvider.forEntity<Tag>(entityTypes.tag);

    const searchResult = await tagRepository.fetchMany();

    const allTagViewModels = searchResult
        .filter((result): result is Tag => !isInternalError(result))
        .map((tag) => new TagViewModel(tag));

    return allTagViewModels;
};

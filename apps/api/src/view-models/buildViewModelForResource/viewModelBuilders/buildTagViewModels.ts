import { Tag } from '../../../domain/models/tag/tag.entity';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { isInternalError } from '../../../lib/errors/InternalError';
import { TagViewModel } from '../viewModels/tag.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';

export default async ({
    repositoryProvider,
}: ViewModelBuilderDependencies): Promise<TagViewModel[]> => {
    const tagRepository = repositoryProvider.forResource<Tag>(resourceTypes.tag);

    const searchResult = await tagRepository.fetchMany();

    const allTagViewModels = searchResult
        .filter((result): result is Tag => !isInternalError(result))
        .map((tag) => new TagViewModel(tag));

    return allTagViewModels;
};

import { Tag } from 'apps/api/src/domain/models/tag/tag.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityType';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ViewModelBuilderDependencies } from '../buildViewModelForEntity';
import { TagViewModel } from '../viewModels/TagViewModel';

export default async ({
  repositoryProvider,
}: ViewModelBuilderDependencies): Promise<TagViewModel[]> => {
  const tagRepository = repositoryProvider.forEntity<Tag>(entityTypes.tag);

  const searchResult = await tagRepository.fetchMany();

  const allTagViewModels = searchResult
    .filter((result): result is Tag => !isInternalError(result))
    // Note: There is no publication logic for Tags
    .map((tag) => new TagViewModel(tag));

  return allTagViewModels;
};

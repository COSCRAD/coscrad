import { Song } from '../../../domain/models/song/song.entity';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { isInternalError } from '../../../lib/errors/InternalError';
import { SongViewModel } from '../viewModels/song.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<SongViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const songRepository = repositoryProvider.forResource<Song>(resourceTypes.song);

    const searchResult = await songRepository.fetchMany(isPublishedSpecification);

    return searchResult
        .filter((result): result is Song => !isInternalError(result))
        .map((song) => new SongViewModel(song));
};

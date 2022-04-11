import { Photograph } from 'apps/api/src/domain/models/photograph/entities/photograph.entity';
import IsPublished from 'apps/api/src/domain/repositories/specifications/isPublished';
import { resourceTypes } from 'apps/api/src/domain/types/resourceTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { PhotographViewModel } from '../viewModels/photograph.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider, configService }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<PhotographViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const baseAudioURL = configService.get<string>('BASE_DIGITAL_ASSET_URL');

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const photographRepository = repositoryProvider.forResource<Photograph>(
        resourceTypes.photograph
    );

    const searchResult = await photographRepository.fetchMany(isPublishedSpecification);

    const allPhotographViewModels = searchResult
        .filter((result): result is Photograph => !isInternalError(result))
        .map((Photograph) => new PhotographViewModel(Photograph, baseAudioURL));

    return allPhotographViewModels;
};

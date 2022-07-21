import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
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

    const baseURL = configService.get<string>('BASE_DIGITAL_ASSET_URL');

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const photographRepository = repositoryProvider.forResource<Photograph>(
        ResourceType.photograph
    );

    const searchResult = await photographRepository.fetchMany(isPublishedSpecification);

    const allPhotographViewModels = searchResult
        .filter((result): result is Photograph => !isInternalError(result))
        .map((Photograph) => new PhotographViewModel(Photograph, baseURL));

    return allPhotographViewModels;
};

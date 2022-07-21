import { ISpatialFeature } from '../../../domain/models/spatial-feature/ISpatialFeature';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { SpatialFeatureViewModel } from '../viewModels/spatial-data/spatial-feature.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<SpatialFeatureViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const spatialFeatureRepository = repositoryProvider.forResource<ISpatialFeature>(
        ResourceType.spatialFeature
    );

    const searchResult = await spatialFeatureRepository.fetchMany(isPublishedSpecification);

    const allViewModels = searchResult
        .filter((result): result is ISpatialFeature => !isInternalError(result))
        .map((spatialFeature) => new SpatialFeatureViewModel(spatialFeature));

    return allViewModels;
};

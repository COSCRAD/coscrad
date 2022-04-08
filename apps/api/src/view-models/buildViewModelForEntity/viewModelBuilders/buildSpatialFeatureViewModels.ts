import { ISpatialFeature } from 'apps/api/src/domain/models/spatial-feature/ISpatialFeature';
import IsPublished from 'apps/api/src/domain/repositories/specifications/isPublished';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
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

    const spatialFeatureRepository = repositoryProvider.forEntity<ISpatialFeature>(
        entityTypes.spatialFeature
    );

    const searchResult = await spatialFeatureRepository.fetchMany(isPublishedSpecification);

    const allViewModels = searchResult
        .filter((result): result is ISpatialFeature => !isInternalError(result))
        .map((spatialFeature) => new SpatialFeatureViewModel(spatialFeature));

    return allViewModels;
};

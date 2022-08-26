import { ResourceType } from '../../../../types/ResourceType';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

export const buildInvalidSpatialFeatureDtoError = buildInvariantValidationErrorFactoryFunction(
    ResourceType.spatialFeature
);

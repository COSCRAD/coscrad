import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import NullOrUndefinedAggregateDTOError from '../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { isValid } from '../../../domainModelValidators/Valid';
import { SpatialFeature } from '../../../models/spatial-feature/interfaces/spatial-feature.entity';
import isGeometricFeatureType from '../../../models/spatial-feature/types/isGeometricFeatureType';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { InstanceFactory } from '../../get-instance-factory-for-resource';
import buildSpatialFeatureInstance from './build-spatial-feature-instance';

const spatialDataFactory: InstanceFactory<SpatialFeature> = (dto: unknown) => {
    const resourceType = ResourceType.spatialFeature;

    const test = dto as SpatialFeature;

    if (isNullOrUndefined(dto)) return new NullOrUndefinedAggregateDTOError(resourceType);

    const { id } = test;

    if (!isGeometricFeatureType(test?.geometry?.type))
        return new InvariantValidationError({ type: resourceType, id }, [
            new InternalError(`Invalid gemoetric feature type: ${resourceType}`),
        ]);

    const instance = buildSpatialFeatureInstance(dto as DTO<SpatialFeature>);

    if (isInternalError(instance)) return instance;

    const invariantValidationResult = instance.validateInvariants();

    if (isValid(invariantValidationResult)) return instance;

    return invariantValidationResult;
};

export default () => spatialDataFactory;

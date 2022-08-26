import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import NullOrUndefinedAggregateDTOError from '../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { isValid } from '../../../domainModelValidators/Valid';
import { ISpatialFeature } from '../../../models/spatial-feature/interfaces/spatial-feature.interface';
import isGeometricFeatureType from '../../../models/spatial-feature/types/isGeometricFeatureType';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { InstanceFactory } from '../../getInstanceFactoryForResource';
import buildSpatialFeatureInstance from './buildSpatialFeatureInstance';

const spatialDataFactory: InstanceFactory<ISpatialFeature> = (dto: unknown) => {
    const resourceType = ResourceType.spatialFeature;

    const test = dto as ISpatialFeature;

    if (isNullOrUndefined(dto)) return new NullOrUndefinedAggregateDTOError(resourceType);

    const { id } = test;

    if (!isGeometricFeatureType(test?.geometry?.type))
        return new InvariantValidationError({ type: resourceType, id }, [
            new InternalError(`Invalid gemoetric feature type: ${resourceType}`),
        ]);

    const instance = buildSpatialFeatureInstance(dto as DTO<ISpatialFeature>);

    if (isInternalError(instance)) return instance;

    const invariantValidationResult = instance.validateInvariants();

    if (isValid(invariantValidationResult)) return instance;

    return invariantValidationResult;
};

export default () => spatialDataFactory;

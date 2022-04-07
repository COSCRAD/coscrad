import { InternalError } from '../../../../../lib/errors/InternalError';
import { ISpatialFeature } from '../../../../models/spatial-feature/ISpatialFeature';
import { entityTypes } from '../../../../types/entityTypes';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import spatialFeatureValidator from '../../../spatialFeatureValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(entityTypes.spatialFeature).toDTO();

export const buildSpatialFeatureTestCase = (): DomainModelValidatorTestCase<ISpatialFeature> => ({
    entityType: entityTypes.spatialFeature,
    validator: spatialFeatureValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedDTOError(entityTypes.spatialFeature) as InternalError,
        },
    ],
});

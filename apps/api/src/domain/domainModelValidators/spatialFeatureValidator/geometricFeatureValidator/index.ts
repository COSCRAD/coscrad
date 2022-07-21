import { InternalError } from '../../../../lib/errors/InternalError';
import { IGeometricFeature } from '../../../models/spatial-feature/GeometricFeature';
import isGeometricFeatureType from '../../../models/spatial-feature/types/isGeometricFeatureType';
import { DomainModelValidator } from '../../types/DomainModelValidator';
import { Valid } from '../../Valid';
import buildGeometricFeatureValidatorChain from './buildGeometricFeatureValidatorChain';

const geometricFeatureValidator: DomainModelValidator = (input: unknown): Valid | InternalError => {
    const test = input as IGeometricFeature;

    const { type } = test;

    // Fail early as the chain validation pattern doesn't make sense without a valid geometric feature type
    if (!isGeometricFeatureType(type)) {
        return new InternalError(
            `Encountered a geometric feature DTO with an invalid type: ${type}`
        );
    }

    // This is the [chain of responsibility](https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern)  pattern
    const allErrors = buildGeometricFeatureValidatorChain().reduce(
        (accumulatedErrors, validator) => validator(test, accumulatedErrors),
        []
    );

    if (allErrors.length > 0)
        return new InternalError(
            `Encountered invalid dto for geometric feature. See inner errors for more details.`,
            allErrors
        );

    return Valid;
};

export default geometricFeatureValidator;

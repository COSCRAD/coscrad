import { InternalError } from '../../../../../lib/errors/InternalError';
import { Photograph } from '../../../../models/photograph/entities/photograph.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import photographValidator from '../../../photographValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.photograph).toDTO();

export const buildPhotographTestCase = (): DomainModelValidatorTestCase<Photograph> => ({
    resourceType: resourceTypes.photograph,
    validator: photographValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedDTOError(resourceTypes.photograph) as InternalError,
        },
        {
            description: 'No photographer is specified',
            invalidDTO: {
                ...validDTO,
                photographer: undefined,
            },
            // TODO compare inner errors as well
            expectedError: new InvalidEntityDTOError(resourceTypes.photograph, validDTO.id),
        },
        {
            description: 'The photograph has a negative height',
            invalidDTO: {
                ...validDTO,
                dimensions: {
                    heightPX: -100,
                    widthPX: validDTO.dimensions.widthPX,
                },
            },
            // TODO compare inner errors as well
            expectedError: new InvalidEntityDTOError(resourceTypes.photograph, validDTO.id),
        },
        {
            description: 'The photograph has a negative width',
            invalidDTO: {
                ...validDTO,
                dimensions: {
                    heightPX: validDTO.dimensions.heightPX,
                    widthPX: -240,
                },
            },
            // TODO compare inner errors as well
            expectedError: new InvalidEntityDTOError(resourceTypes.photograph, validDTO.id),
        },
    ],
});

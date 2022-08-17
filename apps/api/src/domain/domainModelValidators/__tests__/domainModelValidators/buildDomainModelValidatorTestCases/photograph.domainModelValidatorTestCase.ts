import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResourceType } from '../../../../types/ResourceType';
import NullOrUndefinedAggregateDTOError from '../../../errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

const resourceType = ResourceType.photograph;

const validDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

export const buildPhotographTestCase =
    (): DomainModelValidatorTestCase<ResourceType.photograph> => ({
        resourceType: ResourceType.photograph,
        validCases: [
            {
                dto: validDTO,
            },
        ],
        invalidCases: [
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedAggregateDTOError(
                    ResourceType.photograph
                ) as InternalError,
            },
            {
                description: 'No photographer is specified',
                invalidDTO: {
                    ...validDTO,
                    photographer: undefined,
                },
                // TODO compare inner errors as well
                expectedError: buildTopLevelError(validDTO.id, []),
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
                expectedError: buildTopLevelError(validDTO.id, []),
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
                expectedError: buildTopLevelError(validDTO.id, []),
            },
        ],
    });

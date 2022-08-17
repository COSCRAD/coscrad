import { ResourceType } from '../../../../types/ResourceType';
import NullOrUndefinedAggregateDTOError from '../../../errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';

const resourceType = ResourceType.transcribedAudio;

const validDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

export const buildTranscribedAudioTestCase =
    (): DomainModelValidatorTestCase<ResourceType.transcribedAudio> => ({
        resourceType: resourceType,
        validCases: [
            {
                dto: validDTO,
            },
        ],
        invalidCases: [
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedAggregateDTOError(ResourceType.transcribedAudio),
            },
        ],
    });

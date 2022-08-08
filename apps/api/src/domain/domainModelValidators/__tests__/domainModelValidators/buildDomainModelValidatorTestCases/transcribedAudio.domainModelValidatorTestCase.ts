import { TranscribedAudio } from '../../../../models/transcribed-audio/entities/transcribed-audio.entity';
import { ResourceType } from '../../../../types/ResourceType';
import NullOrUndefinedResourceDTOError from '../../../errors/NullOrUndefinedResourceDTOError';
import transcribedAudioValidator from '../../../transcribedAudioValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';

const validDTO = getValidAggregateInstanceForTest(ResourceType.transcribedAudio).toDTO();

export const buildTranscribedAudioTestCase =
    (): DomainModelValidatorTestCase<TranscribedAudio> => ({
        resourceType: ResourceType.transcribedAudio,
        validator: transcribedAudioValidator,
        validCases: [
            {
                dto: validDTO,
            },
        ],
        invalidCases: [
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedResourceDTOError(ResourceType.transcribedAudio),
            },
        ],
    });

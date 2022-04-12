import { TranscribedAudio } from '../../../../models/transcribed-audio/entities/transcribed-audio.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import NullOrUndefinedResourceDTOError from '../../../errors/NullOrUndefinedResourceDTOError';
import transcribedAudioValidator from '../../../transcribedAudioValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.transcribedAudio).toDTO();

export const buildTranscribedAudioTestCase =
    (): DomainModelValidatorTestCase<TranscribedAudio> => ({
        resourceType: resourceTypes.transcribedAudio,
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
                expectedError: new NullOrUndefinedResourceDTOError(resourceTypes.transcribedAudio),
            },
        ],
    });

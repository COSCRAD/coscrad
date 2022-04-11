import { TranscribedAudio } from '../../../../models/transcribed-audio/entities/transcribed-audio.entity';
import { entityTypes } from '../../../../types/entityTypes';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import transcribedAudioValidator from '../../../transcribedAudioValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(entityTypes.transcribedAudio).toDTO();

export const buildTranscribedAudioTestCase =
    (): DomainModelValidatorTestCase<TranscribedAudio> => ({
        entityType: entityTypes.transcribedAudio,
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
                expectedError: new NullOrUndefinedDTOError(entityTypes.transcribedAudio),
            },
        ],
    });

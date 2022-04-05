import { AudioWithTranscript } from '../../../../models/audio-with-transcript/entities/audio-with-transcript.entity';
import { entityTypes } from '../../../../types/entityTypes';
import audioWithTranscriptValidator from '../../../audioWithTranscriptValidator';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(entityTypes.audioWithTranscript).toDTO();

export const buildAudioWithTranscriptTestCase =
    (): DomainModelValidatorTestCase<AudioWithTranscript> => ({
        entityType: entityTypes.audioWithTranscript,
        validator: audioWithTranscriptValidator,
        validCases: [
            {
                dto: validDTO,
            },
        ],
        invalidCases: [
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedDTOError(entityTypes.audioWithTranscript),
            },
        ],
    });

import { InternalError } from '../../../../../lib/errors/InternalError';
import { Song } from '../../../../models/song/song.entity';
import { EntityId } from '../../../../types/ResourceId';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import songValidator from '../../../songValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.song).toDTO();

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]) =>
    new InvalidEntityDTOError(resourceTypes.song, id, innerErrors);

export const buildSongTestCase = (): DomainModelValidatorTestCase<Song> => ({
    resourceType: resourceTypes.song,
    validator: songValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'audioURL is an empty string',
            invalidDTO: {
                ...validDTO,
                audioURL: '',
            },
            expectedError: buildTopLevelError(validDTO.id, [new InternalError('bad')]),
        },
        {
            description: 'the start comes after the length',
            invalidDTO: {
                ...validDTO,
                startMilliseconds: validDTO.lengthMilliseconds + 5,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'song does not have a title in any language',
            invalidDTO: {
                ...validDTO,
                title: undefined,
                titleEnglish: undefined,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'title is an empty string',
            invalidDTO: {
                ...validDTO,
                title: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'titleEnglish is an empty string',
            invalidDTO: {
                ...validDTO,
                titleEnglish: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'lyrics property is an empty string',
            invalidDTO: {
                ...validDTO,
                lyrics: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the song has a negative length',
            invalidDTO: {
                ...validDTO,
                lengthMilliseconds: -100,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the song has a negative start point',
            invalidDTO: {
                ...validDTO,
                startMilliseconds: -100,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
    ],
});

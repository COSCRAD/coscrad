import { InternalError } from '../../../../../lib/errors/InternalError';
import { ContributorAndRole } from '../../../../models/song/ContributorAndRole';
import { Song } from '../../../../models/song/song.entity';
import { AggregateId } from '../../../../types/AggregateId';
import { ResourceType } from '../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../errors/InvalidResourceDTOError';
import songValidator from '../../../songValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidResourceInstanceForTest from '../utilities/getValidResourceInstanceForTest';

const validDTO = getValidResourceInstanceForTest(ResourceType.song).toDTO();

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]) =>
    new InvalidResourceDTOError(ResourceType.song, id, innerErrors);

export const buildSongTestCase = (): DomainModelValidatorTestCase<Song> => ({
    resourceType: ResourceType.song,
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
            description: 'the audioURL has an invalid protocol',
            invalidDTO: {
                ...validDTO,
                audioURL: 'myprotocol:wwww.soundcloud.com',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
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
            description: 'one of the contributors is a plain string',
            invalidDTO: {
                ...validDTO,
                contributions: [...validDTO.contributions, 'John Doe'] as ContributorAndRole[],
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

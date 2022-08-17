import { InternalError } from '../../../../../lib/errors/InternalError';
import { ContributorAndRole } from '../../../../models/song/ContributorAndRole';
import { ResourceType } from '../../../../types/ResourceType';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

const resourceType = ResourceType.song;

const validDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

export const buildSongTestCase = (): DomainModelValidatorTestCase<ResourceType.song> => ({
    resourceType: ResourceType.song,
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

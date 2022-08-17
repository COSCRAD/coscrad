import { MIMEType } from '@coscrad/data-types';
import { ContributorAndRole } from '../../../../models/song/ContributorAndRole';
import { ResourceType } from '../../../../types/ResourceType';
import MediaItemHasNoTitleInAnyLanguageError from '../../../errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import NullOrUndefinedAggregateDTOError from '../../../errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

const resourceType = ResourceType.mediaItem;

const validDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

export const buildmediaItemTestCase = (): DomainModelValidatorTestCase<ResourceType.mediaItem> => ({
    resourceType: ResourceType.mediaItem,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'the dto is undefined',
            invalidDTO: undefined,
            expectedError: new NullOrUndefinedAggregateDTOError(ResourceType.mediaItem),
        },
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedAggregateDTOError(ResourceType.mediaItem),
        },
        {
            description: 'the media item has no title in either language',
            invalidDTO: {
                ...validDTO,
                title: undefined,
                titleEnglish: undefined,
            },
            expectedError: buildTopLevelError(validDTO.id, [
                new MediaItemHasNoTitleInAnyLanguageError(validDTO.id),
            ]),
        },
        {
            description: 'the MIME type is not in the allowed MIME types list',
            invalidDTO: {
                ...validDTO,
                mimeType: 'audio/BOGUS' as MIMEType,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the title is an empty string',
            invalidDTO: {
                ...validDTO,
                title: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: "the title's English translation is an empty string",
            invalidDTO: {
                ...validDTO,
                titleEnglish: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'One of the contributors is a plain number',
            invalidDTO: {
                ...validDTO,
                contributorAndRoles: [
                    {
                        contributorId: '22',
                        role: 'performer',
                    },
                    23 as unknown as ContributorAndRole,
                ],
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the url has an extra . before the TLD',
            invalidDTO: {
                ...validDTO,
                url: 'https://www.songs..org',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the length is Infinity',
            invalidDTO: {
                ...validDTO,
                lengthMilliseconds: Infinity,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
    ],
});

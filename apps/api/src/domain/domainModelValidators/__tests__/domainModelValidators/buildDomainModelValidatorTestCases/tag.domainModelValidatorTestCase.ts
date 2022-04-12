import { InternalError } from '../../../../../lib/errors/InternalError';
import { Tag } from '../../../../models/tag/tag.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import TagHasNoTextError from '../../../errors/tag/TagHasNoTextError';
import tagValidator from '../../../tagValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validTagDTO = getValidEntityInstaceForTest(resourceTypes.tag).toDTO();

export const buildTagTestCase = (): DomainModelValidatorTestCase<Tag> => ({
    resourceType: resourceTypes.tag,
    validator: tagValidator,
    validCases: [
        {
            dto: validTagDTO,
        },
    ],
    invalidCases: [
        {
            description: 'No text is provided for the tag',
            invalidDTO: {
                ...validTagDTO,
                text: undefined,
            },
            expectedError: new InvalidEntityDTOError(resourceTypes.tag, validTagDTO.id, [
                new TagHasNoTextError(validTagDTO.id),
                // TODO remove cast
            ]) as InternalError,
        },
    ],
});

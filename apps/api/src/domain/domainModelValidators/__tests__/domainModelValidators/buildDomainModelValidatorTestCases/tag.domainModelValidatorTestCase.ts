import { InternalError } from '../../../../../lib/errors/InternalError';
import { Tag } from '../../../../models/tag/tag.entity';
import { entityTypes } from '../../../../types/entityTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import TagHasNoTextError from '../../../errors/tag/TagHasNoTextError';
import tagValidator from '../../../tagValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validTagDTO = getValidEntityInstaceForTest(entityTypes.tag).toDTO();

export const buildTagTestCase = (): DomainModelValidatorTestCase<Tag> => ({
    entityType: entityTypes.tag,
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
            expectedError: new InvalidEntityDTOError(entityTypes.tag, validTagDTO.id, [
                new TagHasNoTextError(validTagDTO.id),
                // TODO remove cast
            ]) as InternalError,
        },
    ],
});

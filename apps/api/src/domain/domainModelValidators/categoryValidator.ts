import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { Category } from '../models/categories/entities/category.entity';
import { isResourceOrNoteCompositeIdentifier } from '../models/categories/types/ResourceOrNoteCompositeIdentifier';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidCategoryDTOError from './errors/category/InvalidCategoryDTOError';
import InvalidCategoryMemberReferenceError from './errors/category/InvalidCategoryMemberReferenceError';
import MissingCategoryLabelError from './errors/category/MissingCategoryLabelError';
import NullOrUndefinedCategoryDTOError from './errors/category/NullOrUndefinedCategoryDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidCategoryDTOError(innerErrors);

const categoryValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedCategoryDTOError();

    const allErrors: InternalError[] = [];

    const { id, label, members } = dto as Category;

    if (!isStringWithNonzeroLength(label)) allErrors.push(new MissingCategoryLabelError(id));

    const invalidMembers = members.filter((member) => !isResourceOrNoteCompositeIdentifier(member));

    if (invalidMembers.length > 0) allErrors.push(new InvalidCategoryMemberReferenceError(members));

    if (allErrors.length > 0) return buildTopLevelError(allErrors);

    return Valid;
};

export default categoryValidator;

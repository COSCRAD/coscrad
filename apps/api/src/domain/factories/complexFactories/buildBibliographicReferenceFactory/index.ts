import { DTO } from '../../../../types/DTO';
import bibliographicReferenceValidator from '../../../domainModelValidators/bibliographicReferenceValidator';
import { isValid } from '../../../domainModelValidators/Valid';
import { BookBibliographicReference } from '../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { InstanceFactory } from '../../getInstanceFactoryForEntity';
import getCtorFromBibliographicReferenceType from './getCtorFromBibliographicReferenceType';

const bibliographicReferenceFactory: InstanceFactory<IBibliographicReference> = (
    input: unknown
) => {
    const validationResult = bibliographicReferenceValidator(input);

    // Return error if the dto does not satisfy domain model invariants- CONSIDER THROWING
    if (!isValid(validationResult)) return validationResult;

    const dto = input as DTO<IBibliographicReference>;

    const ctor = getCtorFromBibliographicReferenceType(dto.data.type);

    // TODO remove cast when adding next model, correlate types
    return new ctor(dto as DTO<BookBibliographicReference>);
};

export default () => bibliographicReferenceFactory;

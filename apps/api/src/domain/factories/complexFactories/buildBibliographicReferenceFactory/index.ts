import { DTO } from '../../../../types/DTO';
import bibliographicReferenceValidator from '../../../domainModelValidators/bibliographicReferenceValidator';
import { isValid } from '../../../domainModelValidators/Valid';
import { IBibliographicReference } from '../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { InstanceFactory } from '../../getInstanceFactoryForResource';
import getCtorFromBibliographicReferenceType from './getCtorFromBibliographicReferenceType';

const bibliographicReferenceFactory: InstanceFactory<IBibliographicReference> = (
    input: unknown
) => {
    const validationResult = bibliographicReferenceValidator(input);

    // Return error if the dto does not satisfy domain model invariants- CONSIDER THROWING
    if (!isValid(validationResult)) return validationResult;

    const dto = input as DTO<IBibliographicReference>;

    const ctor = getCtorFromBibliographicReferenceType(dto.data.type);

    // @ts-expect-error The alternative is to program to the union
    return new ctor(dto);
};

export default () => bibliographicReferenceFactory;

import { DTO } from '../../../../types/DTO';
import bibliographicReferenceValidator from '../../../domainModelValidators/bibliographicReferenceValidator';
import { isValid } from '../../../domainModelValidators/Valid';
import { IBibliographicReference } from '../../../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { InstanceFactory } from '../../getInstanceFactoryForResource';
import getCtorFromBibliographicReferenceType from './getCtorFromBibliographicReferenceType';

const bibliographicReferenceFactory: InstanceFactory<IBibliographicReference> = (
    input: unknown
) => {
    const validationResult = bibliographicReferenceValidator(input);

    // Return error if the dto does not satisfy domain model invariants- CONSIDER THROWING
    if (!isValid(validationResult)) return validationResult;

    const dto = input as DTO<IBibliographicReference>;

    const Ctor = getCtorFromBibliographicReferenceType(dto.data.type);

    return new Ctor(dto);
};

export default () => bibliographicReferenceFactory;

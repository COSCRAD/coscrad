import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import formatAggregateType from '../../../../view-models/presentation/formatAggregateType';
import NullOrUndefinedAggregateDTOError from '../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { isValid } from '../../../domainModelValidators/Valid';
import { IBibliographicReference } from '../../../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { isBibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateType } from '../../../types/AggregateType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { InstanceFactory } from '../../getInstanceFactoryForResource';
import getCtorFromBibliographicReferenceType from './getCtorFromBibliographicReferenceType';

const bibliographicReferenceFactory: InstanceFactory<IBibliographicReference> = (
    input: unknown
) => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedAggregateDTOError(AggregateType.bibliographicReference);

    const dto = input as DTO<IBibliographicReference>;

    const subType = dto.data?.type;

    if (!isBibliographicReferenceType(subType))
        return new InternalError(
            `Encountered a ${formatAggregateType(
                AggregateType.bibliographicReference
            )} DTO with an invalid subtype: ${subType}`
        );

    const Ctor = getCtorFromBibliographicReferenceType(subType);

    const instance = new Ctor(dto);

    const validationResult = instance.validateInvariants();

    if (isValid(validationResult)) return instance;

    return validationResult; // error
};

export default () => bibliographicReferenceFactory;

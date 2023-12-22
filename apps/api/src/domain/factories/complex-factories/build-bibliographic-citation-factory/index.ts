import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../types/DTO';
import { isValid } from '../../../domainModelValidators/Valid';
import NullOrUndefinedAggregateDTOError from '../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { IBibliographicCitation } from '../../../models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { isBibliographicCitationType } from '../../../models/bibliographic-citation/types/bibliogrpahic-citation-type';
import { AggregateType } from '../../../types/AggregateType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { InstanceFactory } from '../../get-instance-factory-for-resource';
import getCtorFromBibliographicCitationType from './get-ctor-from-bibliographic-citation-type';

const bibliographicCitationFactory: InstanceFactory<IBibliographicCitation> = (input: unknown) => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedAggregateDTOError(AggregateType.bibliographicCitation);

    const dto = input as DTO<IBibliographicCitation>;

    const subType = dto.data?.type;

    if (!isBibliographicCitationType(subType))
        return new InternalError(
            `Encountered a ${formatAggregateType(
                AggregateType.bibliographicCitation
            )} DTO with an invalid subtype: ${subType}`
        );

    const Ctor = getCtorFromBibliographicCitationType(subType);

    // @ts-expect-error TODO Fix the types here
    const instance = new Ctor(dto);

    const validationResult = instance.validateInvariants();

    if (isValid(validationResult)) return instance;

    return validationResult; // error
};

export default () => bibliographicCitationFactory;

import { NotImplementedException } from '@nestjs/common';
import { Ctor } from '../../../lib/types/Ctor';
import { isBibliographicReferenceType } from '../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../types/AggregateType';
import getCtorFromBibliographicReferenceType from '../complexFactories/buildBibliographicReferenceFactory/getCtorFromBibliographicReferenceType';
import getAggregateCtorFromAggregateType from './getAggregateCtorFromAggregateType';
import { isDiscriminatedUnionResourceType } from './isDiscriminatedUnionResourceType';

export const getAggregateCtor = <TAggregateType extends AggregateType>(
    type: TAggregateType,
    subtype?: string
): Ctor<AggregateTypeToAggregateInstance[TAggregateType]> => {
    if (isDiscriminatedUnionResourceType(type)) {
        if (isBibliographicReferenceType(subtype))
            return getCtorFromBibliographicReferenceType(subtype) as Ctor<
                AggregateTypeToAggregateInstance[TAggregateType]
            >;

        throw new NotImplementedException();
    }

    return getAggregateCtorFromAggregateType(type);
};

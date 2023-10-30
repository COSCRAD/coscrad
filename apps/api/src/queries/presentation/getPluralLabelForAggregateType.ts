import { AggregateType } from '../../domain/types/AggregateType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import formatAggregateType from './formatAggregateType';

const nonStandardPluralFor: Partial<Record<AggregateType, string>> = {
    [AggregateType.category]: 'Categories',
    [AggregateType.audioItem]: 'Transcribed Audio Items',
};

export default (aggregateType: AggregateType): string => {
    const nonStandardPluralSearchResult = nonStandardPluralFor[aggregateType];

    return isNullOrUndefined(nonStandardPluralSearchResult)
        ? `${formatAggregateType(aggregateType)}s`
        : nonStandardPluralSearchResult;
};

import { AggregateType } from '../../domain/types/AggregateType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';

const nonStandardPluralFor: Partial<Record<AggregateType, string>> = {
    [AggregateType.category]: 'categories',
    [AggregateType.transcribedAudio]: 'transcribedAudioItems',
};

export default (aggregateType: AggregateType): string => {
    const nonStandardPluralSearchResult = nonStandardPluralFor[aggregateType];

    return isNullOrUndefined(nonStandardPluralSearchResult)
        ? `${aggregateType}s`
        : nonStandardPluralSearchResult;
};

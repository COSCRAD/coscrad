import { AggregateType } from '../../domain/types/AggregateType';
import formatAggregateType from '../presentation/formatAggregateType';
import { buildAllAggregateDescriptions } from './buildAllAggregateDescriptions';

/**
 * We could check this statically by instead using a mapped type for `AggregateInfo`.
 * However, this is more awkward to work with for the client. So we assert here
 * that there is one entry for every aggregate type.
 *
 * In the future, the best way to go is to use magic keys in the internal
 * source-of-truth representation and have a thin layer that maps these
 * to the public API format. This would render the present test unnecessary,
 * and provider faster feedback for devs.
 */
describe('buildAllAggregateDescriptions', () => {
    const aggregateTypesWithADescription = buildAllAggregateDescriptions().map(({ type }) => type);

    const doesAggregateTypeHaveADescription = (aggregateType: AggregateType) =>
        aggregateTypesWithADescription.includes(aggregateType);

    Object.values(AggregateType).forEach((aggregateType) =>
        describe(`Aggregate type: ${formatAggregateType(aggregateType)}`, () => {
            it('should have a corresponding description', () => {
                expect(doesAggregateTypeHaveADescription(aggregateType)).toBe(true);
            });

            it('whould have only one description', () => {
                const numberOfDescriptionsForThisAggregate = aggregateTypesWithADescription.filter(
                    (type) => type === aggregateType
                ).length;

                expect(numberOfDescriptionsForThisAggregate).toBe(1);
            });
        })
    );
});

import { AggregateFactoryInalidTestCase } from '..';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import NullOrUndefinedAggregateDTOError from '../../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { AggregateType } from '../../../../types/AggregateType';

export default (aggregateType: AggregateType): AggregateFactoryInalidTestCase[] =>
    (
        [
            [null, 'null'],
            [undefined, 'undefined'],
        ] as const
    ).map(([value, label]) => ({
        description: `when the dto is ${label}`,
        dto: value,
        checkError: (result: unknown) =>
            assertErrorAsExpected(result, new NullOrUndefinedAggregateDTOError(aggregateType)),
    }));

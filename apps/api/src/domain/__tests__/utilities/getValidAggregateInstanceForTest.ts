import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../lib/errors/InternalError';
import buildTestDataInFlatFormat from '../../../test-data/buildTestDataInFlatFormat';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';

export default <TAggregateType extends AggregateType>(
    aggregateType: TAggregateType
): AggregateTypeToAggregateInstance[TAggregateType] => {
    const allAggregatesOfGivenType = new DeluxeInMemoryStore(
        buildTestDataInFlatFormat()
    ).fetchAllOfType(aggregateType);

    const zerothInstanceOfType = allAggregatesOfGivenType[0];

    if (isNullOrUndefined(zerothInstanceOfType))
        throw new InternalError(`Failed to find a test instance of type: ${aggregateType}`);

    return zerothInstanceOfType;
};

import { AggregateFactoryValidTestCase } from '../../';
import { ResourceType } from '../../../../../../domain/types/ResourceType';
import formatAggregateType from '../../../../../../queries/presentation/formatAggregateType';
import { Formatter } from '../../../../../../queries/presentation/types/Formatter';
import { AggregateTypeToAggregateInstance } from '../../../../../types/AggregateType';
import { GetValidInstanceForSubtype } from './types/GetValidInstanceForSubtype';

export default <T extends ResourceType>(
    resourceType: T,
    subtypes: string[],
    formatSubtype: Formatter<string>,
    getValidSubtypeInstance: GetValidInstanceForSubtype<AggregateTypeToAggregateInstance[T]>
): AggregateFactoryValidTestCase<T>[] =>
    subtypes.map((type) => ({
        description: `valid dto for a ${formatAggregateType(
            resourceType
        )} of sub-type: ${formatSubtype(type)}`,
        dto: getValidSubtypeInstance(type).toDTO(),
    }));

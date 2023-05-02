import { InternalError } from '../../lib/errors/InternalError';
import { DeepPartial } from '../../types/DeepPartial';
import { Aggregate } from '../models/aggregate.entity';
import deepCloneInstance from '../models/shared/functional/deepCloneInstance';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import { AggregateType, AggregateTypeToAggregateInstance } from './AggregateType';
import { PartialSnapshot } from './PartialSnapshot';
import { InMemorySnapshot, InMemorySnapshotOfResources, isResourceType } from './ResourceType';
import { Snapshot } from './Snapshot';

type SnapshotWithResources = DeepPartial<InMemorySnapshot> & {
    resources: Partial<InMemorySnapshotOfResources>;
};

type AggregatesMap = Map<AggregateType, Aggregate[]>;

const doesSnapshotHaveResourcesKey = (snapshot: unknown): snapshot is SnapshotWithResources =>
    !isNullOrUndefined((snapshot as SnapshotWithResources).resources);

/**
 * TODO [https://www.pivotaltracker.com/story/show/183023347]
 * Strangle out the old type and then rename this `InMemoryStore`
 */
export class DeluxeInMemoryStore {
    private readonly inMemoryMapOfAggregates: AggregatesMap;

    constructor(partialSnapshot: PartialSnapshot | DeepPartial<InMemorySnapshot> = {}) {
        const result = Object.values(AggregateType).reduce(
            (partialMap: AggregatesMap, aggregateType: AggregateType) => {
                //     // Support legacy snapshot format
                if (doesSnapshotHaveResourcesKey(partialSnapshot) && isResourceType(aggregateType))
                    return partialMap.set(aggregateType, partialSnapshot.resources[aggregateType]);

                return partialMap.set(aggregateType, partialSnapshot[aggregateType] || []);
            },
            new Map()
        ) as AggregatesMap;

        this.inMemoryMapOfAggregates = result;
    }

    fetchAllOfType<TAggregateType extends AggregateType>(
        aggregateType: TAggregateType
    ): AggregateTypeToAggregateInstance[TAggregateType][] {
        if (!this.inMemoryMapOfAggregates.has(aggregateType))
            throw new InternalError(`No entry found for aggregate of type: ${aggregateType}`);

        return this.inMemoryMapOfAggregates.get(
            aggregateType
        ) as AggregateTypeToAggregateInstance[TAggregateType][];
    }

    appendAggregates(aggregateType: AggregateType, data: Aggregate[]): DeluxeInMemoryStore {
        this.inMemoryMapOfAggregates.set(aggregateType, [
            ...this.inMemoryMapOfAggregates.get(aggregateType),
            ...data,
        ]);

        return this;
    }

    append(partialSnapshot: PartialSnapshot): DeluxeInMemoryStore {
        Object.entries(partialSnapshot).forEach(
            ([key, additionalInstances]: [AggregateType, Aggregate[]]) => {
                const existingInstances = this.inMemoryMapOfAggregates.get(key);

                this.inMemoryMapOfAggregates.set(
                    key,
                    existingInstances.concat(
                        ...additionalInstances.map((instance) => instance.clone())
                    )
                );
            }
        );

        return this;
    }

    fetchFullSnapshotInLegacyFormat(): Snapshot {
        const result = Object.values(AggregateType).reduce(
            (acc: DeepPartial<Snapshot>, key: AggregateType) => {
                const value = this.inMemoryMapOfAggregates.get(key);

                const nextUpdate = { [key]: (value || []).map(deepCloneInstance) };

                if (isResourceType(key)) {
                    return {
                        ...acc,
                        resources: {
                            ...acc.resources,
                            ...nextUpdate,
                        },
                    };
                }

                return {
                    ...acc,
                    ...nextUpdate,
                };
            },
            {}
        ) as Snapshot;

        return result;
    }

    filter<TAggregateType extends AggregateType>(
        aggregateType: TAggregateType,
        callback: (instance: AggregateTypeToAggregateInstance[TAggregateType]) => boolean
    ): DeluxeInMemoryStore {
        this.inMemoryMapOfAggregates.set(
            aggregateType,
            this.inMemoryMapOfAggregates.get(aggregateType).filter(callback)
        );

        return this;
    }
}

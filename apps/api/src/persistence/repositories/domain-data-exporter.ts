import { Inject } from '@nestjs/common';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { Resource } from '../../domain/models/resource.entity';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../domain/types/DeluxeInMemoryStore';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import { REPOSITORY_PROVIDER_TOKEN } from '../constants/persistenceConstants';

type InMemoryDomainSnapshotIncludingErrors = Record<AggregateType, ResultOrError<Aggregate>[]>;

export class DomainDataExporter {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider
    ) {}

    // TODO consider exposing a filter callback here
    async fetchSnapshot(): Promise<DeluxeInMemoryStore> {
        const snapshotWithErrors = await this.fetchAllAggregateRoots();

        return Object.entries(snapshotWithErrors)
            .filter(
                (
                    aggregateTypeAndInstances
                ): aggregateTypeAndInstances is [AggregateType, Aggregate[]] => {
                    const [_, instances] = aggregateTypeAndInstances;

                    if (instances.some(isInternalError)) {
                        throw new InternalError(
                            `invalid data encountered in snapshot: ${instances}`
                        );
                    }

                    return true;
                }
            )
            .reduce(
                (snapshot, [aggregateType, instances]) =>
                    snapshot.appendAggregates(aggregateType, instances),
                new DeluxeInMemoryStore()
            );
    }

    async validateAllInvariants(): Promise<InternalError[]> {
        const snapshotWithErrors = await this.fetchAllAggregateRoots();

        /**
         * Iterate through all `aggregate type` keys in the snapshot and filter out
         * invariant validation errors from repository fetch many call.
         */
        const allErrors = Object.entries(snapshotWithErrors).reduce(
            (allErrors: InternalError[], [_, instancesOrErrors]) => {
                const errorsForThisAggregateType = instancesOrErrors.filter(isInternalError);

                return allErrors.concat(errorsForThisAggregateType);
            },
            []
        );

        return allErrors;
    }

    async fetchAllAggregateRoots(): Promise<InMemoryDomainSnapshotIncludingErrors> {
        const categoryTree = await this.repositoryProvider.getCategoryRepository().fetchTree();

        const [edgeConnections, users, userGroups, tags] = await Promise.all(
            [
                this.repositoryProvider.getEdgeConnectionRepository(),
                this.repositoryProvider.getUserRepository(),
                this.repositoryProvider.getUserGroupRepository(),
                this.repositoryProvider.getTagRepository(),
            ].map((repository) => repository.fetchMany())
        );

        const resourceTypeAndFetchPromises = Object.values(ResourceType).map(
            (resourceType) => async () => {
                const instances = await this.repositoryProvider
                    .forResource(resourceType)
                    .fetchMany();

                return [resourceType, instances] as [ResourceType, Resource[]];
            }
        );

        const resourceTypesAndInstances = await Promise.all(
            resourceTypeAndFetchPromises.map((execute) => execute())
        );

        return (
            [
                [AggregateType.note, edgeConnections],
                [AggregateType.user, users],
                [AggregateType.userGroup, userGroups],
                [AggregateType.tag, tags],
                ...resourceTypesAndInstances,
            ] as [AggregateType, ResultOrError<Aggregate>[]][]
        ).reduce(
            (
                acc: InMemoryDomainSnapshotIncludingErrors,
                [aggregateType, aggregates]: [AggregateType, ResultOrError<Aggregate>[]]
            ) => ({
                ...acc,
                [aggregateType]: aggregates,
            }),
            {
                [AggregateType.category]: categoryTree,
            } as InMemoryDomainSnapshotIncludingErrors
        );
    }
}

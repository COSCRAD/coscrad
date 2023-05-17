import { Inject } from '@nestjs/common';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { Category } from '../../domain/models/categories/entities/category.entity';
import { Resource } from '../../domain/models/resource.entity';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../domain/types/DeluxeInMemoryStore';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import { REPOSITORY_PROVIDER_TOKEN } from '../constants/persistenceConstants';

export class DomainDataExporter {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider
    ) {}

    // TODO consider exposing a filter callback here
    async fetchSnapshot(): Promise<DeluxeInMemoryStore> {
        const categoryTree = await this.repositoryProvider.getCategoryRepository().fetchTree();

        if (categoryTree.some(isInternalError)) {
            throw new InternalError(
                `Cannot export snapshot due to invalid category tree: ${categoryTree}`
            );
        }

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

        const inMemorySnapshot = (
            [
                [AggregateType.note, edgeConnections],
                [AggregateType.user, users],
                [AggregateType.userGroup, userGroups],
                [AggregateType.tag, tags],
                ...resourceTypesAndInstances,
            ] as unknown as [AggregateType, ResultOrError<Aggregate>[]][]
        )
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
        return inMemorySnapshot.append({
            [AggregateType.category]: categoryTree as Category[],
        });
    }
}

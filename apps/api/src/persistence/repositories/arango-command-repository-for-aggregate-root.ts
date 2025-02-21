import { AGGREGATE_COMPOSITE_IDENTIFIER, ICommandBase } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { AggregateTypeMetadata, getAggregateTypeForTarget } from '../../domain/decorators';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { BaseEvent } from '../../domain/models/shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../domain/models/shared/functional';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import { DomainModelCtor } from '../../lib/types/DomainModelCtor';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound } from '../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import { DynamicDataTypeFinderService } from '../../validation';
import { ArangoEventRepository } from './arango-event-repository';

type AggregateContextIdentifier =
    | AggregateCompositeIdentifier
    | Pick<AggregateCompositeIdentifier, 'type'>;

interface IEventSourceable<TAggregate extends Aggregate = Aggregate> {
    fromEventHistory: (eventStream: BaseEvent[], id: AggregateId) => ResultOrError<TAggregate>;
}

export interface IEventRepository {
    fetchEvents(aggregateContextIdentifier?: AggregateContextIdentifier): Promise<BaseEvent[]>;

    // TODO Should the event be an instance or DTO?
    appendEvent(event: DTO<BaseEvent>): Promise<void>;

    appendEvents(events: DTO<BaseEvent>[]): Promise<void>;
}

// TODO Move these interfaces to the domain
export interface IEventRepositoryProvider {
    getEventRepository(): IEventRepository;
}

// TODO [https://www.pivotaltracker.com/story/show/185903292]  Include a test for each aggregate's repository

export class ArangoCommandRepositoryForAggregateRoot<TAggregate extends Aggregate = Aggregate>
    implements IRepositoryForAggregate<TAggregate>
{
    constructor(
        @Inject(ArangoEventRepository) private readonly eventRepository: IEventRepository,
        private readonly snapshotRepositoryForAggregate: IRepositoryForAggregate<TAggregate>,
        private readonly aggregateType: AggregateType,
        private readonly dataTypeFinderService: DynamicDataTypeFinderService
    ) {}

    async fetchById(id: AggregateId): Promise<Maybe<ResultOrError<TAggregate>>> {
        const eventStream = await this.eventRepository.fetchEvents({
            type: this.aggregateType,
            id,
        });

        const Ctor = await this.getAggregateRootCtor<TAggregate>();

        // types specific to TAggregate
        return Ctor.fromEventHistory(eventStream, id);
    }

    async fetchMany(
        specification?: ISpecification<TAggregate>
    ): Promise<ResultOrError<TAggregate>[]> {
        const eventStream = await this.eventRepository.fetchEvents({
            type: this.aggregateType,
        });

        const uniqueIds = [
            ...new Set(
                eventStream.map(
                    (event) => (event.payload as ICommandBase)[AGGREGATE_COMPOSITE_IDENTIFIER].id
                )
            ),
        ];

        const Ctor = await this.getAggregateRootCtor();

        // Specific to TAggregate
        const allTAggregates = uniqueIds
            .map((id) => Ctor.fromEventHistory(eventStream, id))
            .filter((result): result is ResultOrError<TAggregate> => !isNotFound(result))
            // We fail fast if we have received invalid data from the database
            .filter(validAggregateOrThrow);

        if (specification)
            return allTAggregates.filter((instance) => specification.isSatisfiedBy(instance));

        return allTAggregates;
    }

    async getCount(specification?: ISpecification<TAggregate>): Promise<number> {
        const allTAggregates = await this.fetchMany(specification);

        return allTAggregates.length;
    }

    async create(entity: TAggregate) {
        const { eventHistory } = entity;

        if (eventHistory.length < 1) {
            throw new InternalError(
                `failed to event source ${formatAggregateCompositeIdentifier(
                    entity.getCompositeIdentifier()
                )} as it has no event history`
            );
        }

        // TODO Have these been sorted yet?
        await this.eventRepository.appendEvents(eventHistory);

        // TODO this should be done atomically with the above
        await this.snapshotRepositoryForAggregate.create(entity);
    }

    /**
     * This is a test helper. We do not want to use it in production code.
     * A better approach now that we are properly event sourcing our domain
     * would be to write many events and then expose a method on the
     * `Snapshot Repository` to refresh the cache (i.e., event source from scratch).
     */

    // Specific to TAggregate - type only
    async createMany(entities: TAggregate[]) {
        // throw new InternalError(`You should use the event repository append method`);

        if (entities.length === 0) return;

        const events = entities.flatMap(({ eventHistory }) => eventHistory || []);

        /**
         * TODO Make the following atomic \ transactional.
         */
        await this.snapshotRepositoryForAggregate.createMany(entities);

        await this.eventRepository.appendEvents(events);
    }

    /**
     *
     * @param updatedEntity the complete updated intance
     *
     * Note that we always have a complete updated instance because we must check
     * invariant validation rules and state transition rules before updating. We
     * do not expose to the client the ability to merge updates to the database
     * directly.
     */

    // Specific to TAggregate - type only
    async update(updatedEntity: TAggregate): Promise<void> {
        // Should the event history be an array of instances? << DO this!
        const { eventHistory = [] } = updatedEntity;

        // TODO presort when hydrating the event history from DB
        const sortedEventHistory = eventHistory.sort(
            (eventA, eventB) => eventA.meta.dateCreated - eventB.meta.dateCreated
        );

        // Should the event history be an array of instances? << DO this!
        const mostRecentEvent = sortedEventHistory[sortedEventHistory.length - 1];

        await this.eventRepository.appendEvent(mostRecentEvent);
    }

    // TODO refactor this- we probably should do this once at bootstrap
    private async getAggregateRootCtor<TAggregate extends Aggregate = Aggregate>(): Promise<
        IEventSourceable<TAggregate>
    > {
        // fetch all known class constructor values (commands, domain classes, etc.) from IoC containers
        const allCtors = await this.dataTypeFinderService.getAllDataClassCtors();

        const allAggregateRootCtors = allCtors.filter(
            (target) => !isNotFound(getAggregateTypeForTarget(target))
        );

        const aggregateTypeToCtor = allAggregateRootCtors.reduce(
            (lookupTable: Record<string, DomainModelCtor>, ctor) => {
                // TODO assert this above on the first call
                const { aggregateType } = getAggregateTypeForTarget(ctor) as AggregateTypeMetadata;

                return {
                    ...lookupTable,
                    [aggregateType]: ctor as DomainModelCtor,
                };
            },
            {}
        );

        // TODO Use dynamic annotation \ reflection to get this
        const Ctor = aggregateTypeToCtor[this.aggregateType];

        if (isNullOrUndefined(Ctor)) {
            throw new InternalError(
                `Failed to find a domain model class for aggregate type: ${this.aggregateType}`
            );
        }

        return Ctor as unknown as IEventSourceable<TAggregate>;
    }
}

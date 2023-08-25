import { AGGREGATE_COMPOSITE_IDENTIFIER, ICommandBase } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { BaseEvent } from '../../domain/models/shared/events/base-event.entity';
import { Song } from '../../domain/models/song/song.entity';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound } from '../../lib/types/not-found';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import formatAggregateCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';
import { ArangoEventRepository } from './arango-event-repository';

type AggregateContextIdentifier =
    | AggregateCompositeIdentifier
    | Pick<AggregateCompositeIdentifier, 'type'>;

export interface IEventRepository {
    fetchEvents(aggregateContextIdentifier: AggregateContextIdentifier): Promise<BaseEvent[]>;

    // TODO Should the event be an instance or DTO?
    appendEvent(event: DTO<BaseEvent>): Promise<void>;
}

// TODO [https://www.pivotaltracker.com/story/show/185903292]  Include a test for each aggregate's repository

// THIS IS A PROTOTYPE, WE WOULD ABSTRACT OVER THE AGGREGATE TYPE
export class ArangoSongCommandRepository implements IRepositoryForAggregate<Song> {
    private readonly aggregateType = AggregateType.song;

    constructor(
        @Inject(ArangoEventRepository) private readonly eventRepository: IEventRepository,
        private readonly snapshotRepositoryForAggregate: IRepositoryForAggregate<Song>
    ) {}

    async fetchById(id: AggregateId): Promise<Maybe<ResultOrError<Song>>> {
        const eventStream = await this.eventRepository.fetchEvents({
            type: this.aggregateType,
            id,
        });

        return Song.fromEventHistory(eventStream, id);
    }

    async fetchMany(specification?: ISpecification<Song>): Promise<ResultOrError<Song>[]> {
        const eventStream = await this.eventRepository.fetchEvents({
            type: AggregateType.song,
        });

        if (specification) {
            throw new InternalError(
                `The specification pattern is not yet supported for the event-sourced song repository`
            );
        }

        const uniqueIds = [
            ...new Set(
                eventStream.map(
                    (event) => (event.payload as ICommandBase)[AGGREGATE_COMPOSITE_IDENTIFIER].id
                )
            ),
        ];

        const allSongs = uniqueIds
            .map((id) => Song.fromEventHistory(eventStream, id))
            .filter((result): result is ResultOrError<Song> => !isNotFound(result));

        return allSongs;
    }

    async getCount(specification?: ISpecification<Song>): Promise<number> {
        const allSongs = await this.fetchMany(specification);

        return allSongs.length;
    }

    async create(entity: Song) {
        const { eventHistory } = entity;

        if (eventHistory.length > 1) {
            throw new InternalError(
                `A newly created aggregate root must have exactly 1 event in its history, but found: ${eventHistory.length}`
            );
        }

        if (eventHistory.length < 1) {
            throw new InternalError(
                `failed to event source ${formatAggregateCompositeIdentifier(
                    entity.getCompositeIdentifier()
                )} as it has no even thistory`
            );
        }

        // Events are appended in order, but should we sort here by date to be certain?
        // note the index here will always be 0 based on the above checks
        const latestEvent = eventHistory[eventHistory.length - 1];

        await this.eventRepository.appendEvent(latestEvent);

        await this.snapshotRepositoryForAggregate.create(entity);
    }

    /**
     * This is a test helper. We do not want to use it in production code.
     * A better approach now that we are properly event sourcing our domain
     * would be to write many events and then expose a method on the
     * `Snapshot Repository` to refresh the cache (i.e., event source from scratch).
     */
    async createMany(entities: Song[]) {
        if (entities.length === 0) return;

        await Promise.all(entities.map((entity) => this.create(entity)));
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
    async update(updatedEntity: Song): Promise<void> {
        // Should the event history be an array of instances? << DO this!

        const { eventHistory = [] } = updatedEntity;

        // Should the event history be an array of instances? << DO this!
        const mostRecentEvent = eventHistory[eventHistory.length - 1];

        await this.eventRepository.appendEvent(mostRecentEvent);

        await this.snapshotRepositoryForAggregate.update(updatedEntity);
    }
}

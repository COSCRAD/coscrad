import { Injectable } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common/events/coscrad-event-factory';
import { BaseEvent } from '../../domain/models/shared/events/base-event.entity';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';
import { IEventRepository } from './arango-command-repository-for-aggregate-root';

@Injectable()
export class ArangoEventRepository implements IEventRepository {
    private readonly arangoEventDatabase: ArangoDatabaseForCollection<BaseEvent>;

    constructor(
        databaseProvider: ArangoDatabaseProvider,
        private readonly coscradEventFactory: CoscradEventFactory
    ) {
        this.arangoEventDatabase = databaseProvider.getDatabaseForCollection(
            ArangoCollectionId.events
        );
    }

    /**
     * @param aggregateContextIdentifier `type`- the type of aggregate whose events we should fetch. `id` (optional) - the specific aggregate of this type
     * @returns Asynchronously returns **chronologically ordred** events for aggregates of the requested type and (optionally) ID
     *
     * TODO Should the following simply be an `EventFilter`? or a `Specification`?
     */
    async fetchEvents(
        aggregateContextIdentifier:
            | AggregateCompositeIdentifier
            | Pick<AggregateCompositeIdentifier, 'type'>
    ): Promise<BaseEvent[]> {
        const allEventDocuments = await this.arangoEventDatabase.fetchMany();

        const allEventDtos = allEventDocuments.map(mapDatabaseDocumentToAggregateDTO);

        /**
         * TODO Ideally, we would use the `Specification` API and do this
         * at the level of the database. However, this class is concrete with
         * respect to Arango, so there's not a lot of value in building in complex
         * query support for this right now.
         */
        const filteredEvents = allEventDtos.filter(
            ({
                payload: {
                    aggregateCompositeIdentifier: { type, id },
                },
            }) => {
                if (type !== aggregateContextIdentifier.type) return false;

                const { id: contextId } =
                    aggregateContextIdentifier as AggregateCompositeIdentifier;

                const didUserSpecifyIdFilter = !isNullOrUndefined(contextId);

                if (!didUserSpecifyIdFilter) return true;

                return id === contextId;
            }
        );

        // TODO Either add an event factory, or return only the DTO
        const eventInstances = await Promise.all(
            filteredEvents
                // The event repository has the responsibility of sorting events chronologically for once and for all
                .sort((eventA, eventB) => eventA.meta.dateCreated - eventB.meta.dateCreated)
                .map((eventDocument) => this.coscradEventFactory.build(eventDocument))
        );

        return eventInstances;
    }

    async appendEvent(event: BaseEvent): Promise<void> {
        const databaseDocumentWithoutId = mapEntityDTOToDatabaseDTO(event);

        const databaseDocument = {
            ...databaseDocumentWithoutId,
            id: event.meta.id,
        };

        // TODO Why not event.toDTO() ?
        await this.arangoEventDatabase.create(databaseDocument);
    }

    async appendEvents(events: BaseEvent[]): Promise<void> {
        const documents = events.map(mapEntityDTOToDatabaseDTO).map((docWithoutId) => ({
            ...docWithoutId,
            id: docWithoutId.meta.id,
        }));

        await this.arangoEventDatabase.createMany(documents);
    }
}

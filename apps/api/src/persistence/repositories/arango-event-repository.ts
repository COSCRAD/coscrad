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
import { IEventRepository } from './arango-command-repository-for-aggregate';

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

    // Todo Should the following simply be an `EventFilter`? or a `Specification`?
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
        return filteredEvents.map((eventDocument) => this.coscradEventFactory.build(eventDocument));
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
}

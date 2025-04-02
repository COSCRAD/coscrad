import { Injectable } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common/events/coscrad-event-factory';
import { BaseEvent } from '../../domain/models/shared/events/base-event.entity';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDTO, {
    ArangoDocumentForAggregateRoot,
} from '../database/utilities/mapEntityDTOToDatabaseDocument';
import { IEventRepository } from './arango-command-repository-for-aggregate-root';

type AggregateContextIdentifier =
    | AggregateCompositeIdentifier
    | Pick<AggregateCompositeIdentifier, 'type'>;

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
        aggregateContextIdentifier?: AggregateContextIdentifier
    ): Promise<BaseEvent[]> {
        const docRef = 'e';

        const aqlQuery = `
            FOR ${docRef} in events
            ${this.buildAggregateFilter(docRef, aggregateContextIdentifier)}
            SORT e.meta.dateCreated
            return e
        `;

        const cursor = await this.arangoEventDatabase.query({
            query: aqlQuery,
            // TODO id? type?
            bindVars: {},
        });

        const allEventDocuments =
            (await cursor.all()) as ArangoDocumentForAggregateRoot<BaseEvent>[];

        const eventInstances = allEventDocuments.map((eventDocument) =>
            this.coscradEventFactory.build(mapDatabaseDocumentToAggregateDTO(eventDocument))
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

    private buildAggregateFilter(
        docRef: string,
        aggregateContextIdentifier?: AggregateContextIdentifier
    ): string {
        if (isNullOrUndefined(aggregateContextIdentifier)) {
            return '';
        }

        const { id, type } = aggregateContextIdentifier as AggregateCompositeIdentifier;

        const idClause = isNullOrUndefined(id)
            ? ''
            : `FILTER ${docRef}.payload.aggregateCompositeIdentifier.id == "${id}"`;

        const typeClause = `FILTER ${docRef}.payload.aggregateCompositeIdentifier.type == "${type}"`;

        return `
        ${typeClause}
         ${idClause}
        `;
    }
}

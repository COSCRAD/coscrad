import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';
import { Migration } from '../decorators';

const targetCollections = [
    'songs',
    'terms',
    'vocabulary_lists',
    'playlists',
    'audio_items',
    'videos',
    'photographs',
];

const collectionNameForRollingBackEvents = 'legacy-events-m5';

@Migration({
    description: 'copies events from legacy snapshot-persisted resources to the events collection',
    dateAuthored: '20250526',
})
export class MigrateEventsFromLegacySnapshotCollections implements ICoscradMigration {
    sequenceNumber = 5;

    name = 'MigrateEventsFromLegacySnapshotCollections';

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        const db = queryRunner.getArangoDbInstance();

        const backupEventsCollection = await db.createCollection(
            collectionNameForRollingBackEvents
        );

        const transaction = await db.beginTransaction([
            ...targetCollections,
            'events',
            collectionNameForRollingBackEvents,
        ]);

        const query = `
            for doc in @@collectionName
            for e in doc.eventHistory
            upsert { meta: { id: e.meta.id}} 
            insert merge(e,{_key: e.meta.id, id: null})
            update {}
            in events
        `;

        const queries = targetCollections.map((collectionName) => ({
            query,
            bindVars: {
                '@collectionName': collectionName,
            },
        }));

        // copy `events` => `legacy-events-m5`
        await transaction.step(async () => {
            const legacyEventdocs = await queryRunner.fetchMany('events');

            backupEventsCollection.import(legacyEventdocs);
        });

        for (const q of queries) {
            await transaction.step(async () => {
                await db.query(q);
            });
        }

        await transaction.commit();
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        const db = queryRunner.getArangoDbInstance();

        const transaction = await db.beginTransaction([
            'events',
            collectionNameForRollingBackEvents,
        ]);

        await transaction.step(async () => {
            const backupEventDocs = await queryRunner.fetchMany(collectionNameForRollingBackEvents);

            const deleteAllEventsQuery = `
            for e in events
            remove e in events
            `;

            await db.query({
                query: deleteAllEventsQuery,
                bindVars: {},
            });

            await db.collection(ArangoCollectionId.events).import(backupEventDocs);
        });

        await transaction.commit();
        const backupCollection = db.collection(collectionNameForRollingBackEvents);

        if (await backupCollection.exists()) {
            await backupCollection.drop();
        }
    }
}

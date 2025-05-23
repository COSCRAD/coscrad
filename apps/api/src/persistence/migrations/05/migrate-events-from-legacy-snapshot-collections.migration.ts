import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';

const targetCollections = [
    'songs',
    'terms',
    'vocabulary_lists',
    'playlists',
    'audio_items',
    'videos',
    'photographs',
];

export class MigrateEventsFromLegacySnapshotCollections implements ICoscradMigration {
    sequenceNumber = 5;

    name = 'MigrateEventsFromLegacySnapshotCollections';

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        const query = `
            for doc in @@collectionName
            for e in doc.eventHistory
            upsert {_key: e.meta.id}
            insert merge(e,{_key: e.meta.id, id: null})
            update {}
            in events
        `;

        const queries = targetCollections.map((collectionName) => ({
            query,
            context: {
                '@collectionName': collectionName,
            },
        }));

        // Note that we also need to touch the events collection
        await queryRunner.transaction(queries, [...targetCollections, 'events']);
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        const query = `
            for e in events
            filter position(['song','video','audioItem','playlist','photograph','term','vocabularyList'],e.payload.aggregateCompositeIdentifier.type)
            remove e in events
        `;

        await queryRunner.query(query, {});
    }
}

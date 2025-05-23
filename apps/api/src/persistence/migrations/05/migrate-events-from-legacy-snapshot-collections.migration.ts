import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';

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

        const targetCollections = [
            'songs',
            'terms',
            'vocabulary_lists',
            'playlists',
            'audio_items',
            'videos',
        ];

        const queries = targetCollections.map((collectionName) => ({
            query,
            context: {
                '@collectionName': collectionName,
            },
        }));

        // Note that we also need to touch the events collection
        await queryRunner.transaction(queries, [...targetCollections, 'events']);
    }

    async down(_queryRunner: ICoscradQueryRunner): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

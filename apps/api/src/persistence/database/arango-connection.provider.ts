import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';
import { Scheme } from '../../app/config/constants/Scheme';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { DTO } from '../../types/DTO';
import ArangoDatabaseConfiguration from './ArangoDatabaseConfiguration';
import {
    ArangoCollectionId,
    getAllArangoCollectionIDs,
} from './collection-references/ArangoCollectionId';
import { isArangoEdgeCollectionCollectionID } from './collection-references/ArangoEdgeCollectionId';
import DatabaseAlreadyInitializedError from './errors/DatabaseAlreadyInitializedError';
import DatabaseNotYetInitializedError from './errors/DatabaseNotYetInitializedError';

export type ArangoConnection = Database;

type Port = `${number}`;

const isPortRequired = (scheme: Scheme, port: `${number}`) => {
    if (scheme === 'http' && port === '80') return false;
    if (scheme === 'https' && port === '443') return false;
    return true;
};

const buildFullHostURL = (
    domain: string,
    scheme: Scheme = Scheme.https,
    port: Port = '443'
): string => `${scheme}://${domain}${isPortRequired(scheme, port) ? `:${port}` : ''}`;

@Injectable()
export class ArangoConnectionProvider {
    private readonly connection: ArangoConnection;

    #databaseConfiguration: ArangoDatabaseConfiguration;

    isInitialized = false;

    public get databaseConfiguration() {
        return this.#databaseConfiguration.getConfig();
    }

    constructor(private configService: ConfigService) {
        const ARANGO_DB_NAME = this.configService.get<string>('ARANGO_DB_NAME');

        this.setDatabaseConfiguration({
            dbName: ARANGO_DB_NAME,
            dbRootPass: this.configService.get<string>('ARANGO_DB_ROOT_PASSWORD'),
            dbUser: this.configService.get<string>('ARANGO_DB_USER'),
            dbPass: this.configService.get<string>('ARANGO_DB_USER_PASSWORD'),
            dbHostUrl: buildFullHostURL(
                this.configService.get<string>('ARANGO_DB_HOST_DOMAIN', 'localhost'),
                this.configService.get<Scheme>('ARANGO_DB_HOST_SCHEME', Scheme.http),
                this.configService.get<number>('ARANGO_DB_HOST_PORT', 80).toString() as Port
            ),
        });

        const systemDB = new Database({
            url: this.databaseConfiguration.dbHostUrl,
        });

        systemDB.useBasicAuth('root', this.databaseConfiguration.dbRootPass);

        // TODO why is `useDatabase` deprecated? can we use myDB.database("db_name")?
        const dbInstance = systemDB.database(this.databaseConfiguration.dbName);
        dbInstance.useBasicAuth(
            this.databaseConfiguration.dbUser,
            this.databaseConfiguration.dbPass
        );

        this.connection = dbInstance;
    }

    /**
     * This async setup helper will
     * - Create the database (the one referenced in your .env via ConfigService)
     * only if this database does not exist
     * - Add any missing collections (but leave existing collections untouched)
     * and can only be run once.
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) throw new DatabaseAlreadyInitializedError();

        await this.#createDatabaseIfNotExists();

        await this.#createAllMissingCollections();

        /**
         * TODO[https://www.pivotaltracker.com/story/show/187960041]
         * Discover view collections dynamically.
         */
        await this.createCollectionIfNotExists('photograph__VIEWS');

        await this.createCollectionIfNotExists('term__VIEWS');

        await this.createCollectionIfNotExists('audioItem__VIEWS');

        await this.createCollectionIfNotExists('vocabularyList__VIEWS');

        await this.createCollectionIfNotExists('playlist__VIEWS');

        this.isInitialized = true;
    }

    getDatabaseName(): string {
        return this.databaseConfiguration.dbName;
    }

    getConnection(): ArangoConnection {
        if (!this.isInitialized)
            throw new DatabaseNotYetInitializedError('get an Arango connection');

        return this.connection;
    }

    public setDatabaseConfiguration(config: DTO<ArangoDatabaseConfiguration>) {
        this.#databaseConfiguration = new ArangoDatabaseConfiguration({
            ...config,
        });
    }

    async #doesCollectionExist(collectionName: string): Promise<boolean> {
        const allCollections = await this.connection
            .listCollections()
            .then((allCollectionMetadata) => allCollectionMetadata.map(({ name }) => name));

        const doesCollectionExist = allCollections.includes(collectionName);

        return doesCollectionExist;
    }

    async #createDatabaseIfNotExists(): Promise<void> {
        const databaseName = this.databaseConfiguration.dbName;

        if (isNullOrUndefined(databaseName)) return;

        let adminInstance = new Database({
            url: this.databaseConfiguration.dbHostUrl,
        });

        adminInstance.useBasicAuth('root', this.databaseConfiguration.dbRootPass);

        const doesDatabaseExist = await adminInstance
            .listDatabases()
            .then((allDatabaseNames) => allDatabaseNames.includes(databaseName));

        if (doesDatabaseExist) return;

        const { dbUser } = this.#databaseConfiguration;

        await adminInstance.createDatabase(databaseName, {
            users: [{ username: dbUser }, { username: 'root' }],
        });

        adminInstance.close();

        adminInstance = null;
    }

    async #createAllMissingCollections(): Promise<void> {
        await Promise.all(
            getAllArangoCollectionIDs()
                .concat('games' as ArangoCollectionId)
                .map((collectionName) => this.createCollectionIfNotExists(collectionName))
        );
    }

    async createCollectionIfNotExists(collectionName: string): Promise<void> {
        const doesCollectionExist = await this.#doesCollectionExist(collectionName);

        if (doesCollectionExist) return;

        if (collectionName === ArangoCollectionId.uuids) {
            await this.connection.createCollection(
                collectionName
                /**
                 * TODO Control the offset \ increment
                 * Currently, we are having trouble getting these options to work in ArangoDB.
                 * We have confirmed, however that the values are indeed being set via the
                 * REST API call made by ArangoJS by reading the values back.
                 *
                 * Is Arango setting but silently ignoring the offset? We've tried
                 * 1000, 3000, 1000000. Ideally, we want 5-8 digit sequence numbers
                 * so they are easy to read by researchers and easy to machine label
                 * via ASR (spoken digit recognition). For now, we can add a large
                 * offset (presentation) to the sequence number for this purpose.
                 *
                 * Perhaps there is a limit on the offset? If so, we should write
                 * our own validation and fail fast.
                 *
                 * As for the increment, it seems to have no effect whatsover.
                 * We have tested by creating documents directly in Arango dashboard.
                 * If an attempted write fails, there would normally be gaps. However,
                 * even when creating simple empty documents with no fails at the
                 * level of writing new documents, there are large gaps of ~15-25
                 * in sequence numbers. Perhaps this is due to internal implementation
                 * of their storage engine? We should research this more.
                 *
                 * We don't want to build our own sequential ID generator on top of
                 * the UUID generation scheme. This is complex enough.
                 *
                 *
                 */
                // {
                //     keyOptions: {
                //         offset: UUID_SEQUENCE_NUMBER_OFFSET,
                //         // We hard-wire this because there is no reason to ever use anything else
                //         increment: 1,
                //     },
                // }
            );

            // const {
            //     keyOptions: { offset, increment },
            // } = await this.#connection.collection(ArangoCollectionId.uuids).properties();

            // if (offset !== UUID_SEQUENCE_NUMBER_OFFSET || increment !== 1) {
            //     throw new InternalError(
            //         `Failed to initialize the UUIDs collection. Failed to set key options.`
            //     );
            // }

            return;
        }

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182132515]
         * cleanup the references
         */
        if (isArangoEdgeCollectionCollectionID(collectionName)) {
            await this.connection.createEdgeCollection(collectionName);
        } else {
            await this.connection.createCollection(collectionName);
        }
    }
}

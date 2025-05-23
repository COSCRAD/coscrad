import { DynamicModule, Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsoleCoscradCliLogger } from '../coscrad-cli/logging';
import { CoscradEventFactory, EventModule } from '../domain/common';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../domain/models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../domain/models/audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../domain/models/photograph/queries';
import { ArangoPhotographQueryRepository } from '../domain/models/photograph/repositories';
import { ArangoPlaylistQueryRepository } from '../domain/models/playlist/queries/arango-playlist-query-repository';
import {
    IPlaylistQueryRepository,
    PLAYLIST_QUERY_REPOSITORY_TOKEN,
} from '../domain/models/playlist/queries/playlist-query-repository.interface';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../domain/models/term/queries';
import { ArangoTermQueryRepository } from '../domain/models/term/repositories';
import { ArangoQueryRepositoryProvider } from '../domain/models/term/repositories/arango-query-repository-provider';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../domain/models/vocabulary-list/queries';
import { ArangoVocabularyListQueryRepository } from '../domain/models/vocabulary-list/repositories';
import { ID_RESPOSITORY_TOKEN } from '../lib/id-generation/interfaces/id-repository.interface';
import { DigitalTextQueryRepository } from '../queries/digital-text/digital-text.query-repository';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { REPOSITORY_PROVIDER_TOKEN } from './constants/persistenceConstants';
import { ArangoConnectionProvider } from './database/arango-connection.provider';
import { ArangoQueryRunner } from './database/arango-query-runner';
import { ArangoDatabaseProvider } from './database/database.provider';
import { ArangoDataExporter } from './repositories/arango-data-exporter';
import { ArangoEventRepository } from './repositories/arango-event-repository';
import { ArangoIdRepository } from './repositories/arango-id-repository';
import { ArangoRepositoryProvider } from './repositories/arango-repository.provider';
import { DomainDataExporter } from './repositories/domain-data-exporter';

@Global()
@Module({})
export class PersistenceModule implements OnApplicationShutdown {
    constructor(private readonly databaseProvider: ArangoDatabaseProvider) {}

    onApplicationShutdown(_signal?: string) {
        // Avoid memory leaks
        this.databaseProvider.close();
    }

    static forRootAsync(): DynamicModule {
        const arangoConnectionProvider = {
            provide: ArangoConnectionProvider,
            useFactory: async (configService: ConfigService) => {
                const arangoConnectionProvider = new ArangoConnectionProvider(configService);

                await arangoConnectionProvider.initialize();

                return arangoConnectionProvider;
            },
            inject: [ConfigService],
        };

        const arangoDatabaseProvider = {
            provide: ArangoDatabaseProvider,
            useFactory: async (arangoConnectionProvider: ArangoConnectionProvider) => {
                return new ArangoDatabaseProvider(arangoConnectionProvider);
            },
            inject: [ArangoConnectionProvider],
        };

        const repositoryProvider = {
            provide: REPOSITORY_PROVIDER_TOKEN,
            useFactory: async (
                arangoConnectionProvider: ArangoConnectionProvider,
                coscradEventFactory: CoscradEventFactory,
                dynamicDataTypeFinderService: DynamicDataTypeFinderService
            ) => {
                const repositoryProvider = new ArangoRepositoryProvider(
                    new ArangoDatabaseProvider(arangoConnectionProvider),
                    coscradEventFactory,
                    dynamicDataTypeFinderService
                );

                return repositoryProvider;
            },
            inject: [ArangoConnectionProvider, CoscradEventFactory, DynamicDataTypeFinderService],
        };

        const idRepositoryProvider = {
            provide: ID_RESPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoIdRepository(new ArangoDatabaseProvider(arangoConnectionProvider)),
            inject: [ArangoConnectionProvider],
        };

        const arangoQueryRunnerProvider = {
            provide: ArangoQueryRunner,
            useFactory: (arangoDatabaseProvider: ArangoDatabaseProvider) =>
                new ArangoQueryRunner(arangoDatabaseProvider),
            inject: [ArangoDatabaseProvider],
        };

        const arangoDataExporterProvider = {
            provide: ArangoDataExporter,
            useFactory: (arangoQueryRunner: ArangoQueryRunner) =>
                new ArangoDataExporter(arangoQueryRunner),
            inject: [ArangoQueryRunner],
        };

        const domainDataExporterProvider = {
            provide: DomainDataExporter,
            useFactory: (arangoRepositoryProvider: ArangoRepositoryProvider) =>
                new DomainDataExporter(arangoRepositoryProvider),
            inject: [REPOSITORY_PROVIDER_TOKEN],
        };

        // TODO Remove this in favor of generic `QueryRepositoryProvider`
        const digitalTextQueryRepositoryProvider = {
            provide: DigitalTextQueryRepository,
            useFactory: (
                databaseProvider: ArangoDatabaseProvider,
                coscradEventFactory: CoscradEventFactory
            ) => {
                return new DigitalTextQueryRepository(
                    new ArangoEventRepository(databaseProvider, coscradEventFactory)
                );
            },
            inject: [ArangoDatabaseProvider, CoscradEventFactory],
        };

        /**
         * TODO We shouldn't expose the resource-specific repositories here.
         * Instead, we should inject the required Arango infrastructure into
         * the corresponding resource module. This will keep the modules
         * independent and loosely coupled.
         */
        const audioQueryRepositoryProvider = {
            provide: AUDIO_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoAudioItemQueryRepository(arangoConnectionProvider),
            inject: [ArangoConnectionProvider],
        };

        const termQueryRepositoryProvider = {
            provide: TERM_QUERY_REPOSITORY_TOKEN,
            useFactory: (
                arangoConnectionProvider: ArangoConnectionProvider,
                audioItemQueryRepository: ArangoAudioItemQueryRepository
            ) => {
                const singleton = new ArangoTermQueryRepository(
                    arangoConnectionProvider,
                    audioItemQueryRepository,
                    new ConsoleCoscradCliLogger()
                );

                return singleton;
            },
            inject: [ArangoConnectionProvider, AUDIO_QUERY_REPOSITORY_TOKEN],
        };

        const vocabularyListQueryRepository = {
            provide: VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoVocabularyListQueryRepository(
                    arangoConnectionProvider,
                    new ConsoleCoscradCliLogger()
                ),
            inject: [ArangoConnectionProvider, AUDIO_QUERY_REPOSITORY_TOKEN],
        };

        // TODO We should remove this.
        const photographQueryRepository = {
            provide: PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) => {
                return new ArangoPhotographQueryRepository(arangoConnectionProvider);
            },
            inject: [ArangoConnectionProvider],
        };

        // TODO use dynamic registration
        const playlistQueryRepository = {
            provide: PLAYLIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) => {
                const repo = new ArangoPlaylistQueryRepository(arangoConnectionProvider);

                return repo;
            },
            inject: [ArangoConnectionProvider],
        };

        const queryRepositoryProvider = {
            provide: QUERY_REPOSITORY_PROVIDER_TOKEN,
            useFactory: (
                photographQueryRepository: IPhotographQueryRepository,
                termQueryRepository: ITermQueryRepository,
                audioItemQueryRepository: IAudioItemQueryRepository,
                vocabularyListQueryRepository: IVocabularyListQueryRepository,
                playlistQueryRepository: IPlaylistQueryRepository
            ): IQueryRepositoryProvider =>
                new ArangoQueryRepositoryProvider(
                    photographQueryRepository,
                    termQueryRepository,
                    audioItemQueryRepository,
                    vocabularyListQueryRepository,
                    playlistQueryRepository
                ),
            inject: [
                PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
                TERM_QUERY_REPOSITORY_TOKEN,
                AUDIO_QUERY_REPOSITORY_TOKEN,
                VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
                PLAYLIST_QUERY_REPOSITORY_TOKEN,
            ],
        };

        return {
            module: PersistenceModule,
            imports: [ConfigModule, EventModule, DynamicDataTypeModule],
            providers: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
                arangoQueryRunnerProvider,
                arangoDataExporterProvider,
                domainDataExporterProvider,
                digitalTextQueryRepositoryProvider,
                audioQueryRepositoryProvider,
                photographQueryRepository,
                termQueryRepositoryProvider,
                vocabularyListQueryRepository,
                playlistQueryRepository,
                queryRepositoryProvider,
            ],
            exports: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
                arangoQueryRunnerProvider,
                arangoDataExporterProvider,
                domainDataExporterProvider,
                digitalTextQueryRepositoryProvider,
                audioQueryRepositoryProvider,
                termQueryRepositoryProvider,
                playlistQueryRepository,
                queryRepositoryProvider,
                EventModule,
            ],
            global: true,
        };
    }
}

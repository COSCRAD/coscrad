import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../../app/controllers/command/services/command-info-service';
import { BibliographicCitationModule } from '../../../../../../app/domain-modules/bibliographic-citation.module';
import { DigitalTextModule } from '../../../../../../app/domain-modules/digital-text.module';
import { IRepositoryForAggregate } from '../../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { IDigitalTextQueryRepository } from '../../../../digital-text/queries/digital-text-query-repository.interface';
import { SongCreatedEventHandler } from '../../../../song/commands/song-created.event-handler';
import { BookBibliographicCitation } from '../../../book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { DigitalRepresentationOfBibliographicCitationRegistered } from './digital-representation-of-bibliographic-citation-registered.event';

describe(`RegisterDigitalRepresentationOfBibliographicCitationCommandHandler`, () => {
    let _digitalTextQueryRepository: IDigitalTextQueryRepository;

    let _bibliographicCitationRepository: IRepositoryForAggregate<BookBibliographicCitation>;

    let _databaseProvider: ArangoDatabaseProvider;

    let _app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, SongCreatedEventHandler],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                // PersistenceModule.forRootAsync(),
                CommandModule,
                DigitalTextModule,
                BibliographicCitationModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        // await moduleRef.init();

        _app = moduleRef.createNestApplication();

        // const connectionProvider = app.get(ArangoConnectionProvider);

        // _databaseProvider = new ArangoDatabaseProvider(connectionProvider);
        // _digitalTextQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);
        // _bibliographicCitationRepository = app
        //     .get(REPOSITORY_PROVIDER_TOKEN)
        //     .forResource(ResourceType.bibliographicCitation);
    });

    beforeEach(async () => {
        // await databaseProvider.getDatabaseForCollection('digitalText__VIEWS').clear();
        // await databaseProvider
        //     .getDatabaseForCollection(ArangoCollectionId.bibliographic_references)
        //     .clear();
    });

    afterAll(async () => {
        // databaseProvider.close();
        // await app.close();
    });

    describe(`when registering a digital text as the digital representation of a book bibliographic citation`, () => {
        const bookBibliographicCitation = buildTestInstance(BookBibliographicCitation, {
            id: buildDummyUuid(1),
            digitalRepresentationResourceCompositeIdentifier: null,
        });

        const digitalText = buildTestInstance(DigitalTextViewModel, {
            id: buildDummyUuid(2),
        });

        const _event = buildTestInstance(DigitalRepresentationOfBibliographicCitationRegistered, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: bookBibliographicCitation.id,
                    type: AggregateType.bibliographicCitation,
                },
                digitalRepresentationResourceCompositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: digitalText.id,
                },
            },
        });

        beforeEach(async () => {
            // await bibliographicCitationRepository.create(bookBibliographicCitation);
            // await digitalTextQueryRepository.create(digitalText);
        });

        it(`should update the corresponding views`, async () => {
            expect(1).toBe(2);
            // await app
            //     .get(DigitalRepresentationOfBibliographicCitationRegisteredEventHandler)
            //     .handle(event);

            // const updatedDigitalText = (await digitalTextQueryRepository.fetchById(
            //     digitalText.id
            // )) as DigitalTextViewModel;

            // const { sourceCitationId } = updatedDigitalText;

            // expect(sourceCitationId).toEqual(bookBibliographicCitation.id);

            /**
             * TODO Once we have a query repository for bibliographic citations,
             * we should check that the corresponding document is updated.
             */
        });
    });
});

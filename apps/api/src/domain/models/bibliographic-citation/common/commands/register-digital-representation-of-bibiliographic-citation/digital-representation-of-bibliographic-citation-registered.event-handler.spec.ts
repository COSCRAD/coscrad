import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { IRepositoryForAggregate } from '../../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { ArangoDigitalTextQueryRepository } from '../../../../digital-text/queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../../../digital-text/queries/digital-text-query-repository.interface';
import { BookBibliographicCitation } from '../../../book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { DigitalRepresentationOfBibliographicCitationRegistered } from './digital-representation-of-bibliographic-citation-registered.event';
import { DigitalRepresentationOfBibliographicCitationRegisteredEventHandler } from './digital-representation-of-bibliographic-citation-registered.event-handler';

describe(`RegisterDigitalRepresentationOfBibliographicCitationCommandHandler`, () => {
    let digitalTextQueryRepository: IDigitalTextQueryRepository;

    let bibliographicCitationRepository: IRepositoryForAggregate<BookBibliographicCitation>;

    let databaseProvider: ArangoDatabaseProvider;

    let connectionProvider: ArangoConnectionProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [],
            imports: [PersistenceModule.forRootAsync()],
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
            .compile()
            .catch((e) => {
                throw e;
            });

        app = moduleRef.createNestApplication();

        connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);
        digitalTextQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);
        bibliographicCitationRepository = app
            .get(REPOSITORY_PROVIDER_TOKEN)
            .forResource(ResourceType.bibliographicCitation);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('digitalText__VIEWS').clear();

        await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.bibliographic_references)
            .clear();
    });

    afterAll(async () => {
        databaseProvider.close();

        await app.close();
    });

    describe(`when registering a digital text as the digital representation of a book bibliographic citation`, () => {
        const bookBibliographicCitation = buildTestInstance(BookBibliographicCitation, {
            id: buildDummyUuid(1),
            digitalRepresentationResourceCompositeIdentifier: null,
        });

        const digitalText = buildTestInstance(DigitalTextViewModel, {
            id: buildDummyUuid(2),
        });

        const event = buildTestInstance(DigitalRepresentationOfBibliographicCitationRegistered, {
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
            await bibliographicCitationRepository.create(bookBibliographicCitation);

            await digitalTextQueryRepository.create(digitalText);
        });

        it(`should update the corresponding views`, async () => {
            await new DigitalRepresentationOfBibliographicCitationRegisteredEventHandler(
                new ArangoDigitalTextQueryRepository(connectionProvider)
            ).handle(event);

            const updatedDigitalText = (await digitalTextQueryRepository.fetchById(
                digitalText.id
            )) as DigitalTextViewModel;

            const { sourceCitationId } = updatedDigitalText;

            expect(sourceCitationId).toEqual(bookBibliographicCitation.id);

            /**
             * TODO Once we have a query repository for bibliographic citations,
             * we should check that the corresponding document is updated.
             */
        });
    });
});

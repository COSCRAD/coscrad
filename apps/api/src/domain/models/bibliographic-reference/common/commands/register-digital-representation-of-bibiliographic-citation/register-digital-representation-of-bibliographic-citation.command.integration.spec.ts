import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { IIdRepository } from '../../../../../../lib/id-generation/interfaces/id-repository.interface';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { TEST_DATABASE_PREFIX } from '../../../../../../persistence/constants/persistenceConstants';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import getValidBibliographicReferenceInstanceForTest from '../../../../../__tests__/utilities/getValidBibliographicReferenceInstanceForTest';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../types/ResourceType';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { IBibliographicReference } from '../../../interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../../types/BibliographicReferenceType';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-ciation.command';

const commandType = 'REGISTER_DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION';

//  TODO Why doesn't the usual helper work?
const testDatabaseName = `${TEST_DATABASE_PREFIX}_register-digital-representation`;

const existingBibliographicReference = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.book
);

const existingDigitalText = getValidAggregateInstanceForTest(ResourceType.digitalText);

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<RegisterDigitalRepresentationOfBibliographicCitation>;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: existingBibliographicReference.getCompositeIdentifier(),
        digitalRepresentationResourceCompositeIdentifier:
            existingDigitalText.getCompositeIdentifier(),
    },
});

const buildValidCommandFSA = () => validFsa;

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let _idRepository: IIdRepository;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };

        // idRepository = new ArangoIdRepository(databaseProvider);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [ResourceType.bibliographicReference]: [existingBibliographicReference],
                            [ResourceType.digitalText]: [existingDigitalText],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
                buildValidCommandFSA,
                checkStateOnSuccess: async () => {
                    const searchResult = await testRepositoryProvider
                        .forResource(ResourceType.bibliographicReference)
                        .fetchById(validFsa.payload.aggregateCompositeIdentifier.id);

                    expect(searchResult).not.toBeInstanceOf(InternalError);

                    const updatedInstance = searchResult as IBibliographicReference;

                    const reference =
                        updatedInstance.digitalRepresentationResoruceCompositeIdentifier;

                    expect(reference).toEqual(existingDigitalText.getCompositeIdentifier());

                    assertEventRecordPersisted(
                        updatedInstance,
                        'DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION_REGISTERED',
                        dummySystemUserId
                    );
                },
            });
        });
    });
});

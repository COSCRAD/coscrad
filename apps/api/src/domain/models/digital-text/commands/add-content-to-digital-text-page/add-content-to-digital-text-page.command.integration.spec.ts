import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events/test-event-stream';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import {
    CannotOverwritePageContentError,
    FailedToUpdateDigitalTextPageError,
    MissingPageError,
} from '../../errors';
import { ContentAddedToDigitalTextPage } from '../events/content-added-to-digital-text-page.event';
import { DigitalTextCreated } from '../events/digital-text-created.event';
import { PageAddedToDigitalText } from '../events/page-added-to-digital-text.event';
import { AddContentToDigitalTextPage } from './add-content-to-digital-text-page.command';

const commandType = 'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE';

const contentAddedEventType = 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE';

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddContentToDigitalTextPage>;

const languageCode = LanguageCode.English;

const text = 'Once upon a time there lived 3 little pigs.';

const existingPageIdentifier = '3';

const commandFsaFactory = new DummyCommandFsaFactory<AddContentToDigitalTextPage>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            languageCode,
            text,
            pageIdentifier: existingPageIdentifier,
        },
    })
);

const digitalTextId = dummyFsa.payload.aggregateCompositeIdentifier.id;

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    const eventStreamForDigitalTextWithNoPages = new TestEventStream().andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
        payload: {
            // we don't care what the title is
        },
    });

    const eventStreamForDigitalTextWithPage =
        eventStreamForDigitalTextWithNoPages.andThen<PageAddedToDigitalText>({
            type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
            payload: {
                // this will be the target page for the new content
                identifier: existingPageIdentifier,
            },
        });

    describe('when the command is valid', () => {
        it(`should succeed with the expected updates`, async () => {
            const eventHistory = eventStreamForDigitalTextWithPage.as({
                id: digitalTextId,
            });

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                buildValidCommandFSA: () =>
                    commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            id: digitalTextId,
                        },
                    }),
                checkStateOnSuccess: async () => {
                    const searchResult = await testRepositoryProvider
                        .forResource<DigitalText>(AggregateType.digitalText)
                        .fetchById(digitalTextId);

                    expect(searchResult).not.toBe(NotFound);

                    expect(searchResult).not.toBeInstanceOf(InternalError);

                    const updatedDigitalText = searchResult as DigitalText;

                    const pageSearchResult = updatedDigitalText.getPage(existingPageIdentifier);

                    expect(pageSearchResult).toBeInstanceOf(DigitalTextPage); // and not an error

                    const updatedPage = pageSearchResult as DigitalTextPage;

                    expect(updatedPage.hasContent()).toBe(true);

                    const content = updatedPage.getContent() as MultilingualText; // and not `NotFound`

                    const { text: foundText, languageCode: foundLanguageCode } =
                        content.getOriginalTextItem();

                    expect(foundText).toBe(text);

                    expect(foundLanguageCode).toBe(languageCode);

                    const allEvents = await app.get(ArangoEventRepository).fetchEvents();

                    const searchResultForEvent = allEvents.find(
                        (event) =>
                            event.type === contentAddedEventType &&
                            isDeepStrictEqual(event.payload[AGGREGATE_COMPOSITE_IDENTIFIER], {
                                type: AggregateType.digitalText,
                                id: digitalTextId,
                            })
                    );

                    expect(searchResultForEvent).toBeTruthy();

                    // TODO Update `assertEventRecordPersisted`
                    //  assertEventRecordPersisted(
                    //     updatedDigitalText,
                    //     'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
                    //     dummySystemUserId
                    // );
                },
            });
        });
    });

    describe(`when the digital text does not exist`, () => {
        it(`should fail with the expected errors`, async () => {
            await assertCommandError(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await Promise.resolve();
                },
                buildCommandFSA: () => commandFsaFactory.build(undefined, {}),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new AggregateNotFoundError(
                                dummyFsa.payload.aggregateCompositeIdentifier
                            ),
                        ])
                    );
                },
            });
        });
    });

    describe(`when the page does not exist`, () => {
        const eventHistory = eventStreamForDigitalTextWithNoPages.as({
            id: digitalTextId,
        });

        it(`should fail with the expected errors`, async () => {
            await assertCommandError(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    // TODO should we use a DI token for the event repo and program to the interface?
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                buildCommandFSA: () => commandFsaFactory.build(undefined, {}),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new FailedToUpdateDigitalTextPageError(
                                existingPageIdentifier,
                                digitalTextId,
                                [new MissingPageError(existingPageIdentifier, digitalTextId)]
                            ),
                        ])
                    );
                },
            });
        });
    });

    describe(`when the page already has content`, () => {
        it(`should fail with the expected errors`, async () => {
            const existingTextContent = 'beat you to it!';

            await assertCreateCommandError(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app.get(ArangoEventRepository).appendEvents(
                        eventStreamForDigitalTextWithPage
                            .andThen<ContentAddedToDigitalTextPage>({
                                // TODO Why is there no type safety for this one? It works elsewhere.
                                type: contentAddedEventType,
                                payload: {
                                    pageIdentifier: existingPageIdentifier,
                                    text: existingTextContent,
                                },
                            })
                            .as({ id: digitalTextId })
                    );
                },
                buildCommandFSA: () => commandFsaFactory.build(undefined, {}),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new FailedToUpdateDigitalTextPageError(
                                existingPageIdentifier,
                                digitalTextId,
                                [
                                    new CannotOverwritePageContentError(
                                        existingPageIdentifier,
                                        buildMultilingualTextWithSingleItem(
                                            existingTextContent,
                                            languageCode
                                        )
                                    ),
                                ]
                            ),
                        ])
                    );
                },
            });
        });
    });
});

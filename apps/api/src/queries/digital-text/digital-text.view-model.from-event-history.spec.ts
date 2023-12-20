import { AggregateType, CoscradUserRole, LanguageCode } from '@coscrad/api-interfaces';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    DigitalTextCreated,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import { ContentAddedToDigitalTextPage } from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { TestEventStream } from '../../test-data/events/test-event-stream';
import { DigitalTextViewModel } from './digital-text.view-model';

describe(`DigitalTextViewModel.fromEventHistory`, () => {
    const digitalTextId = buildDummyUuid(123);

    const tagId = buildDummyUuid(125);

    const tagLabel = 'props';

    const aggregateCompositeIdentifier = {
        type: AggregateType.digitalText,
        id: digitalTextId,
    } as const;

    const title = 'Once Upon a Time';

    const languageCodeForTitle = LanguageCode.Haida;

    const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
        payload: {
            title,
            languageCodeForTitle,
        },
    });

    const digitalTextPublished = digitalTextCreated.andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
        payload: {},
    });

    const dummyPageIdentifier = 'IX';

    const pageAddedToDigitalText = digitalTextPublished.andThen<PageAddedToDigitalText>({
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        payload: {
            identifier: dummyPageIdentifier,
        },
    });

    const dummyUserId = buildDummyUuid(124);

    const dummyPageTextContent = 'Foo to the bar Mr. Baz!';

    const languageCodeForTextContent = LanguageCode.English;

    const contentAddedToDigitalTextPage =
        pageAddedToDigitalText.andThen<ContentAddedToDigitalTextPage>({
            type: 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
            payload: {
                pageIdentifier: dummyPageIdentifier,
                text: dummyPageTextContent,
                languageCode: languageCodeForTextContent,
            },
        });

    const buildQueryUser = (userId: string, roles: CoscradUserRole[]): CoscradUserWithGroups =>
        new CoscradUserWithGroups(
            new CoscradUser({
                type: 'user',
                id: userId,
                authProviderUserId: `auth0|${userId}`,
                roles,
                username: `username for user: ${userId}`,
            }),
            []
        );

    describe(`when the digital text has yet to be published`, () => {
        const eventHistory = digitalTextCreated.as({
            type: AggregateType.digitalText,
            id: digitalTextId,
        });

        const result = new DigitalTextViewModel(digitalTextId).applyStream(eventHistory);

        describe(`immediately after creation`, () => {
            it(`should have the appropriate title`, () => {
                expect(result).toBeInstanceOf(DigitalTextViewModel);

                const { title: multilingualTextTitleFromViewModel } = result;

                const originalTextItem = multilingualTextTitleFromViewModel.getOriginalTextItem();

                expect(originalTextItem.text).toBe(title);

                expect(originalTextItem.languageCode).toBe(languageCodeForTitle);
            });

            it(`should not yet be published`, () => {
                expect(result.isPublished).toBe(false);
            });

            it(`should not be available to a non-admin user`, () => {
                expect(result.hasReadAccess(buildQueryUser(dummyUserId, []))).toBe(false);
            });

            it(`should be available to the user who created it`, () => {
                const systemUserId = eventHistory[0].meta.userId;

                expect(result.hasReadAccess(buildQueryUser(systemUserId, []))).toBe(true);
            });

            it(`should be available to a project (tenant) admin user`, () => {
                expect(
                    result.hasReadAccess(
                        buildQueryUser(buildDummyUuid(987), [CoscradUserRole.projectAdmin])
                    )
                );
            });

            it(`should be available to a COSCRAD (super) admin user`, () => {
                expect(
                    result.hasReadAccess(
                        buildQueryUser(buildDummyUuid(987), [CoscradUserRole.superAdmin])
                    )
                );
            });
        });

        describe(`when a user has been granted access`, () => {
            it(`should allow access to the user`, () => {
                const eventHistory = digitalTextCreated
                    .andThen<ResourceReadAccessGrantedToUser>({
                        type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
                        payload: {
                            userId: dummyUserId,
                        },
                    })
                    .as({
                        type: AggregateType.digitalText,
                        id: digitalTextId,
                    });

                const result = new DigitalTextViewModel(digitalTextId).applyStream(eventHistory);

                expect(result.isPublished).toBe(false);

                expect(result.hasReadAccess(buildQueryUser(dummyUserId, []))).toBe(true);
            });
        });
    });

    describe(`when the digital text has been published`, () => {
        describe(`when no pages have been added`, () => {
            it(`should be explicitly marked as published`, () => {
                const eventHistory = digitalTextPublished.as(aggregateCompositeIdentifier);

                const result = new DigitalTextViewModel(digitalTextId).applyStream(eventHistory);

                expect(result.isPublished).toBe(true);
            });
        });

        describe(`when pages have been added`, () => {
            describe(`when a single page has been added with no content`, () => {
                const eventHistory = pageAddedToDigitalText.as(aggregateCompositeIdentifier);

                const result = new DigitalTextViewModel(digitalTextId).applyStream(eventHistory);

                expect(result.pages).toHaveLength(1);
            });

            describe(`when content has been added for a page`, () => {
                const eventHistory = contentAddedToDigitalTextPage.as(aggregateCompositeIdentifier);

                const result = new DigitalTextViewModel(digitalTextId).applyStream(eventHistory);

                const targetPage = result.pages[0];

                const pageContentSearchResult = targetPage.getContent();

                expect(pageContentSearchResult).toBeInstanceOf(MultilingualText);

                const { text, languageCode } = (
                    pageContentSearchResult as MultilingualText
                ).getOriginalTextItem();

                expect(text).toBe(dummyPageTextContent);

                expect(languageCode).toBe(languageCodeForTextContent);
            });

            // TODO when content has been translated for a page
            // TODO when audio has been added to a page
        });
    });

    describe(`when there are tags for the digital text`, () => {
        it(`should be available on the view model`, () => {
            const eventHistoryForTag = new TestEventStream()
                .andThen<TagCreated>({
                    type: 'TAG_CREATED',
                    payload: {
                        label: tagLabel,
                    },
                })
                .andThen<ResourceOrNoteTagged>({
                    type: 'RESOURCE_OR_NOTE_TAGGED',
                    payload: {
                        taggedMemberCompositeIdentifier: aggregateCompositeIdentifier,
                    },
                })
                .as({
                    id: tagId,
                });

            const eventHistoryForDigitalText = digitalTextPublished.as({
                id: digitalTextId,
            });

            const fullEventHistory = [...eventHistoryForTag, ...eventHistoryForDigitalText];

            const result = new DigitalTextViewModel(digitalTextId).applyStream(fullEventHistory);

            const { tags } = result;

            expect(tags).toHaveLength(1);

            const isThereATagWithDummyLabel = tags.some(({ label }) => label === tagLabel);

            expect(isThereATagWithDummyLabel).toBe(true);
        });
    });
});

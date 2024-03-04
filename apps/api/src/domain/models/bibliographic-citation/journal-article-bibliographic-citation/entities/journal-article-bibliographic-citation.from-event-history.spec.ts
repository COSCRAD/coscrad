import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { NotFound } from '../../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import {
    JournalArticleBibliographicCitationCreated,
    JournalArticleBibliographicCitationCreatedPayload,
} from '../commands/journal-article-bibliographic-citation-created.event';
import { JournalArticleBibliographicCitation } from './journal-article-bibliographic-citation.entity';

const journalId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.bibliographicCitation,
    id: journalId,
};

const title = 'The Quirks about Quarks';

const creatorName = 'Smarty McBighead';

const creatorType = BibliographicSubjectCreatorType.author;

const payloadWithRequiredPropsOnly = {
    title,
    creators: [
        {
            name: creatorName,
            type: creatorType,
        },
    ],
};

const journalArticleBibliographicCitationCreatedWithRequiredPropsOnly =
    new TestEventStream().andThen<JournalArticleBibliographicCitationCreated>({
        type: 'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED',
        payload: payloadWithRequiredPropsOnly,
    });

const abstract = 'This is what it is all about.';

const publicationTitle = 'New Stuff in Physics';

const url = 'https://www.coscrad.org/phys123.pdf';

const issn = '1234-5679';

const doi = '10.1080/15588742.2015';

const optionalPropertiesAndKeys = [
    [abstract, 'abstract'],
    [publicationTitle, 'publicationTitle'],
    [url, 'url'],
    [issn, 'issn'],
    [doi, 'doi'],
];

const payloadWithAllProperties: JournalArticleBibliographicCitationCreatedPayload =
    optionalPropertiesAndKeys.reduce((acc, [value, key]) => {
        acc[key] = value;

        return acc;
    }, cloneToPlainObject(payloadWithRequiredPropsOnly));

const journalArticleBibliographicCitationCreatedWithAllProps =
    new TestEventStream().andThen<JournalArticleBibliographicCitationCreated>({
        type: 'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED',
        payload: payloadWithAllProperties,
    });

const journalArticlePublished =
    journalArticleBibliographicCitationCreatedWithAllProps.andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
    });

const userId = buildDummyUuid(345);

const readAccessGranted = journalArticlePublished.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId,
    },
});

describe(`JournalArticleBibliographicCitation.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the journal article has been created`, () => {
            describe(`when only the required properties are specified`, () => {
                it(`should return a Journal Article Bibliographic Citation with the expected state`, () => {
                    const result = JournalArticleBibliographicCitation.fromEventHistory(
                        journalArticleBibliographicCitationCreatedWithRequiredPropsOnly.as(
                            aggregateCompositeIdentifier
                        ),
                        journalId
                    );

                    expect(result).toBeInstanceOf(JournalArticleBibliographicCitation);

                    const journalArticle = result as JournalArticleBibliographicCitation;

                    const {
                        data: { creators },
                    } = journalArticle;

                    expect(creators).toHaveLength(1);

                    const { name: foundCreatorName, type: foundCreatorType } = creators[0];

                    expect(foundCreatorName).toBe(creatorName);

                    expect(foundCreatorType).toBe(creatorType);

                    const { text: foundNameText, languageCode } = journalArticle
                        .getName()
                        .getOriginalTextItem();

                    expect(foundNameText).toBe(title);

                    // Currently, Journal Article titles are assumed to be in English
                    expect(languageCode).toBe(LanguageCode.English);
                });
            });

            describe(`when all optional properties are also specified`, () => {
                it(`should set the correct values for optional properties`, () => {
                    const result = JournalArticleBibliographicCitation.fromEventHistory(
                        journalArticleBibliographicCitationCreatedWithAllProps.as(
                            aggregateCompositeIdentifier
                        ),
                        journalId
                    );

                    expect(result).toBeInstanceOf(JournalArticleBibliographicCitation);

                    const journalArticle = result as JournalArticleBibliographicCitation;

                    const { data } = journalArticle;

                    optionalPropertiesAndKeys.forEach(([value, key]) => {
                        const actual = data[key];

                        expect(actual).toEqual(value);
                    });
                });
            });
        });

        describe(`when the journal article has been published`, () => {
            it(`should return a published journal article`, () => {
                const result = JournalArticleBibliographicCitation.fromEventHistory(
                    journalArticlePublished.as(aggregateCompositeIdentifier),
                    journalId
                );

                expect(result).toBeInstanceOf(JournalArticleBibliographicCitation);

                const journalArticle = result as JournalArticleBibliographicCitation;

                expect(journalArticle.published).toBe(true);
            });
        });

        describe(`when a user has been granted access`, () => {
            it(`should return a journal article that allows access to the given user`, () => {
                const result = JournalArticleBibliographicCitation.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    journalId
                );

                expect(result).toBeInstanceOf(JournalArticleBibliographicCitation);

                const journalArticle = result as JournalArticleBibliographicCitation;

                expect(journalArticle.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given Journal Article Bibliographic Citation`, () => {
            it(`should return Not Found`, () => {
                const result = JournalArticleBibliographicCitation.fromEventHistory(
                    journalArticleBibliographicCitationCreatedWithRequiredPropsOnly.as({
                        type: AggregateType.bibliographicCitation,
                        id: buildDummyUuid(980),
                    }),
                    journalId
                );

                expect(result).toBe(NotFound);
            });
        });

        describe(`when the creation event is missing`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    JournalArticleBibliographicCitation.fromEventHistory(
                        // remove the creation event
                        readAccessGranted.as(aggregateCompositeIdentifier).slice(1),
                        journalId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        // This could happen if we change our invariant rules or botch event versioning
        describe(`when there is a creation event with invalid data`, () => {
            it(`should throw an invariant validation error`, () => {
                const eventSource = () => {
                    JournalArticleBibliographicCitation.fromEventHistory(
                        new TestEventStream()
                            .andThen<JournalArticleBibliographicCitationCreated>({
                                type: 'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED',
                                payload: {
                                    // this shouldn't be an empty string
                                    title: '',
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        journalId
                    );
                };

                expect(eventSource).toThrow();
            });
        });
    });
});

import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { NotFound } from '../../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import {
    BookBibliographicCitationCreated,
    BookBibliographicCitationCreatedPayload,
} from '../commands/create-book-bibliographic-citation/book-bibliographic-citation-created.event';
import { BookBibliographicCitation } from './book-bibliographic-citation.entity';

const title = 'A Good Book';

const creatorName = 'Jane Deer';

const creatorType = BibliographicSubjectCreatorType.author;

const payloadWithRequiredProps: Omit<
    BookBibliographicCitationCreatedPayload,
    'aggregateCompositeIdentifier'
> = {
    title,
    creators: [
        {
            name: creatorName,
            type: creatorType,
        },
    ].map((dto) => new BibliographicCitationCreator(dto)),
};

const numberOfPages = 105;

const place = 'British Columbia';

const url = 'https://www.coscrad.org/random-link';

const publisher = 'COSCRAD Clearing House';

const year = 2020;

const abstract = 'This is a very interesting book indeed.';

const isbn = '0-395-36341-1';

const optionalPropertiesAndLabels = [
    [numberOfPages, 'numberOfPages'],
    [place, 'place'],
    [url, 'url'],
    [publisher, 'publisher'],
    [year, 'year'],
    [abstract, 'abstract'],
    [isbn, 'isbn'],
] as const;

const undefinedOptionalProperties = optionalPropertiesAndLabels
    .map(([_, propertyName]) => propertyName)
    .reduce((acc, nextPropertyName) => {
        acc[nextPropertyName] = undefined;

        return acc;
    }, {});

const payloadWithAllOptionalPropertiesUndefined = {
    ...payloadWithRequiredProps,
    ...undefinedOptionalProperties,
};

const payloadWithAllOptionalPropertiesSpecified = optionalPropertiesAndLabels.reduce(
    (acc, [value, key]) => {
        acc[key] = value;

        return acc;
    },
    cloneToPlainObject(payloadWithRequiredProps)
);

const bookCreatedWithRequiredInfoOnly =
    new TestEventStream().andThen<BookBibliographicCitationCreated>({
        type: 'BOOK_BIBLIOGRAPHIC_CITATION_CREATED',
        payload: payloadWithAllOptionalPropertiesUndefined,
    });

const bookCreatedWithAllInfo = new TestEventStream().andThen<BookBibliographicCitationCreated>({
    type: 'BOOK_BIBLIOGRAPHIC_CITATION_CREATED',
    payload: payloadWithAllOptionalPropertiesSpecified,
});

const bookPublished = bookCreatedWithRequiredInfoOnly.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const userId = buildDummyUuid(55);

const readAccessGranted = bookCreatedWithRequiredInfoOnly.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId,
    },
});

const bookBibliographicCitationId = buildDummyUuid(6);

const aggregateCompositeIdentifier = {
    type: AggregateType.bibliographicCitation,
    id: bookBibliographicCitationId,
};

describe(`BookBibliographicCitation.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when there is a creation event`, () => {
            describe(`when only the required properties have been specified`, () => {
                it(`should return a Book Bibliographic Reference with the expected state`, () => {
                    const result = BookBibliographicCitation.fromEventHistory(
                        bookCreatedWithRequiredInfoOnly.as(aggregateCompositeIdentifier),
                        bookBibliographicCitationId
                    );

                    expect(result).toBeInstanceOf(BookBibliographicCitation);

                    const bibliographicCitation = result as BookBibliographicCitation;

                    const { text: foundTextForName, languageCode: foundLanguageCode } =
                        bibliographicCitation.getName().getOriginalTextItem();

                    expect(foundTextForName).toBe(title);

                    // Bibliographic Citations are currently assumed to have English titles
                    expect(foundLanguageCode).toBe(LanguageCode.English);

                    const { data } = bibliographicCitation;

                    const { creators } = data;

                    expect(creators).toHaveLength(1);

                    const { name: foundCreatorName, type: foundCreatorType } = creators[0];

                    expect(foundCreatorName).toBe(creatorName);

                    expect(foundCreatorType).toBe(creatorType);

                    optionalPropertiesAndLabels.forEach(([_, key]) => {
                        expect(data[key]).toBeUndefined();
                    });
                });
            });

            describe(`when all optional properties have been specified`, () => {
                it(`should return a Book Bibliographic References with the optional data set`, () => {
                    const result = BookBibliographicCitation.fromEventHistory(
                        bookCreatedWithAllInfo.as(aggregateCompositeIdentifier),
                        bookBibliographicCitationId
                    );

                    optionalPropertiesAndLabels.forEach(([expected, key]) => {
                        const actual = (result as BookBibliographicCitation).data[key];

                        expect(actual).toEqual(expected);
                    });
                });
            });
        });

        describe(`when the book bibliographic citation has been published`, () => {
            const result = BookBibliographicCitation.fromEventHistory(
                bookPublished.as(aggregateCompositeIdentifier),
                bookBibliographicCitationId
            );

            expect(result).toBeInstanceOf(BookBibliographicCitation);

            const bookBibliographicCitation = result as BookBibliographicCitation;

            expect(bookBibliographicCitation.published).toBe(true);
        });

        describe(`when a user has been granted read access`, () => {
            it('should now allow access to the user', () => {
                const result = BookBibliographicCitation.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    bookBibliographicCitationId
                );

                expect(result).toBeInstanceOf(BookBibliographicCitation);

                const book = result as BookBibliographicCitation;

                expect(book.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given Book Bibliographic Citation`, () => {
            it(`should return Not Found`, () => {
                const differentId = buildDummyUuid(987);

                const result = BookBibliographicCitation.fromEventHistory(
                    readAccessGranted.as({
                        type: AggregateType.bibliographicCitation,
                        id: differentId,
                    }),
                    bookBibliographicCitationId
                );

                expect(result).toBe(NotFound);
            });
        });

        describe(`when the creation event is missing`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    BookBibliographicCitation.fromEventHistory(
                        // omit the creation event
                        bookPublished.as(aggregateCompositeIdentifier).slice(1),
                        bookBibliographicCitationId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        // This could happen if we change our invariant rules or botch event versioning
        describe(`when there is a creation event with invalid data`, () => {
            it(`should return an invariant validation error`, () => {
                const invalidEventHistory = new TestEventStream()
                    .andThen<BookBibliographicCitationCreated>({
                        type: 'BOOK_BIBLIOGRAPHIC_CITATION_CREATED',
                        payload: {
                            // this is not allowed
                            title: 99 as unknown as string,
                        },
                    })
                    .as(aggregateCompositeIdentifier);

                const eventSource = () => {
                    BookBibliographicCitation.fromEventHistory(
                        invalidEventHistory,
                        bookBibliographicCitationId
                    );
                };

                expect(eventSource).toThrow();
            });
        });
    });
});

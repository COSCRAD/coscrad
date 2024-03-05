import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NotFound } from '../../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import { CourtCaseBibliographicCitationCreated } from '../commands/create-court-case-bibliographic-citation';
import { CourtCaseBibliographicCitation } from './court-case-bibliographic-citation.entity';

const courtCaseId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.bibliographicCitation,
    id: courtCaseId,
};

const caseName = "The Nation's Title Case";

const payloadWithRequiredPropsOnly = {
    caseName,
};

const courtCaseCreatedWithRequiredPropsOnly =
    new TestEventStream().andThen<CourtCaseBibliographicCitationCreated>({
        type: 'COURT_CASE_BIBLIOGRAPHIC_CITATION_CREATED',
        payload: payloadWithRequiredPropsOnly,
    });

const abstract = 'this is the abstract';

const dateDecided = '01-01-2001';

const court = 'The Deluxe Court';

const url = 'https://www.coscrad.org/';

const pages = '132';

const optionalPropertiesAndKeys = [
    [abstract, 'abstract'],
    [dateDecided, 'dateDecided'],
    [court, 'court'],
    [url, 'url'],
    [pages, 'pages'],
] as const;

const payloadWithOptionalProperties = optionalPropertiesAndKeys.reduce((acc, [value, key]) => {
    acc[key] = value;

    return acc;
}, cloneToPlainObject(payloadWithRequiredPropsOnly));

const courtCaseCreatedWithOptionalProperties =
    new TestEventStream().andThen<CourtCaseBibliographicCitationCreated>({
        type: 'COURT_CASE_BIBLIOGRAPHIC_CITATION_CREATED',
        payload: payloadWithOptionalProperties,
    });

const courtCasePublished = courtCaseCreatedWithOptionalProperties.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const userId = buildDummyUuid(567);

const readAccessGranted = courtCasePublished.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId,
    },
});

describe(`CourtCaseBibliographicCitation.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the court case has been created`, () => {
            describe(`when only required properties are specified`, () => {
                it(`should return a Court Case Bibliographic Citation with the expected state`, () => {
                    const result = CourtCaseBibliographicCitation.fromEventHistory(
                        courtCaseCreatedWithRequiredPropsOnly.as(aggregateCompositeIdentifier),
                        courtCaseId
                    );

                    expect(result).toBeInstanceOf(CourtCaseBibliographicCitation);

                    const courtCase = result as CourtCaseBibliographicCitation;

                    const { text: foundCaseName, languageCode } = courtCase
                        .getName()
                        .getOriginalTextItem();

                    expect(foundCaseName).toBe(caseName);

                    // Currently, court cases are assumed to be named in English
                    expect(languageCode).toBe(LanguageCode.English);
                });
            });

            describe(`when all properties are specified`, () => {
                it(`should set appropriate values for optional properties`, () => {
                    const result = CourtCaseBibliographicCitation.fromEventHistory(
                        courtCaseCreatedWithOptionalProperties.as(aggregateCompositeIdentifier),
                        courtCaseId
                    );

                    expect(result).toBeInstanceOf(CourtCaseBibliographicCitation);

                    const courtCase = result as CourtCaseBibliographicCitation;

                    optionalPropertiesAndKeys.forEach(([value, key]) => {
                        const actual = courtCase.data[key];

                        expect(actual).toEqual(value);
                    });
                });
            });
        });

        describe(`when the court case has been published`, () => {
            it(`should return a published court case`, () => {
                const result = CourtCaseBibliographicCitation.fromEventHistory(
                    courtCasePublished.as(aggregateCompositeIdentifier),
                    courtCaseId
                );

                expect(result).toBeInstanceOf(CourtCaseBibliographicCitation);

                const courtCase = result as CourtCaseBibliographicCitation;

                expect(courtCase.published).toBe(true);
            });
        });

        describe(`when a user has been granted access to the court case`, () => {
            it(`should grant access to the user`, () => {
                const result = CourtCaseBibliographicCitation.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    courtCaseId
                );

                expect(result).toBeInstanceOf(CourtCaseBibliographicCitation);

                const courtCase = result as CourtCaseBibliographicCitation;

                expect(courtCase.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given Court Case Bibliographic Citation`, () => {
            it(`should return Not Found`, () => {
                const result = CourtCaseBibliographicCitation.fromEventHistory(
                    courtCaseCreatedWithOptionalProperties.as({
                        type: AggregateType.bibliographicCitation,
                        id: buildDummyUuid(89),
                    }),
                    courtCaseId
                );

                expect(result).toBe(NotFound);
            });
        });

        describe(`when the creation event is missing`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    CourtCaseBibliographicCitation.fromEventHistory(
                        // remove the creation event
                        readAccessGranted.as(aggregateCompositeIdentifier).slice(1),
                        courtCaseId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        // This could happen if we change our invariant rules or botch event versioning
        describe(`when there is a creation event with invalid data`, () => {
            it(`should return an invariant validation error`, () => {
                const eventSource = () => {
                    CourtCaseBibliographicCitation.fromEventHistory(
                        new TestEventStream()
                            .andThen<CourtCaseBibliographicCitationCreated>({
                                type: 'COURT_CASE_BIBLIOGRAPHIC_CITATION_CREATED',
                                payload: {
                                    // this is not allowed to be empty
                                    caseName: '',
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        courtCaseId
                    );
                };

                expect(eventSource).toThrow();
            });
        });
    });
});

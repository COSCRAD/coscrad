import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const commonSearchTerms = 'video name';

const textUniqueToFirstVideoName = `Dinosaur`;

const firstVideoName = `${textUniqueToFirstVideoName} ${commonSearchTerms} in Chilcotin`;

const englishTranslationOfVideoName = `Translation of the ${commonSearchTerms} to English`;

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.video, 1);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    2
);

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

const secondMediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    3
);

const compositeIdentifierOfVideoWithNoNameTranslation = buildDummyAggregateCompositeIdentifier(
    AggregateType.video,
    4
);

const secondVideoName = `I only have a ${commonSearchTerms} in one language`;

describe(`Video Index-to-detail Query Flow`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(100);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            titleEnglish: 'media item for the video',
            mimeType: MIMEType.mp4,
            url: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            aggregateCompositeIdentifier,
            name: firstVideoName,
            languageCodeForName: LanguageCode.Chilcotin,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: 720000,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });

        cy.seedDataWithCommand('TRANSLATE_VIDEO_NAME', {
            aggregateCompositeIdentifier,
            languageCode: LanguageCode.English,
            text: englishTranslationOfVideoName,
        });
    });

    describe(`the index page`, () => {
        beforeEach(() => {
            cy.visit('/Resources/Videos');
        });

        it(`should display the label "Videos"`, () => {
            cy.contains(`Videos`);
        });

        describe(`when there is a single video`, () => {
            describe(`when the video has a title in both languages`, () => {
                it(`should display the title in both languages`, () => {
                    cy.contains(firstVideoName);

                    cy.contains(englishTranslationOfVideoName);
                });
            });
        });

        describe(`when there is a second video`, () => {
            before(() => {
                // Create a video with no translation of its name
                cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
                    aggregateCompositeIdentifier: secondMediaItemCompositeIdentifier,
                    titleEnglish: 'media item for the second video',
                    mimeType: MIMEType.mp4,
                    url: validUrl,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: secondMediaItemCompositeIdentifier,
                });

                cy.seedDataWithCommand(`CREATE_VIDEO`, {
                    aggregateCompositeIdentifier: compositeIdentifierOfVideoWithNoNameTranslation,
                    name: secondVideoName,
                    languageCodeForName: LanguageCode.Chilcotin,
                    mediaItemId: mediaItemCompositeIdentifier.id,
                    lengthMilliseconds: 720000,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: compositeIdentifierOfVideoWithNoNameTranslation,
                });
            });

            it(`should display the name of the second video`, () => {
                cy.contains(secondVideoName);
            });
        });

        describe(`the search filter`, () => {
            /**
             * Note that "ALL" is the label for the select menu item, but
             * `allProperties` is the value "behind the scenes".
             */
            describe(`when the search scope is "ALL"`, () => {
                const searchScope = `allProperties`;

                describe(`when the search matches both of the terms`, () => {
                    it(`should return both results`, () => {
                        cy.filterTable(searchScope, commonSearchTerms);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName);
                    });
                });

                describe(`when the search matches none of the terms`, () => {
                    const searchTextThatMatchesNoRows = 'zqrst';

                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, searchTextThatMatchesNoRows);

                        cy.contains(firstVideoName).should('not.exist');

                        cy.contains(secondVideoName).should('not.exist');
                    });
                });

                describe(`when the search matches only one of the terms`, () => {
                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, textUniqueToFirstVideoName);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName).should('not.exist');
                    });
                });
            });
        });
    });
});

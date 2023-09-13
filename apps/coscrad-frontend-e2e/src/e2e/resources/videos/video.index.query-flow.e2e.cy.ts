import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const commonSearchTerms = 'video name';

const textUniqueToFirstVideoName = `Dinosaur`;

const specialCharInFirstVideoName = 'ŝ';

const firstVideoName = `${textUniqueToFirstVideoName} ${commonSearchTerms} in Chilcotin ${specialCharInFirstVideoName}`;

const textUniqueToEnglishTranslationOfFirstVideoName = `to English`;

const englishTranslationOfVideoName = `Translation of the ${commonSearchTerms} ${textUniqueToEnglishTranslationOfFirstVideoName}`;

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

const compositeIdentifierOfVideoWithNoNameTranslationIntoEnglish =
    buildDummyAggregateCompositeIdentifier(AggregateType.video, 4);

const secondVideoName = `I only have a ${commonSearchTerms} in Chilcotin`;

const thirdMediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    5
);

const compositeIdentifierOfVideoWithNameInEnglishOnly = buildDummyAggregateCompositeIdentifier(
    AggregateType.video,
    6
);

const thirdVideoName = `I only have a ${commonSearchTerms} in English`;

// TODO Can we inject the config some how so that the `defaultLanguageCode` is set by this test?
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

        // Create a video with a name only in Chilcotin
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
            aggregateCompositeIdentifier:
                compositeIdentifierOfVideoWithNoNameTranslationIntoEnglish,
            name: secondVideoName,
            languageCodeForName: LanguageCode.Chilcotin,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: 720000,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier:
                compositeIdentifierOfVideoWithNoNameTranslationIntoEnglish,
        });

        // Create a third video with a name only in English
        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: thirdMediaItemCompositeIdentifier,
            titleEnglish: 'media item for the third video',
            mimeType: MIMEType.mp4,
            url: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: thirdMediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            aggregateCompositeIdentifier: compositeIdentifierOfVideoWithNameInEnglishOnly,
            name: thirdVideoName,
            // This video is only named in English
            languageCodeForName: LanguageCode.English,
            mediaItemId: thirdMediaItemCompositeIdentifier.id,
            lengthMilliseconds: 720000,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: compositeIdentifierOfVideoWithNameInEnglishOnly,
        });

        // TODO We should also test when a video has no name in `defaultLanguageCode` or `English`
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
            it(`should display the name of the second video`, () => {
                cy.contains(secondVideoName);
            });
        });

        describe(`the third video`, () => {
            it(`should be displayed in a row`, () => {
                cy.contains(thirdVideoName);
            });
        });

        describe(`the search filter`, () => {
            /**
             * Note that "ALL" is the label for the select menu item, but
             * `allProperties` is the value "behind the scenes".
             */
            describe(`when the search scope is "ALL"`, () => {
                const searchScope = `allProperties`;

                describe(`when the search matches all terms`, () => {
                    it(`should return all videos`, () => {
                        cy.filterTable(searchScope, commonSearchTerms);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName);

                        cy.contains(thirdVideoName);
                    });
                });

                describe(`when the search matches none of the terms`, () => {
                    const searchTextThatMatchesNoRows = 'zqrst';

                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, searchTextThatMatchesNoRows);

                        cy.contains(firstVideoName).should('not.exist');

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });

                describe(`when the search matches only one of the terms`, () => {
                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, textUniqueToFirstVideoName);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });

                describe(`when using the simulated keyboard`, () => {
                    describe(`when searching for the special character: ${specialCharInFirstVideoName}`, () => {
                        it(`should find the video with ${specialCharInFirstVideoName} in its name`, () => {
                            cy.filterTable(searchScope, specialCharInFirstVideoName);
                        });
                    });
                });
            });

            describe(`when the search scope is name`, () => {
                const searchScope = 'name';

                describe(`when the filter matches all of the terms with Chilcotin names`, () => {
                    it(`should return both results`, () => {
                        cy.filterTable(searchScope, commonSearchTerms);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName);

                        // This term has no name in Chilcotin
                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });

                describe(`when the search matches none of the terms`, () => {
                    const searchTextThatMatchesNoRows = 'zqrst';

                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, searchTextThatMatchesNoRows);

                        cy.contains(firstVideoName).should('not.exist');

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });

                describe(`when the search matches only one of the terms`, () => {
                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, textUniqueToFirstVideoName);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });
            });

            describe(`when the search scope is name (English)`, () => {
                const searchScope = 'nameEnglish';

                describe(`when the search text is empty`, () => {
                    it(`should return all videos`, () => {
                        cy.filterTable(searchScope, '');

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName);

                        cy.contains(thirdVideoName);
                    });
                });

                describe(`when the filter matches all of the terms with an English name`, () => {
                    it(`should return both results`, () => {
                        cy.filterTable(searchScope, commonSearchTerms);

                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName);
                    });
                });

                describe(`when the search matches none of the terms`, () => {
                    const searchTextThatMatchesNoRows = 'zqrst';

                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, searchTextThatMatchesNoRows);

                        cy.contains(firstVideoName).should('not.exist');

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });

                describe(`when the search matches only one of the terms`, () => {
                    it(`should return the expected result`, () => {
                        cy.filterTable(searchScope, textUniqueToEnglishTranslationOfFirstVideoName);

                        /**
                         * note that the first video has a translation into
                         * English, whereas the second does not.
                         **/
                        cy.contains(firstVideoName);

                        cy.contains(secondVideoName).should('not.exist');

                        cy.contains(thirdVideoName).should('not.exist');
                    });
                });
            });
        });
    });
});

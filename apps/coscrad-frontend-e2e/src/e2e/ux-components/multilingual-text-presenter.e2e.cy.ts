import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

const mediaItemName = 'media item for the video';

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    2
);

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

const videoNameInEnglish = `Video 1`;

const videoWithEnglishNameAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.video,
    1
);

const { id: videoId } = videoWithEnglishNameAggregateCompositeIdentifier;

const videoDetailRoute = `/Resources/Videos/${videoId}`;

const videoNameTranslationInDefaultLanguage = `Video 1 (language)`;

const videoNameInLanguage = `Video 2 (language orig)`;

const videoNameInEnglishTranslation = `Video 2 (english translation)`;

const videoWithLanguageNameAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.video,
    3
);

const { id: videoWithLanguageNameId } = videoWithLanguageNameAggregateCompositeIdentifier;

const videoWithLanguageNameDetailRoute = `/Resources/Videos/${videoWithLanguageNameId}`;

describe('Multilingual Text Presenter', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(5);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            titleEnglish: mediaItemName,
            mimeType: MIMEType.mp4,
            url: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });
    });

    describe(`when the video has an original name in English`, () => {
        before(() => {
            cy.seedDataWithCommand(`CREATE_VIDEO`, {
                aggregateCompositeIdentifier: videoWithEnglishNameAggregateCompositeIdentifier,
                name: videoNameInEnglish,
                languageCodeForName: LanguageCode.English,
                mediaItemId: mediaItemCompositeIdentifier.id,
                lengthMilliseconds: 720000,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: videoWithEnglishNameAggregateCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(videoDetailRoute);
        });

        describe(`with no translations`, () => {
            it('should display the English text as the primary item', () => {
                cy.getByDataAttribute(
                    'multilingual-text-main-text-item-without-translations'
                ).contains(videoNameInEnglish);
            });
        });

        describe(`with a translation in the default language`, () => {
            before(() => {
                cy.seedDataWithCommand(`TRANSLATE_VIDEO_NAME`, {
                    aggregateCompositeIdentifier: videoWithEnglishNameAggregateCompositeIdentifier,
                    languageCode: LanguageCode.Haida,
                    text: videoNameTranslationInDefaultLanguage,
                });
            });

            it(`should display the default language as the primary item`, () => {
                cy.getByDataAttribute(
                    'multilingual-text-main-text-item-with-translations'
                ).contains(videoNameTranslationInDefaultLanguage);
            });

            it(`should display the English translation in the translation items`, () => {
                cy.getByDataAttribute('multilingual-text-translations').contains(
                    videoNameInEnglish
                );
            });
        });
    });

    describe(`when the video has an original name in the default language`, () => {
        before(() => {
            cy.seedDataWithCommand(`CREATE_VIDEO`, {
                aggregateCompositeIdentifier: videoWithLanguageNameAggregateCompositeIdentifier,
                name: videoNameInLanguage,
                languageCodeForName: LanguageCode.Haida,
                mediaItemId: mediaItemCompositeIdentifier.id,
                lengthMilliseconds: 720000,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: videoWithLanguageNameAggregateCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(videoWithLanguageNameDetailRoute);
        });

        describe(`with no English translation`, () => {
            it(`should display the default language text as the primary item`, () => {
                cy.getByDataAttribute(
                    'multilingual-text-main-text-item-without-translations'
                ).contains(videoNameInLanguage);
            });
        });

        describe(`with an English translation`, () => {
            before(() => {
                cy.seedDataWithCommand(`TRANSLATE_VIDEO_NAME`, {
                    aggregateCompositeIdentifier: videoWithLanguageNameAggregateCompositeIdentifier,
                    languageCode: LanguageCode.English,
                    text: videoNameInEnglishTranslation,
                });
            });

            it(`should display the default language text as the primary item`, () => {
                cy.getByDataAttribute(
                    'multilingual-text-main-text-item-with-translations'
                ).contains(videoNameInLanguage);
            });

            it(`should display the English translation in the translation items`, () => {
                cy.getByDataAttribute('multilingual-text-translations').contains(
                    videoNameInEnglishTranslation
                );
            });
        });
    });
});

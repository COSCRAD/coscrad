import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { FailedToUpdateDigitalTextPageError } from '../errors';
import { CannotOverwritePageContentError } from '../errors/cannot-overwrite-page-content.error';
import { MissingPageError } from '../errors/missing-page.error';
import DigitalTextPage from './digital-text-page.entity';
import { DigitalText } from './digital-text.entity';

const existingPageIdentifier = '5v';

const textContent = 'Hello world and hello universe!';

const languageCode = LanguageCode.Haida;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [
        new DigitalTextPage({
            identifier: existingPageIdentifier,
            audio: new MultilingualAudio({
                items: [],
            }),
        }),
    ],
});

describe(`DigitalText.addContentToPage`, () => {
    describe(`when the page exists and does not yet have content`, () => {
        it(`should return a new DigitalText with the appropriate updates`, () => {
            const updateResult = existingDigitalText.addContentToPage(
                existingPageIdentifier,
                textContent,
                languageCode
            );

            expect(updateResult).toBeInstanceOf(DigitalText);

            // We have already asserted that we didn't get an error
            const updatedDigitalText = updateResult as DigitalText;

            expect(updatedDigitalText).not.toBe(existingDigitalText);

            const pageSearchResult = updatedDigitalText.getPage(existingPageIdentifier);

            expect(pageSearchResult).not.toBe(NotFound);

            const updatedPage = pageSearchResult as DigitalTextPage;

            expect(updatedPage.hasContent()).toBe(true);
        });
    });

    describe(`when the page does not exist`, () => {
        it(`should return the appropriate errors`, () => {
            const idOfPageThatDoesntExist = 'BOGUS';

            const result = existingDigitalText.addContentToPage(
                idOfPageThatDoesntExist,
                textContent,
                languageCode
            );

            assertErrorAsExpected(
                result,
                new FailedToUpdateDigitalTextPageError(
                    idOfPageThatDoesntExist,
                    existingDigitalText.id,
                    [new MissingPageError(idOfPageThatDoesntExist, existingDigitalText.id)]
                )
            );
        });
    });

    describe(`when the page already has content`, () => {
        it(`should return the approprate error`, () => {
            const digitalTextWithContentForTargetPage = existingDigitalText.addContentToPage(
                existingPageIdentifier,
                textContent,
                languageCode
            ) as DigitalText;

            const result = digitalTextWithContentForTargetPage.addContentToPage(
                existingPageIdentifier,
                'New content',
                languageCode
            );

            const existingPage = digitalTextWithContentForTargetPage.getPage(
                existingPageIdentifier
            ) as DigitalTextPage; // and not `NotFound`

            assertErrorAsExpected(
                result,
                new FailedToUpdateDigitalTextPageError(
                    existingPageIdentifier,
                    existingDigitalText.id,
                    [
                        new CannotOverwritePageContentError(
                            existingPageIdentifier,
                            existingPage.getContent() as MultilingualText // and not `NotFound`
                        ),
                    ]
                )
            );
        });
    });

    describe(`when the input is ill formed`, () => {
        describe(`when the page identifier is an empty string`, () => {
            it(`should return the appropriate error`, () => {
                const result = existingDigitalText.addContentToPage('', textContent, languageCode);

                // This is actually a "cannot add content for missing page"
                expect(result).toBeInstanceOf(InternalError);
            });
        });

        describe(`when the text content for the page is an empty string`, () => {
            it(`should return the appropriate error`, () => {
                const result = existingDigitalText.addContentToPage(
                    existingPageIdentifier,
                    '',
                    languageCode
                );

                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(existingDigitalText.getCompositeIdentifier(), [])
                );
            });
        });
    });
});

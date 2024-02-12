import { DigitalText } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotAddPhotographForMissingPageError } from '../errors';
import { CannotOverwritePhotographForPageError } from '../errors/cannot-overwrite-photograph-for-page.error';
import DigitalTextPage from './digital-text-page.entity';

const targetPageIdentifier = 'ix';

const photographId = buildDummyUuid(95);

const existingPageWithNoPhotograph = DigitalTextPage.buildEmpty({
    identifier: targetPageIdentifier,
});

const digitalTextWithoutPhotographOnPage = getValidAggregateInstanceForTest(
    AggregateType.digitalText
).clone({
    pages: [existingPageWithNoPhotograph],
});

describe(`DigitalText.addPhotographToPage`, () => {
    describe(`when the update is valid`, () => {
        it(`should add the photograph to the page`, () => {
            const result = digitalTextWithoutPhotographOnPage.addPhotographToPage(
                targetPageIdentifier,
                photographId
            );

            expect(result).toBeInstanceOf(DigitalText);

            const updatedDigitalText = result as DigitalText;

            const photographIdSearchResult =
                updatedDigitalText.getPhotographForPage(targetPageIdentifier);

            expect(photographIdSearchResult).toBe(photographId);
        });
    });

    describe(`when the update is invalid`, () => {
        describe(`when the page already has a photograph`, () => {
            it(`should return the expected error`, () => {
                const existingPhotographId = buildDummyUuid(456);

                const result = digitalTextWithoutPhotographOnPage
                    .clone({
                        pages: [
                            existingPageWithNoPhotograph.clone({
                                photographId: existingPhotographId,
                            }),
                        ],
                    })
                    .addPhotographToPage(targetPageIdentifier, photographId);

                assertErrorAsExpected(
                    result,
                    new CannotOverwritePhotographForPageError(
                        targetPageIdentifier,
                        photographId,
                        existingPhotographId
                    )
                );
            });
        });

        describe(`when the page does not exist`, () => {
            it(`should fail with the expected error`, () => {
                const result = digitalTextWithoutPhotographOnPage
                    .clone({
                        pages: [],
                    })
                    .addPhotographToPage(targetPageIdentifier, photographId);

                assertErrorAsExpected(
                    result,
                    new CannotAddPhotographForMissingPageError(targetPageIdentifier, photographId)
                );
            });
        });

        describe(`when the page identifier is an empty string`, () => {
            it(`should return an error`, () => {
                const result = digitalTextWithoutPhotographOnPage.addPhotographToPage(
                    targetPageIdentifier,
                    ''
                );

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});

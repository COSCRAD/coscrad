import { DigitalText } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotOverrideCoverPhotographError } from '../errors';

const photographId = buildDummyUuid(102);

const existingDigitalTextWithNoPhotograph = getValidAggregateInstanceForTest(
    AggregateType.digitalText
).clone({
    coverPhotographId: undefined,
});

const existingDigitalTextWithAPhotograph = existingDigitalTextWithNoPhotograph.clone({
    coverPhotographId: photographId,
});

describe(`DigitalText.AddCoverPhotograph`, () => {
    describe(`when the update is valid`, () => {
        it(`should add the cover photograph`, () => {
            const result = existingDigitalTextWithNoPhotograph.addCoverPhotograph(photographId);

            expect(result).toBeInstanceOf(DigitalText);

            const updatedDigitalText = result as DigitalText;

            const photographIdSearchResult = updatedDigitalText.coverPhotographId;

            expect(photographIdSearchResult).toBe(photographId);
        });
    });

    describe(`when the update is invalid`, () => {
        describe(`when the digital text already has a cover photograph`, () => {
            it(`should return the expected error`, () => {
                const existingCoverPhotographId = buildDummyUuid(123);

                const result = existingDigitalTextWithAPhotograph
                    .clone({
                        coverPhotographId: existingCoverPhotographId,
                    })
                    .addCoverPhotograph(photographId);

                assertErrorAsExpected(result, new CannotOverrideCoverPhotographError(photographId));
            });
        });
    });
});

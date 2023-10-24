import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvariantValidationError from '../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../types/AggregateType';
import { DigitalText, PageIdentifier } from './entities';
import DigitalTextPage from './entities/digital-text-page.entity';
import { CannotAddPageWithDuplicateIdentifierError } from './errors/cannot-add-page-with-duplicate-identifier.error';

const existingDigitalTextWithPages = getValidAggregateInstanceForTest(
    AggregateType.digitalText
).clone({
    pages: [
        new DigitalTextPage({
            identifier: 'IV',
        }),
        new DigitalTextPage({
            identifier: 'V',
        }),
    ],
});

const newDuplicatePageIdentifier: PageIdentifier = 'IV';

const newValidPageIdentifier: PageIdentifier = '23';

describe('When a new page is added to an existing digital text', () => {
    describe(`When there is no duplicate page identifier`, () => {
        it(`should succeed`, () => {
            const result = existingDigitalTextWithPages.addPage(newValidPageIdentifier);

            expect(result).not.toBe(InternalError);

            const digitalTextWithPageAdded = result as DigitalText;

            expect(digitalTextWithPageAdded.hasPage(newValidPageIdentifier)).toBe(true);
        });
    });

    describe(`When there is a duplicate page identifier`, () => {
        it(`should return the expected error`, () => {
            const result = existingDigitalTextWithPages.addPage(newDuplicatePageIdentifier);

            const expectedError = new CannotAddPageWithDuplicateIdentifierError(
                existingDigitalTextWithPages.id,
                newDuplicatePageIdentifier
            );

            assertErrorAsExpected(result, expectedError);
        });
    });

    /**
     * Note that this is just a sanity check that invariant validation "has our back"
     * on ill-formed.
     */
    describe(`When the page identifier is an empty string`, () => {
        const result = existingDigitalTextWithPages.addPage('');

        assertErrorAsExpected(
            result,
            new InvariantValidationError(existingDigitalTextWithPages.getCompositeIdentifier(), [])
        );
    });
});

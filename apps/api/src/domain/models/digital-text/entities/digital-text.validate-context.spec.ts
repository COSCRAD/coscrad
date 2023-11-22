import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../domainModelValidators/Valid';
import { EmptyPageRangeContextError } from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/page-range-context-has-superfluous-page-identifiers.error';
import { AggregateType } from '../../../types/AggregateType';
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import DigitalTextPage from './digital-text-page.entity';
import { PageIdentifier } from './types';

const digitalTextWithNoPages = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [],
});

const targetPageIdentifiers: PageIdentifier[] = ['1', '2', '5'];

const otherPages: PageIdentifier[] = ['A.1', 'A.2'];

const digitalTextWithPages = digitalTextWithNoPages.clone({
    pages: [...targetPageIdentifiers, ...otherPages].map(
        (identifier) =>
            new DigitalTextPage({
                identifier,
                content: buildMultilingualTextWithSingleItem(`content for page: ${identifier}`),
            })
    ),
});

const pageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    // TODO ensure there is an invariant rule that prevents this from being empty
    pageIdentifiers: targetPageIdentifiers,
});

describe(`DigitalText.validateContext`, () => {
    describe(`when the page range context is valid`, () => {
        it(`should return Valid`, () => {
            const result = digitalTextWithPages.validateContext(pageRangeContext);

            expect(result).toBe(Valid);
        });
    });

    describe(`when there is a page in the range that is not in the digital text`, () => {
        const missingPageIdentifier = 'nope';

        it(`should return the expected error`, () => {
            const result = digitalTextWithPages.validateContext(
                pageRangeContext.clone({
                    pageIdentifiers: [missingPageIdentifier],
                })
            );

            assertErrorAsExpected(
                result,
                new PageRangeContextHasSuperfluousPageIdentifiersError(
                    [missingPageIdentifier],
                    digitalTextWithPages.getCompositeIdentifier()
                )
            );
        });
    });

    describe(`when the page range context is empty`, () => {
        it(`should return the expected error`, () => {
            const result = digitalTextWithNoPages.validateContext(
                pageRangeContext.clone({
                    pageIdentifiers: [],
                })
            );

            assertErrorAsExpected(result, new EmptyPageRangeContextError());
        });
    });
});

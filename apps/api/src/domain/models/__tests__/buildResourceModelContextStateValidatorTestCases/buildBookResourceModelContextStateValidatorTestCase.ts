import PageRangeContextHasSuperfluousPageIdentifiersError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/PageRangeContextHasSuperfluousPageIdentifiersError';
import { resourceTypes } from '../../../types/resourceTypes';
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.book);

const validBook = validCases[0].resource;

const bogusPageId = 'BOGUS-PAGE-IDENTIFIER';

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(resourceTypes.book),
    {
        description: `The context targets a page identifier with no corresponding book page`,
        resource: validBook,
        context: new PageRangeContext({
            type: EdgeConnectionContextType.pageRange,
            pageIdentifiers: [...validBook.pages.map(({ identifier }) => identifier), bogusPageId],
        }),
        expectedError: new PageRangeContextHasSuperfluousPageIdentifiersError(
            [bogusPageId],
            validBook.getCompositeIdentifier()
        ),
    },
];

export default () => ({
    validCases,
    invalidCases,
});

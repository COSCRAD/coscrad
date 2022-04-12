import { PartialDTO } from '../../../../../types/partial-dto';
import EmptyPageRangeError from '../../../../domainModelValidators/errors/context/EmptyPageRangeError';
import { PageRangeContext } from '../../../../models/context/page-range/page-range.context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { pageRangeContextValidator } from '../../../contextValidators/pageRangeContext.validator';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: PartialDTO<PageRangeContext> = {
    type: EdgeConnectionContextType.pageRange,
    pages: ['1', '2', '4', 'vii'],
};

const topLevelErrorFactory = createInvalidContextErrorFactory(EdgeConnectionContextType.pageRange);

export const buildPageRangeTestCase = (): ContextModelValidatorTestCase<PageRangeContext> => ({
    contextType: EdgeConnectionContextType.pageRange,
    validator: pageRangeContextValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'the context is empty',
            invalidDTO: null,
            expectedError: new NullOrUndefinedEdgeConnectionContextDTOError(
                EdgeConnectionContextType.pageRange
            ),
        },
        {
            description: 'no pages are specified',
            invalidDTO: {
                ...validDTO,
                pages: [],
            },
            expectedError: topLevelErrorFactory([new EmptyPageRangeError()]),
        },
    ],
});

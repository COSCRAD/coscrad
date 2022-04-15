import { PageIdentifier } from 'apps/api/src/domain/models/book/entities/types/PageIdentifier';
import { PartialDTO } from '../../../../../types/partial-dto';
import EmptyPageRangeError from '../../../../domainModelValidators/errors/context/EmptyPageRangeError';
import { PageRangeContext } from '../../../../models/context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { pageRangeContextValidator } from '../../../contextValidators/pageRangeContext.validator';
import DuplicatePageIdentifierError from '../../../errors/context/DuplicatePageIdentifierError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: PartialDTO<PageRangeContext> = {
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1', '2', '4', 'vii'],
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
            description: 'no page identifiers are specified',
            invalidDTO: {
                ...validDTO,
                pageIdentifiers: [],
            },
            expectedError: topLevelErrorFactory([new EmptyPageRangeError()]),
        },
        {
            description: 'the page identifiers include duplicates',
            invalidDTO: {
                ...validDTO,
                // TODO remove cast
                pageIdentifiers: [
                    ...(validDTO.pageIdentifiers as PageIdentifier[]),
                    validDTO.pageIdentifiers[0],
                    validDTO.pageIdentifiers[3],
                ],
            },
            expectedError: topLevelErrorFactory([
                new DuplicatePageIdentifierError([
                    validDTO.pageIdentifiers[0],
                    validDTO.pageIdentifiers[3],
                ]),
            ]),
        },
    ],
});

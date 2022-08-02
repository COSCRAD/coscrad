import { InternalError } from '../../../lib/errors/InternalError';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/PageRangeContextHasSuperfluousPageIdentifiersError';
import { Valid } from '../../domainModelValidators/Valid';
import getValidResourceInstanceForTest from '../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { AggregateType } from '../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { dummyUuid } from '../__tests__/utilities/dummyUuid';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from './edge-connection.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { PageRangeContext } from './page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from './types/EdgeConnectionContextType';

// const testData = buildTestData();

const dummyBook = getValidResourceInstanceForTest(ResourceType.book).clone({
    pages: [
        {
            identifier: 'ix',
            text: 'bla bla bla',
        },
    ],
});

const validPageRangeContextForDummyBook = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: dummyBook.pages.map(({ identifier }) => identifier),
});

const dummySong = getValidResourceInstanceForTest(ResourceType.song);

const generalContext = new GeneralContext();

const validSongFromMember: EdgeConnectionMember = {
    role: EdgeConnectionMemberRole.from,
    compositeIdentifier: dummySong.getCompositeIdentifier(),
    context: generalContext,
};

const validDualConnection: EdgeConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    members: [
        {
            role: EdgeConnectionMemberRole.to,
            compositeIdentifier: dummyBook.getCompositeIdentifier(),
            context: validPageRangeContextForDummyBook,
        },
        validSongFromMember,
    ],
    id: dummyUuid,
    note: 'this dual connection is legit',
});

const validExternalStateForDualConnection: InMemorySnapshot = buildInMemorySnapshot({
    resources: {
        book: [dummyBook],
        song: [dummySong],
    },
    // Note that we don't add the connection, as we want its **external state**
});

/**
 *
 * Note that the expeccted error that you provide is the source of truth
 * for the depth to which you want to confirm internal errors. This helper
 * only asserts that the result is an error and its inner errors match those
 * specified.
 */
const assertExpectedError = (result: unknown, expectedError: InternalError) => {
    expect(result).toBeInstanceOf(InternalError);

    const error = result as InternalError;

    expect(error).toEqual(expectedError);

    const { innerErrors } = error;

    if (innerErrors.length > 0)
        innerErrors.forEach((innerError, index) =>
            assertExpectedError(innerError, expectedError.innerErrors[index])
        );
};

describe('EdgeConnection.validateExternalState', () => {
    describe('when the edge connection type is "dual"', () => {
        describe('when the external state is valid', () => {
            it('should return Valid', () => {
                const result = validDualConnection.validateExternalState(
                    validExternalStateForDualConnection
                );

                expect(result).toBe(Valid);
            });
        });

        describe('when there is another edge connection with the same ID', () => {
            it('should return the expected error', () => {
                const result = validDualConnection.validateExternalState({
                    ...validExternalStateForDualConnection,
                    connections: [
                        validDualConnection.clone({
                            // id: same!
                        }),
                    ],
                });

                assertExpectedError(
                    result,
                    new InvalidExternalStateError([
                        new AggregateIdAlreadyInUseError(
                            validDualConnection.getCompositeIdentifier()
                        ),
                    ])
                );
            });
        });

        describe(`when a member's context is inconsistent with its resource's state`, () => {
            it('should return the expected error', () => {
                const invalidPageIdentifiers = dummyBook.pages.map(
                    ({ identifier }) => `BOGUS-PAGE-ID_-${identifier}`
                );

                const result = validDualConnection
                    .clone({
                        members: [
                            validSongFromMember,
                            {
                                role: EdgeConnectionMemberRole.to,
                                compositeIdentifier: dummyBook.getCompositeIdentifier(),
                                context: new PageRangeContext({
                                    type: EdgeConnectionContextType.pageRange,
                                    pageIdentifiers: invalidPageIdentifiers,
                                }),
                            },
                        ],
                    })
                    .validateExternalState(validExternalStateForDualConnection);

                const epxectedError = new InvalidExternalStateError([
                    new PageRangeContextHasSuperfluousPageIdentifiersError(
                        invalidPageIdentifiers,
                        dummyBook.getCompositeIdentifier()
                    ),
                ]);

                assertExpectedError(result, epxectedError);
            });
        });
    });
});

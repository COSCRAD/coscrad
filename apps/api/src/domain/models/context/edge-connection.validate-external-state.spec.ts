import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../types/DTO';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/PageRangeContextHasSuperfluousPageIdentifiersError';
import { Valid } from '../../domainModelValidators/Valid';
import { AggregateType } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
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

const dummyBook = getValidAggregateInstanceForTest(ResourceType.book).clone({
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

const dummySong = getValidAggregateInstanceForTest(ResourceType.song);

const generalContext = new GeneralContext();

const validSongFromMemberDTO: DTO<EdgeConnectionMember> = {
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
        validSongFromMemberDTO,
    ],
    id: dummyUuid,
    note: 'this dual connection is legit',
});

const validExternalStateForDualConnection: InMemorySnapshot = new DeluxeInMemoryStore({
    book: [dummyBook],
    song: [dummySong],
}).fetchFullSnapshotInLegacyFormat();

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
                    note: [
                        validDualConnection.clone({
                            // id: same!
                        }),
                    ],
                });

                assertErrorAsExpected(
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
                            validSongFromMemberDTO,
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

                const expectedError = new InvalidExternalStateError([
                    new PageRangeContextHasSuperfluousPageIdentifiersError(
                        invalidPageIdentifiers,
                        dummyBook.getCompositeIdentifier()
                    ),
                ]);

                assertErrorAsExpected(result, expectedError);
            });
        });
    });
});

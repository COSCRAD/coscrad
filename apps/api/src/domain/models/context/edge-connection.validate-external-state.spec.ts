import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../types/DTO';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../domainModelValidators/Valid';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/page-range-context-has-superfluous-page-identifiers.error';
import { AggregateType } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { dummyUuid } from '../__tests__/utilities/dummyUuid';
import DigitalTextPage from '../digital-text/entities/digital-text-page.entity';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { MultilingualAudio } from '../shared/multilingual-audio/multilingual-audio.entity';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from './edge-connection.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { PageRangeContext } from './page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from './types/EdgeConnectionContextType';

const dummydigitalText = getValidAggregateInstanceForTest(ResourceType.digitalText).clone({
    pages: [
        new DigitalTextPage({
            identifier: 'ix',
            content: buildMultilingualTextWithSingleItem('bla bla bla', LanguageCode.English),
            audio: new MultilingualAudio({
                items: [],
            }),
        }),
    ],
});

const validPageRangeContextForDummyDigitalText = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: dummydigitalText.pages.map(({ identifier }) => identifier),
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
            compositeIdentifier: dummydigitalText.getCompositeIdentifier(),
            context: validPageRangeContextForDummyDigitalText,
        },
        validSongFromMemberDTO,
    ],
    id: dummyUuid,
    note: buildMultilingualTextWithSingleItem(
        'this dual connection is legit',
        LanguageCode.English
    ),
});

const validExternalStateForDualConnection: InMemorySnapshot = new DeluxeInMemoryStore({
    digitalText: [dummydigitalText],
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
                const invalidPageIdentifiers = dummydigitalText.pages.map(
                    ({ identifier }) => `BOGUS-PAGE-ID_-${identifier}`
                );

                const result = validDualConnection
                    .clone({
                        members: [
                            validSongFromMemberDTO,
                            {
                                role: EdgeConnectionMemberRole.to,
                                compositeIdentifier: dummydigitalText.getCompositeIdentifier(),
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
                        dummydigitalText.getCompositeIdentifier()
                    ),
                ]);

                assertErrorAsExpected(result, expectedError);
            });
        });
    });
});

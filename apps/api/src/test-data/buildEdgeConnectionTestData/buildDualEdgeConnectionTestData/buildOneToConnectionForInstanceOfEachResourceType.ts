import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { MultilingualAudio } from '../../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';

// type is the same for all, use map to mix this in below
const dtosWithoutTypeProperty: DTO<
    Omit<EdgeConnection, 'type' | 'connectionType' | 'audioForNote'>
>[] = [
    {
        id: '3101',
        note: buildMultilingualTextWithSingleItem(
            'this selection from the media item portrays the events in the text',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.mediaItem,
                    id: '1',
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPointMilliseconds: 300,
                        outPointMilliseconds: 1800,
                    },
                }),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '951',
                },
                context: new PageRangeContext({
                    pageIdentifiers: ['1'],
                    type: EdgeConnectionContextType.pageRange,
                }),
            },
        ],
    },
    {
        id: '3102',
        note: buildMultilingualTextWithSingleItem(
            'this library book has the lyrics from the song, but we do not have access to the book',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.bibliographicCitation,
                    id: '1',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '1',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3103',
        note: buildMultilingualTextWithSingleItem(
            'this term is used in the song',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.term,
                    id: '511',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '1',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3104',
        note: buildMultilingualTextWithSingleItem('this video uses the song', LanguageCode.English),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.video,
                    id: '223',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '1',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3105',
        note: buildMultilingualTextWithSingleItem(
            'this vocabulary list is relevant to learning the song lyrics',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.vocabularyList,
                    id: '4567',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '1',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3106',
        note: buildMultilingualTextWithSingleItem(
            'this is an alternative reading of the book',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.audioItem,
                    id: '110',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '951',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3108',
        note: buildMultilingualTextWithSingleItem(
            'this song is mentioned on this page',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '1',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '951',
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }),
            },
        ],
    },
    {
        id: '3109',
        note: buildMultilingualTextWithSingleItem(
            'this media item is mentioned in the text',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.mediaItem,
                    id: '1',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '951',
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }),
            },
        ],
    },
    {
        id: '3110',
        note: buildMultilingualTextWithSingleItem(
            'this media item is mentioned in the text',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.mediaItem,
                    id: '1',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '951',
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }),
            },
        ],
    },
    {
        id: '3111',
        note: buildMultilingualTextWithSingleItem(
            'this song is mentioned in the digital representation of a text',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '950',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.song,
                    id: '2',
                },
                context: new GeneralContext(),
            },
        ],
    },
];

/**
 * We split up seeding our test \ demonstration data for `Edge Connections` into
 * several files to make maintaining a representative set of test data easier.
 * Note that there are checks in `validateTestData.spec.ts` that will enforce
 * that we add a variety of test data for each new `ResourceType` and
 * `EdgeConnectionContextType`.
 */
export default (): EdgeConnection[] =>
    dtosWithoutTypeProperty.map(
        (partialDTO) =>
            new EdgeConnection({
                ...partialDTO,
                connectionType: EdgeConnectionType.dual,
                type: AggregateType.note,
                audioForNote: MultilingualAudio.buildEmpty(),
            })
    );

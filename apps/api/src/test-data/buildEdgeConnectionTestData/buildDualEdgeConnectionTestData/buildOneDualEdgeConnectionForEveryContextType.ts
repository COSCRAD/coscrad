import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';

export default (): EdgeConnection[] =>
    [
        {
            id: '3301',
            note: buildMultilingualTextWithSingleItem(
                'this term appears on this page of the digital text',
                LanguageCode.English
            ),
            members: [
                {
                    role: EdgeConnectionMemberRole.to,
                    compositeIdentifier: {
                        type: ResourceType.digitalText,
                        id: '2',
                    },
                    context: new PageRangeContext({
                        type: EdgeConnectionContextType.pageRange,
                        pageIdentifiers: ['1'],
                    }),
                },
                {
                    role: EdgeConnectionMemberRole.from,
                    compositeIdentifier: {
                        type: ResourceType.term,
                        id: '512',
                    },
                    context: new GeneralContext(),
                },
            ],
        },
        {
            id: '3302',
            note: buildMultilingualTextWithSingleItem(
                'this vocabulary list should be used in preparation for studying the video',
                LanguageCode.English
            ),
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
                        type: ResourceType.vocabularyList,
                        id: '2',
                    },
                    context: new GeneralContext(),
                },
            ],
        },
        {
            id: '3303',
            note: buildMultilingualTextWithSingleItem(
                'this vocabulary list should be used in preparation for studying this audio interview',
                LanguageCode.English
            ),
            members: [
                {
                    role: EdgeConnectionMemberRole.to,
                    compositeIdentifier: {
                        type: ResourceType.vocabularyList,
                        id: '1',
                    },
                    context: new GeneralContext(),
                },
                {
                    role: EdgeConnectionMemberRole.from,
                    compositeIdentifier: {
                        type: ResourceType.audioItem,
                        id: '111',
                    },
                    context: new GeneralContext(),
                },
            ],
        },
        {
            id: '3304',
            note: buildMultilingualTextWithSingleItem(
                'this media item was extracted from the video',
                LanguageCode.English
            ),
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
                        type: ResourceType.mediaItem,
                        id: '1',
                    },
                    context: new GeneralContext(),
                },
            ],
        },
        {
            id: '3305',
            note: buildMultilingualTextWithSingleItem(
                'this video is loosely based on the digital text',
                LanguageCode.English
            ),
            members: [
                {
                    role: EdgeConnectionMemberRole.to,
                    compositeIdentifier: {
                        type: ResourceType.digitalText,
                        id: '1',
                    },
                    context: new GeneralContext(),
                },
                {
                    role: EdgeConnectionMemberRole.from,
                    compositeIdentifier: {
                        type: ResourceType.video,
                        id: '223',
                    },
                    context: new GeneralContext(),
                },
            ],
        },
    ].map(
        (partialDTO) =>
            new EdgeConnection({
                ...partialDTO,
                connectionType: EdgeConnectionType.dual,
                type: AggregateType.note,
            })
    );

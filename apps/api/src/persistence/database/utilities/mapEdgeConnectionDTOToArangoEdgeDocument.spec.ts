import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { MultilingualAudio } from '../../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import mapEdgeConnectionDTOToArangoEdgeDocument from './mapEdgeConnectionDTOToArangoEdgeDocument';

type TestCase = {
    description: string;
    input: DTO<EdgeConnection>;
    expectedResult: ArangoEdgeDocument;
};

const audioItemId = buildDummyUuid(555);

const languageCodeForAudio = LanguageCode.English;

const selfEdgeConnection = new EdgeConnection({
    id: '123',
    connectionType: EdgeConnectionType.self,
    type: AggregateType.note,
    note: buildMultilingualTextWithSingleItem('These pages are about bears', LanguageCode.English),
    members: [
        {
            role: EdgeConnectionMemberRole.self,
            compositeIdentifier: {
                id: '2',
                type: ResourceType.digitalText,
            },
            context: new PageRangeContext({
                type: EdgeConnectionContextType.pageRange,
                pageIdentifiers: ['1'],
            }).toDTO(),
        },
    ],
    audioForNote: MultilingualAudio.buildEmpty().addAudio(
        audioItemId,
        languageCodeForAudio
    ) as MultilingualAudio,
}).toDTO();

const validPageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1', '2', '3', 'iv'],
});

const buildValidBookEdgeConnectionMember = (
    role: EdgeConnectionMemberRole
): DTO<EdgeConnectionMember<PageRangeContext>> => ({
    compositeIdentifier: {
        type: ResourceType.digitalText,
        id: '1123',
    },
    role,
    context: validPageRangeContext,
});

const validTimeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,

    timeRange: {
        inPointMilliseconds: 3789,
        outPointMilliseconds: 3890,
    },
});

const buildValidTranscribedAudioConnectionMember = (
    role: EdgeConnectionMemberRole
): DTO<EdgeConnectionMember<TimeRangeContext>> => ({
    compositeIdentifier: {
        type: ResourceType.audioItem,
        id: '15',
    },
    role,
    context: validTimeRangeContext,
});

const dualEdgeConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    members: [
        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
    ],
    id: '123',
    note: buildMultilingualTextWithSingleItem('These are both about bears', LanguageCode.English),
    audioForNote: MultilingualAudio.buildEmpty().addAudio(
        audioItemId,
        languageCodeForAudio
    ) as MultilingualAudio,
}).toDTO();

const testCases: TestCase[] = [
    {
        description: 'when given a self edge connection',
        input: selfEdgeConnection,
        expectedResult: {
            _from: 'digital_texts/2',
            _to: 'digital_texts/2',
            _key: '123',
            connectionType: EdgeConnectionType.self,
            eventHistory: [],
            note: buildMultilingualTextWithSingleItem(
                'These pages are about bears',
                LanguageCode.English
            ),
            audioForNote: MultilingualAudio.buildEmpty().addAudio(
                audioItemId,
                languageCodeForAudio
            ) as MultilingualAudio,
            type: AggregateType.note,
            members: [
                {
                    role: EdgeConnectionMemberRole.self,
                    context: selfEdgeConnection.members[0].context,
                },
            ],
        },
    },
    {
        description: 'when given a dual edge connection',
        input: dualEdgeConnection,
        expectedResult: {
            _from: 'digital_texts/1123',
            _to: 'audio_items/15',
            _key: '123',
            connectionType: EdgeConnectionType.dual,
            eventHistory: [],
            note: buildMultilingualTextWithSingleItem(
                'These are both about bears',
                LanguageCode.English
            ),
            audioForNote: MultilingualAudio.buildEmpty().addAudio(
                audioItemId,
                languageCodeForAudio
            ) as MultilingualAudio,
            type: AggregateType.note,
            members: [
                {
                    role: EdgeConnectionMemberRole.from,
                    context: dualEdgeConnection.members[0].context,
                },
                {
                    role: EdgeConnectionMemberRole.to,
                    context: dualEdgeConnection.members[1].context,
                },
            ],
        },
    },
];

describe(`mapEdgeConnectionMembersToArangoDocumentDirectionAttributes`, () =>
    testCases.forEach(({ description, input, expectedResult }) => {
        describe(description, () => {
            it('should return the expected result', () => {
                // ACT
                const result = mapEdgeConnectionDTOToArangoEdgeDocument(input);

                expect(result).toEqual(expectedResult);
            });
        });
    }));

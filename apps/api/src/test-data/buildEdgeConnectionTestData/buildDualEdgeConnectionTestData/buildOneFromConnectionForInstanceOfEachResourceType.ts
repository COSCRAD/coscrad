import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { MultilingualAudio } from '../../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';
import { buildTestVocabularyListEdgeConnectionMember } from '../../buildVocabularyListTestData';

// type is the same for all, use map to mix this in below
const dtosWithoutTypeProperty: DTO<
    Omit<EdgeConnection, 'type' | 'connectionType' | 'audioForNote'>
>[] = [
    {
        id: '3001',
        note: buildMultilingualTextWithSingleItem(
            'this media item mentions a word in the term',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.mediaItem,
                    id: '1',
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPointMilliseconds: 100,
                        outPointMilliseconds: 1200,
                    },
                }),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.term,
                    id: '2',
                },
                context: new TextFieldContext({
                    target: 'text',
                    languageCode: LanguageCode.English,
                    charRange: [1, 4],
                }),
            },
        ],
    },
    {
        id: '3003',
        note: buildMultilingualTextWithSingleItem(
            'here is the digital version of the digital text!',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '950',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.bibliographicCitation,
                    id: '1',
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        id: '3004',
        note: buildMultilingualTextWithSingleItem(
            'this vocabulary list will help in studying the book'
        ),
        members: [
            buildTestVocabularyListEdgeConnectionMember(
                EdgeConnectionContextType.textField,
                EdgeConnectionMemberRole.from
            ),
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: '950',
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

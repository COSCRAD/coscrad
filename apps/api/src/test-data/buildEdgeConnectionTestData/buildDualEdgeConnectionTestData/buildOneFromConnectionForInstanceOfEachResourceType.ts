import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { IdentityContext } from '../../../domain/models/context/identity-context.entity/identity-context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';

// type is the same for all, use map to mix this in below
const dtosWithoutTypeProperty: DTO<Omit<EdgeConnection, 'type' | 'connectionType'>>[] = [
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
                    type: EdgeConnectionContextType.textField,
                    target: 'text',
                    languageCode: LanguageCode.English,
                    charRange: [1, 4],
                }),
            },
        ],
    },
    {
        id: '3002',
        note: buildMultilingualTextWithSingleItem(
            'here is the digital version of the book!',
            LanguageCode.English
        ),
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: ResourceType.bibliographicReference,
                    id: '1',
                },
                context: new IdentityContext(),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.book,
                    id: '24',
                },
                context: new IdentityContext(),
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
                    id: '1',
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: ResourceType.bibliographicReference,
                    id: '1',
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
            })
    );

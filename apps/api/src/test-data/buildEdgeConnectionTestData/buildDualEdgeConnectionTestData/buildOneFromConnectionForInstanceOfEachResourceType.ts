import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { DTO } from '../../../types/DTO';

// type is the same for all, use map to mix this in below
const dtosWithoutTypeProperty: DTO<Omit<EdgeConnection, 'type'>>[] = [
    {
        id: '3001',
        note: 'this media item mentions a word in the term',
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    type: resourceTypes.mediaItem,
                    id: '1',
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPoint: 100,
                        outPoint: 1200,
                    },
                }),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    type: resourceTypes.term,
                    id: '2',
                },
                context: new TextFieldContext({
                    type: EdgeConnectionContextType.textField,
                    target: 'term',
                    charRange: [1, 4],
                }),
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
                type: EdgeConnectionType.dual,
            })
    );

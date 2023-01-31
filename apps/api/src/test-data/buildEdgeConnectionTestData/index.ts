import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from '../utilities/convertSequentialIdToUuid';
import buildDualEdgeConnectionTestData from './buildDualEdgeConnectionTestData';
import buildSelfConnectionTestData from './buildSelfConnectionTestData';

const ID_OFFSET_FOR_DUAL_EDGES = 500;

const STARTING_INDEX_FOR_ALL_DATA = 1;

export default (): EdgeConnection[] =>
    [
        ...buildSelfConnectionTestData(STARTING_INDEX_FOR_ALL_DATA),
        ...buildDualEdgeConnectionTestData(ID_OFFSET_FOR_DUAL_EDGES),
    ]
        .map(convertAggregatesIdToUuid)
        .map((connection) =>
            connection.clone({
                members: connection.members.map((member) =>
                    member.clone({
                        compositeIdentifier: {
                            ...member.compositeIdentifier,
                            id: convertSequenceNumberToUuid(
                                parseInt(member.compositeIdentifier.id)
                            ),
                        },
                    })
                ),
            })
        );

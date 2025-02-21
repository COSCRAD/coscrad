import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from '../utilities/convertSequentialIdToUuid';
import buildDualEdgeConnectionTestData from './buildDualEdgeConnectionTestData';
import buildSelfConnectionTestData from './buildSelfConnectionTestData';

const ID_OFFSET_FOR_DUAL_EDGES = 500;

const STARTING_INDEX_FOR_ALL_DATA = 1;

const LENGTH_OF_DUMMY_IDS = buildDummyUuid(1).length;

export default (): EdgeConnection[] =>
    [
        ...buildSelfConnectionTestData(STARTING_INDEX_FOR_ALL_DATA),
        ...buildDualEdgeConnectionTestData(ID_OFFSET_FOR_DUAL_EDGES),
    ]
        .map(convertAggregatesIdToUuid)
        .map((connection) =>
            connection.clone({
                members: connection.members.map((member) => {
                    const { id: incomingMemberId } = member.compositeIdentifier;

                    /**
                     * TODO We should phase out the call to `convertSequenceNumberToUuid`
                     * in favor of using exported helpers akin to `buildTestVocabularyListEdgeConnectionMember`.
                     */
                    const idToUse =
                        incomingMemberId.length === LENGTH_OF_DUMMY_IDS
                            ? incomingMemberId
                            : convertSequenceNumberToUuid(parseInt(incomingMemberId));

                    return member.clone({
                        compositeIdentifier: {
                            ...member.compositeIdentifier,
                            id: idToUse,
                        },
                    });
                }),
            })
        );

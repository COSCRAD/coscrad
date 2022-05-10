import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import buildDualEdgeConnectionTestData from './buildDualEdgeConnectionTestData';
import buildSelfConnectionTestData from './buildSelfConnectionTestData';

const ID_OFFSET_FOR_DUAL_EDGES = 500;

export default (): EdgeConnection[] => [
    ...buildSelfConnectionTestData(1),
    ...buildDualEdgeConnectionTestData(ID_OFFSET_FOR_DUAL_EDGES),
];

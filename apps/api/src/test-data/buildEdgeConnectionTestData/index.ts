import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import buildDualEdgeConnectionTestData from './buildDualEdgeConnectionTestData';
import buildSelfConnectionTestData from './buildSelfConnectionTestData';

export default (): EdgeConnection[] => [
    ...buildSelfConnectionTestData(),
    ...buildDualEdgeConnectionTestData(),
];

import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import buildDualEdgeConnectionTestData from './buildDualEdgeConnectionTestData';
import buildSelfConnectionTestData from './buildSelfConnectionTestData';

export default (): EdgeConnection[] =>
    [...buildSelfConnectionTestData(), ...buildDualEdgeConnectionTestData()]
        // We generate IDs at the top level to guarantee uniqueness
        .map(
            (dto, index) =>
                new EdgeConnection({
                    ...dto,
                    id: `${index + 1}`,
                })
        );

import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { CREATE_POINT } from '../../domain/models/spatial-feature/point/commands';
import { CreatePoint } from '../../domain/models/spatial-feature/point/commands/create-point.command';
import { buildTestInstance } from '../utilities';

const createPoint: CommandFSA<CreatePoint> = {
    type: CREATE_POINT,
    payload: buildTestInstance(CreatePoint),
};

// TODO do we really need this helper?
export const buildSpatialFeatureTestCommandFsas = () => [createPoint];

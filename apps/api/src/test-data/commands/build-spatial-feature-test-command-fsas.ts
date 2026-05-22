import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { CREATE_POINT } from '../../domain/models/spatial-feature/point/commands';
import { CreatePoint } from '../../domain/models/spatial-feature/point/commands/create-point.command';
import { PointCoordinates } from '../../domain/models/spatial-feature/point/entities/point-coordinates.entity';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(21);

const type = AggregateType.spatialFeature;

const createPointPayload: CreatePoint = {
    aggregateCompositeIdentifier: {
        type,
        id,
    },
    location: {
        type: GeometricFeatureType.point,
        coordinates: PointCoordinates.fromTuple([52, -122]),
    },
    name: 'Cool Point',
    languageCodeForName: LanguageCode.English,
    description: 'This is just test data',
    imageUrl: `https://www.coscrad.org/ADDME.jpg`,
};

const createPoint: CommandFSA<CreatePoint> = {
    type: CREATE_POINT,
    payload: createPointPayload,
};

// TODO do we really need this helper?
export const buildSpatialFeatureTestCommandFsas = () => [createPoint];

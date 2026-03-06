import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CREATE_POINT } from '../../domain/models/spatial-feature/point/commands';
import { CreatePoint } from '../../domain/models/spatial-feature/point/commands/create-point.command';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(21);

const type = AggregateType.spatialFeature;

const createPointPayload: CreatePoint = {
    aggregateCompositeIdentifier: {
        type,
        id,
    },
    lattitude: 52.1417,
    longitude: -122.1417,
    contemporaryName: {
        text: 'Cool Point',
        languageCode: LanguageCode.English,
    },
    description: 'This is just test data',
    imageUrl: `https://www.coscrad.org/ADDME.jpg`,
};

const createPoint: CommandFSA<CreatePoint> = {
    type: CREATE_POINT,
    payload: createPointPayload,
};

export const buildSpatialFeatureTestCommandFsas = () => [createPoint];

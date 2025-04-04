import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreatePhotograph } from '../../domain/models/photograph';
import { AggregateType } from '../../domain/types/AggregateType';

const type = AggregateType.photograph;

const id = buildDummyUuid(1);

const createPhotograph: CommandFSA<CreatePhotograph> = {
    type: 'CREATE_PHOTOGRAPH',
    payload: {
        aggregateCompositeIdentifier: { type, id },
        title: 'The Meadow',
        languageCodeForTitle: LanguageCode.English,
        mediaItemId: buildDummyUuid(2),
        photographer: 'Jane Deer',
        heightPx: 1200,
        widthPx: 600,
    },
};

export const buildPhotographTestCommandFsas = () => [createPhotograph];

import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { PublishResource } from '../../domain/models/shared/common-commands';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(5555);

const publishResource: CommandFSA<PublishResource> = {
    type: `PUBLISH_RESOURCE`,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id,
        },
    },
};

export const buildGeneralResourceTestCommandFsas = () => [publishResource];

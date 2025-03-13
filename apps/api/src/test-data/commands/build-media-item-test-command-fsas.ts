import { MIMEType } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateMediaItem } from '../../domain/models/media-item/commands/create-media-item/create-media-item.command';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(41);

const type = AggregateType.mediaItem;

const createMediaItem: CommandFSA<CreateMediaItem> = {
    type: `CREATE_MEDIA_ITEM`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        title: 'Fishing Video',
        mimeType: MIMEType.mp4,
        lengthMilliseconds: 100000,
    },
};

export const buildMediaItemTestCommandFsas = () => [createMediaItem];

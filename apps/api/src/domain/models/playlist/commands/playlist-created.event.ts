import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { CoscradEvent } from '../../../common';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CreatePlayList } from './create-playlist.command';

export type PlaylistCreatedPayload = CreatePlayList;

@CoscradDataExample<PlaylistCreated>({
    example: {
        id: buildDummyUuid(66),
        type: 'PLAYLIST_CREATED',
        meta: {
            id: buildDummyUuid(66),
            userId: buildDummyUuid(1234),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(1911),
                type: AggregateType.playlist,
            },
            name: 'Slow Grooves',
            languageCodeForName: LanguageCode.English,
        },
    },
})
@CoscradEvent('PLAYLIST_CREATED')
export class PlaylistCreated extends BaseEvent<PlaylistCreatedPayload> {
    readonly type = 'PLAYLIST_CREATED';

    public static fromDto({ payload, meta }: DTO<PlaylistCreated>) {
        return new PlaylistCreated(payload, meta);
    }
}

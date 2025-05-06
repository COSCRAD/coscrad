import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslatePlaylistName } from './translate-playlist-name.command';

export type PlaylistNameTranslatedPayload = TranslatePlaylistName;

const testEventId = buildDummyUuid(101);

@CoscradDataExample<PlaylistNameTranslated>({
    example: {
        id: testEventId,
        type: 'PLAYLIST_NAME_TRANSLATED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(3),
        },
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.playlist, id: buildDummyUuid(4) },
            text: 'translation of playlist name',
            languageCode: LanguageCode.English,
        },
    },
})
@CoscradEvent(`PLAYLIST_NAME_TRANSLATED`)
export class PlaylistNameTranslated extends BaseEvent<PlaylistNameTranslatedPayload> {
    readonly type = 'PLAYLIST_NAME_TRANSLATED';

    public static fromDto(dto: DTO<PlaylistNameTranslated>) {
        return new PlaylistNameTranslated(dto.payload, dto.meta);
    }
}

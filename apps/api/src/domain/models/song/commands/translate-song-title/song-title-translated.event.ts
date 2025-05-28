import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_TITLE_TRANSLATED } from './constants';
import { TranslateSongTitle } from './translate-song-title.command';

export type SongTitleTranslatedPayload = TranslateSongTitle;

const fixtureEventId = buildDummyUuid(1);

@CoscradDataExample<SongTitleTranslated>({
    example: {
        id: fixtureEventId,
        type: 'SONG_TITLE_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(2),
                type: AggregateType.song,
            },
            translation: 'the translation of song',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: fixtureEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(83),
        },
    },
})
// TODO Can we get the event type via reflection?
@CoscradEvent(SONG_TITLE_TRANSLATED)
export class SongTitleTranslated extends BaseEvent<SongTitleTranslatedPayload> {
    readonly type = SONG_TITLE_TRANSLATED;
}

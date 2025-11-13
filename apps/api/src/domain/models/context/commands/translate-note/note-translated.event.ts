import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateNote } from './translate-note.command';

export type NoteTranslatedPayload = TranslateNote;

const testEventId = buildDummyUuid(3);

@CoscradDataExample<NoteTranslated>({
    example: {
        id: testEventId,
        type: 'NOTE_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(43),
                type: AggregateType.note,
            },
            text: 'note text',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(4),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('NOTE_TRANSLATED')
export class NoteTranslated extends BaseEvent<NoteTranslatedPayload> {
    readonly type = 'NOTE_TRANSLATED';
}

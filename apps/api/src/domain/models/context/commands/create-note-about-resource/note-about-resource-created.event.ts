import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateNoteAboutResource } from './create-note-about-resource.command';

export type NoteAboutResourceCreatedPayload = CreateNoteAboutResource;

const testEventId = buildDummyUuid(100);

@CoscradDataExample<NoteAboutResourceCreated>({
    example: {
        type: 'NOTE_ABOUT_RESOURCE_CREATED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.note,
                id: buildDummyUuid(1),
            },
            resourceCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(2),
            },
            resourceContext: undefined,
            text: 'This is a test note about term 2',
            languageCode: LanguageCode.Chilcotin,
        },
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(201),
        },
    },
})
@CoscradEvent('NOTE_ABOUT_RESOURCE_CREATED')
export class NoteAboutResourceCreated extends BaseEvent<NoteAboutResourceCreatedPayload> {
    readonly type = 'NOTE_ABOUT_RESOURCE_CREATED';
}

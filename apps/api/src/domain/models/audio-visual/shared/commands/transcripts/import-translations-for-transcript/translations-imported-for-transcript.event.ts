import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../../domain/common';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { ImportTranslationsForTranscript } from './import-translations-for-transcript.command';

export type TranslationsImportedForTranscriptPayload = ImportTranslationsForTranscript;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<TranslationsImportedForTranscript>({
    example: {
        id: testEventId,
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(333),
            contributorIds: [],
        },
        type: 'TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: buildDummyUuid(23),
            },
            translationItems: [],
        },
    },
})
@CoscradEvent('TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT')
export class TranslationsImportedForTranscript extends BaseEvent<TranslationsImportedForTranscriptPayload> {
    readonly type = 'TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT';

    // TODO put this on `BaseEvent`
    public static fromDto(dto: DTO<TranslationsImportedForTranscript>) {
        return new TranslationsImportedForTranscript(dto.payload, dto.meta);
    }
}

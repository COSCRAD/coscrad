import {
    EdgeConnectionContextType,
    IEdgeConnectionContext,
    IMultilingualTextRecord,
    INoteRecordForResource,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

@CoscradDataExample<NoteRecordForResourceViewModel>({
    example: {
        id: buildDummyUuid(1),
        note: {
            original: {
                text: 'test note',
                languageCode: LanguageCode.English,
                // TODO populate this
                // tokens: [],
            },
            translations: {},
        },

        context: { type: EdgeConnectionContextType.general },
    },
})
export class NoteRecordForResourceViewModel implements INoteRecordForResource {
    id: string;

    note: IMultilingualTextRecord;

    context: IEdgeConnectionContext;

    constructor(dto: DTO<NoteRecordForResourceViewModel>) {
        if (!dto) return;

        const { id, note, context } = dto;

        this.id = id;

        this.context = context;

        if (!isNullOrUndefined(note)) {
            this.note = note;
        }
    }

    public static fromDto(dto: DTO<NoteRecordForResourceViewModel>) {
        return new NoteRecordForResourceViewModel(dto);
    }
}

import { EdgeConnectionContextType, IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

@CoscradDataExample<NoteRecordForResourceViewModel>({
    example: {
        id: buildDummyUuid(1),
        note: buildMultilingualTextWithSingleItem('test note'),
        context: { type: EdgeConnectionContextType.general },
    },
})
export class NoteRecordForResourceViewModel {
    id: string;

    note: MultilingualText;

    context: IEdgeConnectionContext;

    constructor(dto: DTO<NoteRecordForResourceViewModel>) {
        if (!dto) return;

        const { id, note, context } = dto;

        this.id = id;

        this.context = context;

        if (!isNullOrUndefined(note)) {
            this.note = new MultilingualText(note);
        }
    }

    public static fromDto(dto: DTO<NoteRecordForResourceViewModel>) {
        return new NoteRecordForResourceViewModel(dto);
    }
}

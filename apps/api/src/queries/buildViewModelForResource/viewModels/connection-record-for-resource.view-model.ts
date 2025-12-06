import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

@CoscradDataExample<ConnectionRecordForResourceViewModel>({
    example: {
        id: buildDummyUuid(1),
        note: buildMultilingualTextWithSingleItem('test note'),
        selfContext: {
            type: EdgeConnectionContextType.general,
        },
        other: {
            type: ResourceType.audioItem,
            id: buildDummyUuid(123),
        },
        otherContext: {
            type: EdgeConnectionContextType.general,
        },
        role: EdgeConnectionMemberRole.from,
    },
})
export class ConnectionRecordForResourceViewModel {
    // this is the note (edge-connection) ID
    id: string;

    note: MultilingualText;

    selfContext: IEdgeConnectionContext;

    other: ResourceCompositeIdentifier;

    otherContext: IEdgeConnectionContext;

    role: typeof EdgeConnectionMemberRole.to | typeof EdgeConnectionMemberRole.from;

    constructor(dto: DTO<ConnectionRecordForResourceViewModel>) {
        if (!dto) return;

        const { id, note, selfContext, other: otherCompositeIdentifier, otherContext, role } = dto;

        this.id = id;

        this.selfContext = selfContext;

        this.other = otherCompositeIdentifier;

        this.otherContext = otherContext;

        this.role = role;

        if (!isNullOrUndefined(note)) {
            this.note = new MultilingualText(note);
        }
    }

    public static fromDto(dto: DTO<ConnectionRecordForResourceViewModel>) {
        return new ConnectionRecordForResourceViewModel(dto);
    }
}

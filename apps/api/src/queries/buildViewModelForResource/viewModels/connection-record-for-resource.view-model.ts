import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    IMultilingualTextRecord,
    LanguageCode,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

@CoscradDataExample<ConnectionRecordForResourceViewModel>({
    example: {
        id: buildDummyUuid(1),
        note: {
            original: {
                text: 'test note',
                languageCode: LanguageCode.English,
            },
            translations: {},
        },
        selfContext: {
            type: EdgeConnectionContextType.general,
        },
        otherCompositeIdentifier: {
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

    note: IMultilingualTextRecord;

    selfContext: IEdgeConnectionContext;

    otherCompositeIdentifier: ResourceCompositeIdentifier;

    otherContext: IEdgeConnectionContext;

    role: typeof EdgeConnectionMemberRole.to | typeof EdgeConnectionMemberRole.from;

    constructor(dto: DTO<ConnectionRecordForResourceViewModel>) {
        if (!dto) return;

        const { id, note, selfContext, otherCompositeIdentifier, otherContext, role } = dto;

        this.id = id;

        this.selfContext = selfContext;

        this.otherCompositeIdentifier = otherCompositeIdentifier;

        this.otherContext = otherContext;

        this.role = role;

        if (!isNullOrUndefined(note)) {
            this.note = cloneToPlainObject(note);
        }
    }

    public static fromDto(dto: DTO<ConnectionRecordForResourceViewModel>) {
        return new ConnectionRecordForResourceViewModel(dto);
    }
}

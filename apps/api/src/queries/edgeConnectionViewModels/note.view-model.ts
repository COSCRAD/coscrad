import { EdgeConnectionType, INoteViewModel } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import {
    EdgeConnection,
    EdgeConnectionMember,
} from '../../domain/models/context/edge-connection.entity';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../buildViewModelForResource/viewModels/base.view-model';

export class NoteViewModel extends BaseViewModel implements INoteViewModel {
    // TODO expose as part of schema
    readonly connectionType: EdgeConnectionType;

    @ApiProperty({
        example: 'this part is about horses',
        description: 'a note about a resource or the connection between two resources',
    })
    @NestedDataType(MultilingualText, {
        label: 'note text',
        description: 'an note about a resource or pair of connected resources',
    })
    readonly note: MultilingualText;

    @NestedDataType(EdgeConnectionMember, {
        isArray: true,
        label: 'connected resources',
        // TODO reword
        description: 'the 1 (self note) or 2 (dual connection) resources that this note connects',
    })
    readonly connectedResources: EdgeConnectionMember[] = [];

    constructor(edgeConnection: EdgeConnection) {
        super(edgeConnection);

        const { note, members, connectionType } = edgeConnection;

        this.connectionType = connectionType;

        this.note = new MultilingualText(note);

        this.connectedResources = cloneToPlainObject(members);
    }
}

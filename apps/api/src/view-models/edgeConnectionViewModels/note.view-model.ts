import { EdgeConnectionType, INoteViewModel } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
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
    @NonEmptyString()
    readonly note: string;

    @NestedDataType(EdgeConnectionMember, { isArray: true })
    readonly connectedResources: EdgeConnectionMember[] = [];

    constructor({ id, note, members, connectionType }: EdgeConnection) {
        super({ id });

        this.connectionType = connectionType;

        this.note = note;

        this.connectedResources = cloneToPlainObject(members);
    }
}

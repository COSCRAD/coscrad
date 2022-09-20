import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import {
    EdgeConnection,
    EdgeConnectionMember,
} from '../../domain/models/context/edge-connection.entity';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../buildViewModelForResource/viewModels/base.view-model';

export class NoteViewModel extends BaseViewModel {
    @ApiProperty({
        example: 'this part is about horses',
        description: 'a note about a resource or the connection between two resources',
    })
    @NonEmptyString()
    readonly note: string;

    @NestedDataType(EdgeConnectionMember, { isArray: true })
    readonly relatedResources?: EdgeConnectionMember[] = [];

    constructor({ id, note, members }: EdgeConnection) {
        super({ id });

        this.note = note;

        this.relatedResources = cloneToPlainObject(members);
    }
}

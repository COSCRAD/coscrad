import { ApiProperty } from '@nestjs/swagger';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

export class BaseViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    readonly id: ViewModelId;

    constructor({ id }: HasViewModelId) {
        this.id = id;
    }
}

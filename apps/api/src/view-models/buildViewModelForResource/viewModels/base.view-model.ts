import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

export class BaseViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate)
    readonly id: ViewModelId;

    constructor({ id }: HasViewModelId) {
        this.id = id;
    }
}

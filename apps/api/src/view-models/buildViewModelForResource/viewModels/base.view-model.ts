import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { Ctor } from '../../../lib/types/Ctor';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

export class BaseViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as Ctor<unknown>)
    readonly id: ViewModelId;

    constructor({ id }: HasViewModelId) {
        this.id = id;
    }
}

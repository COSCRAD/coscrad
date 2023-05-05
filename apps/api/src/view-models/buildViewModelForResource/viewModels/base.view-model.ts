import { IBaseViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { Ctor } from '../../../lib/types/Ctor';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

interface Nameable {
    getName(): MultilingualText;
}

export class BaseViewModel implements IBaseViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as Ctor<unknown>)
    readonly id: ViewModelId;

    @FromDomainModel(Aggregate as Ctor<unknown>)
    readonly name: MultilingualText;

    constructor(domainModel: HasViewModelId & Nameable) {
        this.id = domainModel.id;

        this.name = domainModel.getName();
    }
}

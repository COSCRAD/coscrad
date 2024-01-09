import { IBaseViewModel, IMultilingualText } from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { Ctor } from '../../../lib/types/Ctor';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

interface Nameable {
    getName(): MultilingualText;
}

export class BaseViewModel implements IBaseViewModel {
    readonly type: string;

    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as Ctor<unknown>)
    readonly id: ViewModelId;

    @NestedDataType(MultilingualText, {
        description: `multilingual text name of the entity`,
        label: `name`,
    })
    readonly name: IMultilingualText;

    constructor(domainModel: HasViewModelId & Nameable) {
        this.id = domainModel.id;

        this.name = domainModel.getName();
    }
}

import { IDigitalTextViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { MultilingualText } from 'apps/api/src/domain/common/entities/multilingual-text';
import { DigitalText } from 'apps/api/src/domain/models/digital-text/digital-text.entity';
import { BaseViewModel } from './base.view-model';

const FromDigitalText = FromDomainModel(DigitalText);

export class DigitalTextViewModel extends BaseViewModel implements IDigitalTextViewModel {
    @FromDigitalText
    readonly title: MultilingualText;

    constructor(digitalText: DigitalText) {
        super(digitalText);

        const { title } = digitalText;

        this.title = title;
    }
}

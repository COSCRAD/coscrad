import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { ReferenceTo, UUID } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';

export class MultilingualAudioItem extends BaseDomainModel {
    @LanguageCodeEnum({
        label: `language`,
        description: `language of the audio`,
    })
    readonly languageCode: LanguageCode;

    @UUID({
        label: `audio item ID`,
        description: `a reference to the relevant audio item`,
    })
    @ReferenceTo(AggregateType.audioItem)
    readonly audioItemId: AggregateId;

    constructor(dto: DTO<MultilingualAudioItem>) {
        super();

        if (!dto) return;

        const { languageCode, audioItemId } = dto;

        this.languageCode = languageCode;

        this.audioItemId = audioItemId;
    }

    isIn(languageCode: LanguageCode): boolean {
        return this.languageCode === languageCode;
    }

    refersTo(audioItemId: AggregateId): boolean {
        return this.audioItemId === audioItemId;
    }
}

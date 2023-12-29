import { LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { CannotOverrideAudioForLanguageError } from './errors';
import { MultilingualAudioItem } from './multilingual-audio-item.entity';

export class MultilingualAudio extends BaseDomainModel {
    @NestedDataType(MultilingualAudioItem, {
        label: `audio items`,
        description: `a list of audio for each available`,
        isArray: true,
    })
    readonly items: MultilingualAudioItem[];

    constructor(dto: DTO<MultilingualAudio>) {
        super();

        if (!dto) return;

        const { items } = dto;

        this.items = Array.isArray(items)
            ? items.map((item) => new MultilingualAudioItem(item))
            : items;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    hasAudioIn(languageCode: LanguageCode): boolean {
        return this.items.some((item) => item.isIn(languageCode));
    }

    getIdForAudioIn(languageCode: LanguageCode): Maybe<AggregateId> {
        return (
            this.items.find((item) => item.languageCode === languageCode)?.audioItemId || NotFound
        );
    }

    hasAudioItem(audioItemId: AggregateId): boolean {
        return this.items.some((item) => item.refersTo(audioItemId));
    }

    count(): number {
        return this.items.length;
    }

    addAudio(
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): ResultOrError<MultilingualAudio> {
        if (this.hasAudioIn(languageCode)) {
            return new CannotOverrideAudioForLanguageError(
                languageCode,
                audioItemId,
                this.getIdForAudioIn(languageCode) as AggregateId
            );
        }

        const newAudioItems = this.items.concat(
            new MultilingualAudioItem({ audioItemId, languageCode })
        );

        return this.clone<MultilingualAudio>({
            items: newAudioItems,
        });
    }
}

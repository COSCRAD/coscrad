import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { TranscriptItem } from './MediaTimeRange';

class TranscriptParticipant {
    @NonEmptyString({
        label: 'speaker label',
        description: 'a label (e.g., initials) for this speaker',
    })
    readonly label: string;

    // This should eventually point to a "Person" model
    readonly id: AggregateId;
}

export type CoscradTimeStamp = number;

export class Transcript<T extends string> extends BaseDomainModel {
    // TODO Make this multi-lingual text
    @NonEmptyString({
        label: 'name',
        description: 'the name of the transcript',
    })
    readonly name: string;

    // TODO Validate that there are not duplicate IDs here
    readonly participants: TranscriptParticipant[];

    @NestedDataType(TranscriptItem, {
        isArray: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    // TODO rename this, as it includes the data as well
    readonly items: TranscriptItem<T>[];

    // TODO ensure that items are consistent with this property
    readonly lengthMilliseconds: CoscradTimeStamp;

    constructor(dto: DTO<Transcript<T>>) {
        super();

        if (!dto) return;

        const { items } = dto;

        this.items = Array.isArray(items) ? items.map((item) => new TranscriptItem(item)) : null;
    }
}

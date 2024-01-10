import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DIGITAL_TEXT_CREATED } from '../../constants';
import {
    CreateDigitalText,
    DigitalTextCompositeId,
} from '../create-digital-text/create-digital-text.command';

export class DigitalTextCreatedPayload {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.digitalText
    >;

    @NestedDataType(MultilingualTextItem, {
        label: 'title',
        description: `multilingual text item definition for the digital text's title`,
    })
    readonly title: MultilingualTextItem;

    constructor({
        titleText,
        languageCodeForTitle,
        aggregateCompositeIdentifier,
    }: {
        titleText: string;
        languageCodeForTitle: LanguageCode;
        aggregateCompositeIdentifier: AggregateCompositeIdentifier<
            typeof AggregateType.digitalText
        >;
    }) {
        this.aggregateCompositeIdentifier = aggregateCompositeIdentifier;

        this.title = new MultilingualTextItem({
            text: titleText,
            languageCode: languageCodeForTitle,
            // The event payload encodes the significance of this translation for consumers
            role: MultilingualTextItemRole.original,
        });
    }
}

@CoscradEvent(DIGITAL_TEXT_CREATED)
export class DigitalTextCreated extends BaseEvent<DigitalTextCreatedPayload> {
    type = DIGITAL_TEXT_CREATED;

    @NestedDataType(DigitalTextCreatedPayload, {
        label: 'payload',
        description: 'the event payload',
    })
    payload: DigitalTextCreatedPayload;

    constructor(
        { title, languageCodeForTitle, aggregateCompositeIdentifier }: CreateDigitalText,
        meta: EventRecordMetadata
    ) {
        super(
            new DigitalTextCreatedPayload({
                aggregateCompositeIdentifier,
                titleText: title,
                languageCodeForTitle,
            }),
            meta
        );
    }
}

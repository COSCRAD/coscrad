import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { TERM_TRANSLATED } from './constants';
import { TranslateTerm } from './translate-term.command';

export type TermTranslatedPayload = TranslateTerm;

// TODO Introduce an independent event payload and mapping layer
// export class TermTranslatedPayload {
//     aggregateCompositeIdentifier: TermCompositeIdentifier;

//     @NestedDataType(MultilingualTextItem, {
//         label: 'translation',
//         description: 'the text, language, and role (type) of the translation',
//     })
//     translation: MultilingualTextItem;
// }

@CoscradEvent(TERM_TRANSLATED)
export class TermTranslated extends BaseEvent<TermTranslatedPayload> {
    readonly type = 'TERM_TRANSLATED';

    constructor(command: TranslateTerm, meta: EventRecordMetadata) {
        super(command, meta);
    }
}

import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { TermCompositeIdentifier } from '../create-term';
import { TERM_TRANSLATED } from './constants';
import { TranslateTerm } from './translate-term.command';

export class TermTranslatedPayload {
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NestedDataType(MultilingualTextItem, {
        label: 'translation',
        description: 'the text, language, and role (type) of the translation',
    })
    translation: MultilingualTextItem;
}

@CoscradEvent(TERM_TRANSLATED)
export class TermTranslated extends BaseEvent<TermTranslatedPayload> {
    readonly type = 'TERM_TRANSLATED';

    constructor(
        { translation, languageCode, aggregateCompositeIdentifier }: TranslateTerm,
        meta: EventRecordMetadata
    ) {
        super(
            // TODO does this need to be an instance?
            {
                aggregateCompositeIdentifier,
                translation: new MultilingualTextItem({
                    text: translation,
                    languageCode,
                    role: MultilingualTextItemRole.freeTranslation,
                }),
            },
            meta
        );
    }
}

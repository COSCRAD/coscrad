import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { CoscradEvent } from '../../../../../../common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { TranslateLineItem } from './translate-line-item.command';

export type LineItemTranslatedPayload = TranslateLineItem;

const testEventId = buildDummyUuid(545);

@CoscradDataExample<LineItemTranslated>({
    example: {
        // TODO can we avoid this as it is automatically set by the constructor? It's only here for consistency with other DTOs.
        id: testEventId,
        type: 'LINE_ITEM_TRANSLATED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(555),
        },
        payload: {
            aggregateCompositeIdentifier: { id: buildDummyUuid(1), type: AggregateType.audioItem },
            inPointMilliseconds: 1200,
            outPointMilliseconds: 2200,
            translation: 'text of the translation for a line item',
            languageCode: LanguageCode.English,
        },
    },
})
@CoscradEvent('LINE_ITEM_TRANSLATED')
export class LineItemTranslated extends BaseEvent<LineItemTranslatedPayload> {
    readonly type = 'LINE_ITEM_TRANSLATED';

    public static fromDto({ meta, payload }: DTO<LineItemTranslated>) {
        return new LineItemTranslated(payload, meta);
    }
}

import { AggregateType } from '@coscrad/api-interfaces';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { ImportPagesToDigitalText } from './import-pages-to-digital-text.command';

export type PagesImportedToDigitalTextPayload = ImportPagesToDigitalText;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<PagesImportedToDigitalText>({
    example: {
        type: 'PAGES_IMPORTED_TO_DIGITAL_TEXT',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(2),
            },
            pages: [],
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(123),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('PAGES_IMPORTED_TO_DIGITAL_TEXT')
export class PagesImportedToDigitalText extends BaseEvent<PagesImportedToDigitalTextPayload> {
    readonly type = 'PAGES_IMPORTED_TO_DIGITAL_TEXT';
}

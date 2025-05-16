import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreatePromptTerm } from './create-prompt-term.command';

export type PromptTermCreatedPayload = CreatePromptTerm;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<PromptTermCreated>({
    example: {
        type: 'PROMPT_TERM_CREATED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(2),
            },
            text: 'I am running fast.',
        },
        meta: {
            userId: buildDummyUuid(33),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
@CoscradEvent('PROMPT_TERM_CREATED')
export class PromptTermCreated extends BaseEvent<PromptTermCreatedPayload> {
    readonly type = 'PROMPT_TERM_CREATED';

    protected attributionTemplate = `English prompt created by: `;

    public static fromDto(dto: DTO<PromptTermCreated>) {
        return new PromptTermCreated(dto.payload, dto.meta);
    }
}

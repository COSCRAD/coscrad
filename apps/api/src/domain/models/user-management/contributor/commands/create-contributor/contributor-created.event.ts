import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateContributor } from './create-contributor.command';

export type ContributorCreatedPayload = CreateContributor;

@CoscradEvent('CONTRIBUTOR_CREATED')
export class ContributorCreated extends BaseEvent {
    readonly type = 'CONTRIBUTOR_CREATED';
}

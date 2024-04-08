import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CoscradDate } from '../../../utilities';
import { CreateContributor } from './create-contributor.command';

export type ContributorCreatedPayload = Omit<CreateContributor, 'dateOfBirth'> & {
    dateOfBirth?: CoscradDate;
};

@CoscradEvent('CONTRIBUTOR_CREATED')
export class ContributorCreated extends BaseEvent<ContributorCreatedPayload> {
    readonly type = 'CONTRIBUTOR_CREATED';
}

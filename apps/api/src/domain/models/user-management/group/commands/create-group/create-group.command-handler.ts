import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../../factories/utilities/buildInstanceFactory';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';
import { CreateGroup } from './create-group.command';
import { GroupCreated } from './group-created.event';

@CommandHandler(CreateGroup)
export class CreateGroupCommandHandler extends BaseCreateCommandHandler<CoscradUserGroup> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        label,
        description,
    }: CreateGroup): ResultOrError<CoscradUserGroup> {
        const createDto: DTO<CoscradUserGroup> = {
            type: AggregateType.userGroup,
            id,
            label,
            description,
            // You must run 'ADD_USER_TO_GROUP' to add users
            userIds: [],
        };

        return buildInstanceFactory(CoscradUserGroup)(createDto);
    }

    protected buildEvent(
        command: CreateGroup,
        eventId: string,
        systemUserId: AggregateId
    ): BaseEvent {
        return new GroupCreated(command, eventId, systemUserId);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [existingUserGroupSearchResult, allUserSearchResult] = await Promise.all([
            this.repositoryProvider.getUserGroupRepository().fetchMany(),
            this.repositoryProvider.getUserRepository().fetchMany(),
        ]);

        const existingGroups = existingUserGroupSearchResult.filter(validAggregateOrThrow);

        const users = allUserSearchResult.filter(validAggregateOrThrow);

        return buildInMemorySnapshot({
            user: users,
            userGroup: existingGroups,
        });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradUserGroup
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
}

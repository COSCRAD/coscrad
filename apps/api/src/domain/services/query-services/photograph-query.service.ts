import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../models/photograph/queries';
import { AccessControlList } from '../../models/shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

export class PhotographQueryService {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN)
        private readonly photographQueryRepository: IPhotographQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {}

    // todo add explicit return type
    async fetchById(id: AggregateId, userWithGroups?: CoscradUserWithGroups) {
        const result = await this.photographQueryRepository.fetchById(id);

        if (isNotFound(result)) return result;

        const acl = new AccessControlList(result.accessControlList);

        if (isNullOrUndefined(userWithGroups) && !result.isPublished) {
            return NotFound;
        }

        if (
            result.isPublished ||
            userWithGroups?.isAdmin() ||
            acl.canUser(userWithGroups.id) ||
            userWithGroups.groups.some(({ id: groupId }) => acl.canGroup(groupId))
        ) {
            return {
                ...result,
                /**
                 * Currently, permission to execute commands is solely
                 * role based and limited to project admin and COSCRAD admin.
                 * In the future, command permissions may depend on the command
                 * or the resource (row-level write permissions).
                 */
                actions: this.fetchUserActions(userWithGroups, [result]),
            };
        }
    }

    // TODO share this code with other query services
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) =>
            fetchActionsForUser(this.commandInfoService, systemUser, commandContext)
        );
    }
}

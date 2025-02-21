import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
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

        return NotFound;
    }

    // TODO should we support specifications \ custom filters?
    async fetchMany(userWithGroups?: CoscradUserWithGroups) {
        // TODO consider filtering for user access in the DB
        const entities = await this.photographQueryRepository.fetchMany();

        // TODO use SSOT utility function \ method for this
        const availableEntities = entities.filter((entity) => {
            if (entity.isPublished) return true;

            // the public can only access published resources
            if (isNullOrUndefined(userWithGroups)) return false;

            if (userWithGroups.isAdmin()) return true;

            const acl = new AccessControlList(entity.accessControlList);

            return (
                acl.canUser(userWithGroups.id) ||
                userWithGroups.groups.some(({ id: groupId }) => acl.canGroup(groupId))
            );
        });

        return {
            // TODO ensure actions show up on entities
            entities: availableEntities.map((entity) => {
                return {
                    ...entity,
                    /**
                     * See comment in `fetchById` about current RBAC for command execution.
                     */
                    actions: this.fetchUserActions(userWithGroups, [entity]),
                };
            }),
            // TODO Should we register index-scoped commands in the view layer instead?
            indexScopedActions: this.fetchUserActions(userWithGroups, [Photograph]),
        };
    }

    public subscribeToWriteNotifications(): Observable<{ data: { type: string } }> {
        return this.photographQueryRepository.subscribeToUpdates();
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

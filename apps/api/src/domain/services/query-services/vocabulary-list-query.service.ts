import {
    ICommandFormAndLabels,
    IIndexQueryResult,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject, Injectable } from '@nestjs/common';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { VocabularyListViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { AccessControlList } from '../../models/shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../models/vocabulary-list/queries';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

@Injectable()
export class VocabularyListQueryService {
    protected readonly type = ResourceType.vocabularyList;

    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly repository: IVocabularyListQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService
    ) {}

    // todo add explicit return type
    async fetchById(id: AggregateId, userWithGroups?: CoscradUserWithGroups) {
        const result = await this.repository.fetchById(id);

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
            const viewWithoutActions = VocabularyListViewModel.fromDto(result);

            return {
                ...viewWithoutActions,
                actions: this.fetchUserActions(userWithGroups, [viewWithoutActions]),
            };
        }

        return NotFound;
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IVocabularyListViewModel>> {
        // TODO consider filtering for user access in the DB
        const entities = await this.repository.fetchMany();

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
            // TODO ensure actions show up on entities DO this now!
            entities: availableEntities.map((entity) => {
                const actions =
                    Array.isArray(entity.actions) && entity.actions.length > 0
                        ? fetchActionsForUser(this.commandInfoService, userWithGroups, entity)
                        : [];

                return {
                    ...entity,
                    actions,
                };
            }),
            // TODO Should we register index-scoped commands in the view layer instead?
            indexScopedActions: this.fetchUserActions(userWithGroups, [VocabularyList]),
        };
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

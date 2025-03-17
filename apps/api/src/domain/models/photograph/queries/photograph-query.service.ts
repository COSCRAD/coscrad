import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IIndexQueryResult,
    IPhotographViewModel,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IPhotographQueryRepository, PHOTOGRAPH_QUERY_REPOSITORY_TOKEN } from '.';
import {
    CommandContext,
    CommandInfoService,
} from '../../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { fetchActionsForUser } from '../../../services/query-services/utilities/fetch-actions-for-user';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { Photograph } from '../entities/photograph.entity';
import { PhotographViewModel } from './photograph.view-model';

export class PhotographQueryService {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN)
        private readonly repository: IPhotographQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService
    ) {}

    // todo add explicit return type
    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IDetailQueryResult<IPhotographViewModel> | NotFound> {
        const result = await this.repository.fetchById(id);

        if (isNotFound(result)) return result;

        const photograph = result.forUser(userWithGroups);

        if (isNotFound(photograph)) {
            return NotFound;
        }

        const actions = this.fetchUserActions(userWithGroups, [photograph]);

        return {
            ...photograph,
            actions,
        };
    }

    // TODO should we support specifications \ custom filters?
    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IPhotographViewModel>> {
        // TODO consider filtering for user access in the DB
        const entities = await this.repository.fetchMany();

        // TODO use SSOT utility function \ method for this
        const availableEntities = entities.flatMap((entity) => {
            const forUser = entity.forUser(userWithGroups);

            return isNotFound(forUser) ? [] : forUser;
        });

        const indexScopedActions = this.fetchUserActions(userWithGroups, [Photograph]);

        const result = {
            entities: availableEntities.map((entity) => {
                const actions =
                    Array.isArray(entity.actions) && entity.actions.length > 0
                        ? fetchActionsForUser(this.commandInfoService, userWithGroups, entity)
                        : [];

                entity.actions = actions;

                return entity as unknown as Omit<PhotographViewModel, 'actions'> & {
                    actions: ICommandFormAndLabels[];
                };
            }),
            indexScopedActions,
        };

        return result;
    }

    public subscribeToWriteNotifications(): Observable<{ data: { type: string } }> {
        return this.repository.subscribeToUpdates();
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

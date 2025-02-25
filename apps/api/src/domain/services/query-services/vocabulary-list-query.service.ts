import {
    ICommandFormAndLabels,
    IIndexQueryResult,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { VocabularyListViewModel } from '../../../queries/buildViewModelForResource/viewModels';
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
        // TODO Consider passing the user here
        const result = await this.repository.fetchById(id);

        if (isNotFound(result)) return result;

        const vocabularyList = result.forUser(userWithGroups);

        if (isNotFound(vocabularyList)) {
            return NotFound;
        }

        return {
            ...vocabularyList,
            actions: this.fetchUserActions(userWithGroups, [vocabularyList]),
        };
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IVocabularyListViewModel>> {
        // TODO consider filtering for user access in the DB
        const entities = await this.repository.fetchMany();

        // TODO use SSOT utility function \ method for this
        // note we use `flatMap` for map + filter in a single iteration
        const availableEntities = entities.flatMap((entity) => {
            const forUser = entity.forUser(userWithGroups);

            return isNotFound(forUser) ? [] : forUser;
        });

        const result = {
            // TODO ensure actions show up on entities DO this now!
            entities: availableEntities.map((entity) => {
                const actions =
                    Array.isArray(entity.actions) && entity.actions.length > 0
                        ? fetchActionsForUser(this.commandInfoService, userWithGroups, entity)
                        : [];

                entity.actions = actions;

                return entity as unknown as Omit<VocabularyListViewModel, 'actions'> & {
                    actions: ICommandFormAndLabels[];
                };
            }),
            // TODO Should we register index-scoped commands in the view layer instead?
            indexScopedActions: this.fetchUserActions(userWithGroups, [VocabularyList]),
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

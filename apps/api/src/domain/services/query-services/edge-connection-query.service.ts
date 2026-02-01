import {
    ICategorizableIndexQueryResult,
    ICommandFormAndLabels,
    INoteViewModel,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { mixLinkIntoViewModelDescription } from '../../../app/controllers/utilities';
import { InternalError } from '../../../lib/errors/InternalError';
import { buildAllAggregateDescriptions } from '../../../queries/resourceDescriptions';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../models/context/repositories/note-query-repository.interface';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

/**
 * TODO [https://www.pivotaltracker.com/story/show/184098960]
 * Inherit from the base query service.
 */
export class EdgeConnectionQueryService {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly noteQueryRepository: INoteQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService,
        @Inject(ConfigService) private readonly configService: ConfigService
    ) {}

    async fetchSchema() {
        const searchResult = buildAllAggregateDescriptions().find(
            ({ type }) => type === AggregateType.note
        );

        if (isNullOrUndefined(searchResult)) {
            throw new InternalError(`Failed to find a view model description for the note model`);
        }

        const result = mixLinkIntoViewModelDescription(
            this.configService.get<string>('GLOBAL_PREFIX')
        )(searchResult);

        return result;
    }

    async fetchById(id: AggregateId, systemUser?: CoscradUserWithGroups) {
        return this.noteQueryRepository.fetchById(id, systemUser);
    }

    /**
     * In the future, we may want to use Access Control Lists on notes as well.
     */
    async fetchMany(
        _systemUser?: CoscradUserWithGroups
    ): Promise<ICategorizableIndexQueryResult<INoteViewModel>> {
        const { entities, page } = await this.noteQueryRepository.fetchMany();

        return {
            entities: entities.map((e) => ({
                ...e,
                actions: [],
            })),
            page,
            count: entities.length,
            // TODO insert available commands
            indexScopedActions: [],
        };
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184098960]
     *
     * Inherit from a shared base query service and share this logic with other
     * query services.
     */
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContext: CommandContext
    ): ICommandFormAndLabels[] {
        return fetchActionsForUser(this.commandInfoService, systemUser, commandContext);
    }
}

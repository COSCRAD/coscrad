import {
    CategorizableType,
    ICategorizableIndexQueryResult,
    ICommandFormAndLabels,
    INoteViewModel,
    WithTags,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { mixLinkIntoViewModelDescription } from '../../../app/controllers/utilities';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError } from '../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { NoteViewModel } from '../../../view-models/edgeConnectionViewModels/note.view-model';
import { buildAllAggregateDescriptions } from '../../../view-models/resourceDescriptions';
import { EdgeConnection } from '../../models/context/edge-connection.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { AggregateType } from '../../types/AggregateType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';

export class EdgeConnectionQueryService {
    // TODO Program to the interface `IRepositoryProvider`, not the concrete type
    constructor(
        @Inject(RepositoryProvider) private readonly repositoryProvider: RepositoryProvider,
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

    /**
     * In the future, we may want to use Access Control Lists on notes as well.
     */
    async fetchMany(): Promise<ICategorizableIndexQueryResult<INoteViewModel>> {
        const queryResult = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const validDomainModels = queryResult.filter(validAggregateOrThrow);

        const viewModels = validDomainModels.map(
            (edgeConnectionDomainModel) => new NoteViewModel(edgeConnectionDomainModel)
        );

        const tagFetchResult = await this.repositoryProvider.getTagRepository().fetchMany();

        const allTags = tagFetchResult.filter(validAggregateOrThrow);

        const mixinTags = (viewModel: NoteViewModel): WithTags<INoteViewModel> =>
            mixTagsIntoViewModel(viewModel, allTags, CategorizableType.note);

        const viewModelsWithTags = viewModels.map(mixinTags);

        const indexScopedActions = this.commandInfoService.getCommandInfo(EdgeConnection);

        return {
            indexScopedActions,
            entities: viewModelsWithTags.map((viewModel) => ({
                ...viewModel,
                // TODO Mixin the actions here!!!!
                actions: [] as ICommandFormAndLabels[],
            })),
        };
    }
}

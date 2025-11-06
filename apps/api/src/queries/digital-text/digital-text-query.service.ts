import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IDigitalTextViewModel,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';

import { CommandInfoService } from '../../app/controllers/command/services/command-info-service';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../domain/models/digital-text/queries/digital-text-query-repository.interface';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { Maybe } from '../../lib/types/maybe';
import { NotFound, isNotFound } from '../../lib/types/not-found';
import { DigitalTextViewModel } from './digital-text.view-model';

type IndexScopedCommandContext = {
    getIndexScopedCommands(): string[];
};

type DetailScopedCommandContext = {
    getAvailableCommands(): string[];

    getCompositeIdentifier(): AggregateCompositeIdentifier;
};

type CommandContext = IndexScopedCommandContext | DetailScopedCommandContext;

export class DigitalTextQueryService {
    /**
     * TODO We probably want to make this depend on a `DigitalTextQueryRepository`
     * that itself depends on the event repository. This is because we will eventually
     * publish events from the domain onto a messaging queue and cache the event-sourced
     * query models in a second database, achieving full CQRS-ES (big optimization).
     */
    constructor(
        // TODO Use a string injection token here. Consider using a provider when generalizing the implementation over aggregate type.
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        protected readonly queryRepository: IDigitalTextQueryRepository,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    public async fetchById(
        id: string,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IDetailQueryResult<IDigitalTextViewModel>>> {
        const searchResult = await this.queryRepository.fetchById(id);

        if (isNotFound(searchResult)) return NotFound;

        return this.transform(searchResult, userWithGroups);
    }

    public async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IDigitalTextViewModel>> {
        const allViewModels = await this.queryRepository.fetchMany();

        const availableEntityViewModels = allViewModels.filter(
            (digitalText) => digitalText.isPublished || digitalText.hasReadAccess(userWithGroups)
        );

        const commandContext = DigitalTextViewModel;

        return {
            // Here we mix-in the detail-scoped actions.
            entities: availableEntityViewModels.map((entityViewModel) =>
                this.transform(entityViewModel, userWithGroups)
            ),
            indexScopedActions: this.fetchUserActions(userWithGroups, [commandContext]),
            page: 1,
            count: availableEntityViewModels.length,
        };
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184098960]
     *
     * Inherit from a shared base aggregate query service and share this logic with other
     * query services. Note that we may do this differently now that we are moving
     * to event sourcing and full CQRS.
     */
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) => {
            // @ts-expect-error fix me
            if (systemUser === false) {
                return [];
            }

            return systemUser?.isAdmin()
                ? this.commandInfoService.getCommandForms(commandContext)
                : [];
        });
    }

    private transform(view: DigitalTextViewModel, userWithGroups: CoscradUserWithGroups) {
        const transformed = view as unknown as IDigitalTextViewModel;

        transformed.actions = this.fetchUserActions(userWithGroups, [
            view as unknown as CommandContext,
        ]);

        return transformed;
    }
}

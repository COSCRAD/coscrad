import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IDigitalTextViewModel,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';

import { CommandInfoService } from '../../app/controllers/command/services/command-info-service';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { Maybe } from '../../lib/types/maybe';
import { NotFound, isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { IAggregateRootQueryRepository } from '../interfaces';
import { DigitalTextQueryRepository } from './digital-text.query-repository';
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
        @Inject(DigitalTextQueryRepository)
        protected readonly queryRepository: IAggregateRootQueryRepository<IDigitalTextViewModel>,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    public async fetchById(
        id: string,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IDetailQueryResult<IDigitalTextViewModel>>> {
        //  TODO Use the repository to fetch this
        const hydratedViewModel = await this.queryRepository.fetchById(id);

        if (isNotFound(hydratedViewModel)) return NotFound;

        if (this.isVisibleToUser(hydratedViewModel, userWithGroups)) {
            // TODO should we remove any fields?
            const withActions = {
                ...cloneToPlainObject(hydratedViewModel),
                actions: this.fetchUserActions(userWithGroups, [
                    // Is there a more graceful way to handle the type mismatch?
                    hydratedViewModel as unknown as CommandContext,
                ]),
            };

            return withActions;
        }

        return NotFound;
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
            entities: availableEntityViewModels.map((entityViewModel) => ({
                ...cloneToPlainObject(entityViewModel),
                actions: this.fetchUserActions(userWithGroups, [
                    entityViewModel as unknown as CommandContext,
                ]),
            })),
            indexScopedActions: this.fetchUserActions(userWithGroups, [commandContext]),
        };
    }

    private isVisibleToUser(
        viewModel: { isPublished: boolean; hasReadAccess: (uwg: CoscradUserWithGroups) => boolean },
        userWithGroups: CoscradUserWithGroups
    ): boolean {
        return viewModel.isPublished || viewModel.hasReadAccess(userWithGroups);
    }

    private buildCompositeIdentifier(id: AggregateId): AggregateCompositeIdentifier {
        return {
            type: `digitalText` as AggregateType,
            id,
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
}

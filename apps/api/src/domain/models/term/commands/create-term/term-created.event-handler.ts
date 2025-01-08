import { AggregateType, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { TermCreated } from './term-created.event';

@CoscradEventConsumer('TERM_CREATED')
export class TermCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository,
        private readonly commandInfoService: CommandInfoService
    ) {}

    async handle(event: TermCreated): Promise<void> {
        // TODO use dynamic registration
        // Can we remove this now?
        if (!event.isOfType('TERM_CREATED')) return;

        const { meta: { contributorIds = [] } = { contributorIds: [] } } = event;

        const term = TermViewModel.fromTermCreated(event);

        const availableCommandTypes: string[] = ['TRANSLATE_TERM'];

        /**
         * TODO We want to introduce a new method
         * commandInfoService.find()
         * that filters out just the action we are currently adding
         * or removing.
         */
        const actions: ICommandFormAndLabels[] = this.commandInfoService.getCommandForms({
            getAvailableCommands: () => availableCommandTypes,
            getCompositeIdentifier: () => ({
                type: AggregateType.term,
                id: term.id,
            }),
        });

        term.appendActions(actions);

        await this.termRepository.create(term);

        // TODO make this operation atomic, extensible
        await this.termRepository.attribute(term.id, contributorIds);
    }
}

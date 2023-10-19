import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { DeluxeInMemoryStore } from '../../../../..//domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../..//domain/types/ResourceType';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import getInstanceFactoryForResource from '../../../../factories/getInstanceFactoryForResource';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Term } from '../../entities/term.entity';
import { CreatePromptTerm } from './create-prompt-term.command';
import { PromptTermCreated } from './prompt-term-created.event';

@CommandHandler(CreatePromptTerm)
export class CreatePromptTermCommandHandler extends BaseCreateCommandHandler<Term> {
    protected createNewInstance({
        text: promptText,
        aggregateCompositeIdentifier: { id },
        contributorId,
    }: CreatePromptTerm): ResultOrError<Term> {
        const text = new MultilingualText({
            items: [
                new MultilingualTextItem({
                    // prompt is always in English
                    languageCode: LanguageCode.English,
                    /**
                     * Note that the multilingual text does not track a
                     * prompt role. Rather, the prompt text is the original, and
                     * the elicted text will have a role that marks it as such.
                     */
                    role: MultilingualTextItemRole.original,
                    text: promptText,
                }),
            ],
        });

        const factory = getInstanceFactoryForResource(ResourceType.term);

        const createDto = {
            type: AggregateType.term,
            id,
            text,
            contributorId,
            published: false,
            isPromptTerm: true,
        };

        // TODO Rewrite the base create handler to take in a createDto only
        return factory(createDto) as ResultOrError<Term>;
    }

    protected async fetchRequiredExternalState(_?: ICommand): Promise<InMemorySnapshot> {
        const allTerms = await this.repositoryProvider.forResource(AggregateType.term).fetchMany();

        return new DeluxeInMemoryStore({
            [AggregateType.term]: allTerms.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(state: InMemorySnapshot, term: Term): InternalError | Valid {
        return term.validateExternalState(state);
    }

    protected buildEvent(command: CreatePromptTerm, eventId: string, userId: string): BaseEvent {
        return new PromptTermCreated(command, eventId, userId);
    }
}
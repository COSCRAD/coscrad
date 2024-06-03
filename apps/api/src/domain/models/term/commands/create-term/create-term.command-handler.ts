import { CommandHandler } from '@coscrad/commands';
import { HasText } from '../../../../../domain/repositories/specifications';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { Term } from '../../entities/term.entity';
import { CreateTerm } from './create-term.command';
import { TermCreated } from './term-created.event';

@CommandHandler(CreateTerm)
export class CreateTermCommandHandler extends BaseCreateCommandHandler<Term> {
    protected createNewInstance({
        text,
        aggregateCompositeIdentifier: { id },
        languageCode,
    }: CreateTerm): ResultOrError<Term> {
        return new Term({
            type: AggregateType.term,
            id,
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            // You must run `ADD_AUDIO_FOR_TERM`
            audio: new MultilingualAudio({
                items: [],
            }),
            // You must run `PUBLISH_RESOURCE` to publish the term
            published: false,
            isPromptTerm: false,
        });
    }

    protected async fetchRequiredExternalState({
        aggregateCompositeIdentifier: { id },
        text,
    }: CreateTerm): Promise<InMemorySnapshot> {
        const allTerms = [];

        /**
         * TODO
         * 1. We need to make specifications composable via Or \ And \ Not so that
         * we can do this in a single atomic transaction
         */
        const [searchForTermsWithSameId, searchForTermsWithSameText] = await Promise.all([
            this.repositoryProvider.forResource(AggregateType.term).fetchById(id),
            // @ts-expect-error Fix types here
            this.repositoryProvider.forResource(AggregateType.term).fetchMany(new HasText(text)),
        ]);

        if (searchForTermsWithSameText.length > 0) {
            allTerms.push(...searchForTermsWithSameText.filter(validAggregateOrThrow));
        }

        if (!isNotFound(searchForTermsWithSameId)) {
            if (isInternalError(searchForTermsWithSameId)) {
                throw new InternalError(
                    `Failed to create a new term due to an invalid existing term with the same ID`,
                    [searchForTermsWithSameId]
                );
            }

            allTerms.push(searchForTermsWithSameId);
        }

        return new DeluxeInMemoryStore({
            [AggregateType.term]: allTerms,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(state: InMemorySnapshot, term: Term): InternalError | Valid {
        /**
         * As it stands, we allow multiple terms with the same text.
         */
        return term.validateExternalState(state);
    }

    protected buildEvent(command: CreateTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new TermCreated(command, eventMeta);
    }
}

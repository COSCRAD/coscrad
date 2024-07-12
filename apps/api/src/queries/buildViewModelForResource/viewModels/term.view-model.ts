import {
    AggregateType,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualText,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    PromptTermCreated,
    TermCreated,
    TermTranslated,
} from '../../../domain/models/term/commands';
import { AggregateId } from '../../../domain/types/AggregateId';

/**
 * This is the first view model leveraging a new approach that involves denormalized,
 * event-sourced, materialized views.
 */
export class TermViewModel implements IDetailQueryResult<ITermViewModel> {
    contributions: string[];

    name: IMultilingualText;

    id: AggregateId;

    // TODO Should this be multilingual audio?
    audioURL: string;

    actions: ICommandFormAndLabels[];

    // notes

    // tags

    // events ?

    // revision ?

    static fromTermCreated({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
        meta: { contributorIds },
    }: TermCreated): TermViewModel {
        const term = new TermViewModel();

        term.name = buildMultilingualTextWithSingleItem(text, languageCode);

        term.id = termId;

        term.contributions = contributorIds; // TODO join in contributors fully instead of by reference

        term.actions = []; // TODO build all actions here

        // term.notes = []; // there are no notes when the term is first created

        // term.tags = []; // there are no tags with the term is first created

        // set term.events here by applying the first event

        return term;
    }

    static fromPromptTermCreated({
        payload: {
            text,
            aggregateCompositeIdentifier: { id: termId },
        },
        meta: { contributorIds },
    }: PromptTermCreated): TermViewModel {
        const term = new TermViewModel();

        term.id = termId;

        // currently, prompts are in English- should we hard wire this on the event payload to be future safe?
        term.name = buildMultilingualTextWithSingleItem(text, LanguageCode.English);

        term.contributions = contributorIds; // TODO join in the contributor names

        term.actions = []; // TODO build these here

        // term.notes = []

        // term.tags = []

        return term;
    }

    apply(event: ICoscradEvent): TermViewModel {
        if (
            !event.isFor({
                type: AggregateType.term,
                id: this.id,
            })
        )
            return this;

        if (event.isOfType('TERM_TRANSLATED')) {
            const {
                payload: { translation, languageCode },
            } = event as TermTranslated;

            this.name.items.push({
                text: translation,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            return this;
        }

        if (event.isOfType('AUDIO_ADDED_FOR_TERM')) {
            // const {payload: {audioItemId}} = event as AudioAddedForTerm
            throw new Error(`Not implemented`);
        }

        // there is no handler for this event
        return this;
    }
}

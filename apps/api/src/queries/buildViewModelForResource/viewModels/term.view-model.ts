import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualText,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { TermCreated } from '../../../domain/models/term/commands';
import { AggregateId } from '../../../domain/types/AggregateId';

/**
 * This is the first view model leveraging a new approach that involves denormalized,
 * event-sourced, materialized views.
 */
export class TermViewModel implements IDetailQueryResult<ITermViewModel> {
    contributions: string[];

    name: IMultilingualText;

    id: AggregateId;

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
}

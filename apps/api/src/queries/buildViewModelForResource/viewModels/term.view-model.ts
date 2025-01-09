import {
    AggregateType,
    IMultilingualText,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import {
    PromptTermCreated,
    TermCreated,
    TermTranslated,
} from '../../../domain/models/term/commands';
import { AggregateId } from '../../../domain/types/AggregateId';
import { DTO } from '../../../types/DTO';

/**
 * This is the first view model leveraging a new approach that involves denormalized,
 * event-sourced, materialized views.
 */
export class TermViewModel implements ITermViewModel {
    contributions: { id: string; fullName: string }[];

    name: IMultilingualText;

    id: AggregateId;

    isPublished: boolean;

    mediaItemId?: string;

    actions: string[];

    accessControlList: AccessControlList;

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

        term.actions = []; // TODO build all actions here

        term.contributions = [];

        /**
         * The contributor should have access.
         */
        term.accessControlList = new AccessControlList().allowUsers(contributorIds);

        // term.notes = []; // there are no notes when the term is first created

        // term.tags = []; // there are no tags with the term is first created

        // set term.events here by applying the first event

        term.isPublished = false;

        return term;
    }

    static fromPromptTermCreated({
        payload: {
            text,
            aggregateCompositeIdentifier: { id: termId },
        },
    }: PromptTermCreated): TermViewModel {
        const term = new TermViewModel();

        term.id = termId;

        term.isPublished = false;

        // currently, prompts are in English- should we hard wire this on the event payload to be future safe?
        term.name = buildMultilingualTextWithSingleItem(text, LanguageCode.English);

        /**
         *  Note that the contributions must be handled separately as we need
         * to access the db to join in contributor names
         */

        term.actions = []; // TODO build these here

        // term.notes = []

        // term.tags = []

        return term;
    }

    static fromDto(dto: DTO<TermViewModel>): TermViewModel {
        const term = new TermViewModel();

        const { contributions, name, id, actions, accessControlList, mediaItemId, isPublished } =
            dto;

        term.contributions = contributions;

        term.name = name;

        term.id = id;

        term.actions = actions;

        if (!isNullOrUndefined(mediaItemId)) {
            term.mediaItemId = mediaItemId;
        }

        term.accessControlList = new AccessControlList(accessControlList);

        term.actions = actions;

        term.isPublished = isNullOrUndefined(isPublished) ? false : isPublished; // we want to be extra careful here

        return term;
    }

    appendAction(action: string): TermViewModel {
        this.actions.push(action);

        return this;
    }

    appendActions(actions: string[]): TermViewModel {
        for (const a of actions) {
            this.actions.push(a);
        }

        return this;
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

    public getAvailableCommands() {
        return this.actions;
    }

    public getCompositeIdentifier() {
        return {
            type: AggregateType.term,
            id: this.id,
        };
    }
}

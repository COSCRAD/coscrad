import {
    AggregateType,
    IMultilingualText,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    FromDomainModel,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
} from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextFromBilingualText } from '../../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import {
    PromptTermCreated,
    TermCreated,
    TermTranslated,
} from '../../../domain/models/term/commands';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';

const FromTerm = FromDomainModel(Term);

// TODO move this
class ContributionSummary {
    @NonEmptyString({
        label: 'contributor ID',
        description: 'ID of person who contributed to the creation or editing of this resource',
    })
    id: string;

    @NonEmptyString({
        label: 'full name',
        description: 'the first and last name of the contributor',
    })
    fullName: string;
}

/**
 * This is the first view model leveraging a new approach that involves denormalized,
 * event-sourced, materialized views.
 */
@CoscradDataExample<TermViewModel>({
    example: {
        id: buildDummyUuid(1),
        isPublished: true,
        accessControlList: new AccessControlList().toDTO(),
        actions: [],
        name: buildMultilingualTextFromBilingualText(
            {
                text: 'term (in the language)',
                languageCode: LanguageCode.Chilcotin,
            },
            {
                text: 'term (in English)',
                languageCode: LanguageCode.English,
            }
        ),
        contributions: [],
    },
})
export class TermViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
        // Can't we get this from reflection?
        isArray: true,
    })
    contributions: ContributionSummary[];

    @NestedDataType(MultilingualText, {
        label: 'name',
        // note that we call it `name` not `text` for consistency with other models
        description: 'name (text) includes the text as well as any translations for this term',
    })
    name: IMultilingualText;

    @FromTerm
    id: AggregateId;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource available to the public',
    })
    isPublished: boolean;

    @ReferenceTo(AggregateType.mediaItem)
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

        /**
         * Note that this must be written in the DB by the event-handler, as
         * we do not have access to the contributors in this scope.
         */
        term.contributions = [];

        /**
         * The contributor should have access.
         */
        term.accessControlList = new AccessControlList().allowUsers(contributorIds);

        // term.notes = []; // there are no notes when the term is first created

        // term.tags = []; // there are no tags with the term is first created

        // set term.events here by applying the first event

        term.isPublished = false;

        term.actions = [
            'TRANSLATE_TERM',
            'PUBLISH_RESOURCE',
            'ADD_AUDIO_FOR_TERM',
            'TAG_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'CREATE_NOTE_ABOUT_RESOURCE',
        ];

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

        term.actions = [
            'ELICIT_TERM_FROM_PROMPT',
            'PUBLISH_RESOURCE',
            'ADD_AUDIO_FOR_TERM',
            'TAG_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'CREATE_NOTE_ABOUT_RESOURCE',
        ];

        // term.notes = []

        // term.tags = []

        return term;
    }

    static fromDto(dto: DTO<TermViewModel>): TermViewModel {
        const term = new TermViewModel();

        const { contributions, name, id, actions, accessControlList, mediaItemId, isPublished } =
            dto;

        term.contributions = Array.isArray(contributions) ? contributions : [];

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

    public toDto(): DTO<TermViewModel> {
        return cloneToPlainObject(this);
    }

    public clone(overrides: DeepPartial<DTO<TermViewModel>>) {
        const dtoWithOverridesApplied = clonePlainObjectWithOverrides(this.toDto(), overrides);

        return TermViewModel.fromDto(dtoWithOverridesApplied);
    }

    public forUser(userWithGroups: CoscradUserWithGroups): Maybe<TermViewModel> {
        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            return this;
        }

        return NotFound;
    }
}

import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { AggregateRoot, UpdateMethod } from '../../../decorators';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import InvalidPublicationStatusError from '../../../domainModelValidators/errors/InvalidPublicationStatusError';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../build-aggregate-root-from-event-history';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CannotReuseAudioItemError } from '../../shared/multilingual-audio/errors';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import {
    AudioAddedForTerm,
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../commands';
import { CREATE_PROMPT_TERM } from '../commands/create-prompt-term/constants';
import { CREATE_TERM } from '../commands/create-term/constants';
import { TRANSLATE_TERM } from '../commands/translate-term/constants';
import {
    CannotElicitTermWithoutPromptError,
    CannotOverrideAudioForTermError,
    PromptLanguageMustBeUniqueError,
} from '../errors';

const isOptional = true;

@AggregateRoot(AggregateType.term)
@RegisterIndexScopedCommands([CREATE_TERM, CREATE_PROMPT_TERM])
export class Term extends Resource {
    readonly type: ResourceType = ResourceType.term;

    @BooleanDataType({
        // TODO Write a migration and make this prop required on incoming DTOs
        isOptional: true,
        label: 'is prompt term',
        description: 'flag for whether or not this is a prompt term',
    })
    isPromptTerm?: boolean;

    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'the text for the term',
    })
    text: MultilingualText;

    /**
     * Note  that eventually, we will track contributions as follows. Every
     * command can be executed `onBehalfOfContributorWithId`. If this is specified,
     * the corresponding event will be attributed to the contributor with this ID.
     * Otherwise, it will be attributed to the system user.
     */
    readonly contributions?: ContributorAndRole[];

    @NestedDataType(MultilingualAudio, {
        label: 'multilingual audio',
        description: 'collection of references to audio for content in available langauges',
    })
    audio: MultilingualAudio;

    /**
     * TODO - This should be done via a tag or a note. Remove this property.
     */
    @NonEmptyString({
        isOptional,
        label: 'Source Project',
        description: 'the name of the project through which the term was collected',
    })
    readonly sourceProject?: string;

    // The constructor should only be called after validating the input DTO
    constructor(dto: DTO<Term>) {
        super({ ...dto, type: ResourceType.term });

        // This should only happen in the validation context
        if (isNullOrUndefined(dto)) return;

        const {
            contributions: contributorAndRoles,
            audio: audioDto,
            sourceProject,
            text,
            isPromptTerm,
        } = dto;

        this.text = new MultilingualText(text);

        this.contributions = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.audio = isNonEmptyObject(audioDto) ? new MultilingualAudio(audioDto) : undefined;

        this.sourceProject = sourceProject;

        // we default to false for pre existing data
        this.isPromptTerm = isNullOrUndefined(isPromptTerm) ? false : isPromptTerm;
    }

    getName(): MultilingualText {
        return this.text.clone();
    }

    hasAudio(): boolean {
        return !this.audio.isEmpty();
    }

    hasAudioIn(languageCode: LanguageCode): boolean {
        return this.hasAudio() && this.audio.hasAudioIn(languageCode);
    }

    hasAudioItem(audioItemId: AggregateId): boolean {
        return this.hasAudio() && this.audio.hasAudioItem(audioItemId);
    }

    getIdForAudioIn(languageCode: LanguageCode): Maybe<AggregateId> {
        if (!this.hasAudio()) return NotFound;

        return this.audio.getIdForAudioIn(languageCode);
    }

    @UpdateMethod()
    translate(text: string, languageCode: LanguageCode): ResultOrError<Term> {
        const textUpdateResult = this.text.translate(
            new MultilingualTextItem({
                role: MultilingualTextItemRole.freeTranslation,
                languageCode,
                text,
            })
        );

        if (isInternalError(textUpdateResult)) return textUpdateResult;

        this.text = textUpdateResult;

        return this;
    }

    @UpdateMethod()
    addAudio(audioItemId: string, languageCode: LanguageCode): ResultOrError<Term> {
        if (this.hasAudioIn(languageCode)) {
            return new CannotOverrideAudioForTermError(
                this.id,
                languageCode,
                audioItemId,
                this.getIdForAudioIn(languageCode) as AggregateId
            );
        }

        if (this.hasAudioItem(audioItemId)) {
            return new CannotReuseAudioItemError(audioItemId);
        }

        const audioUpdateResult = this.audio.addAudio(audioItemId, languageCode);

        if (isInternalError(audioUpdateResult)) return audioUpdateResult;

        this.audio = audioUpdateResult;

        return this;
    }

    @UpdateMethod()
    elicitFromPrompt(text: string, languageCode: LanguageCode): ResultOrError<Term> {
        if (!this.isPromptTerm) return new CannotElicitTermWithoutPromptError(this.id);

        const { languageCode: promptLanguagecode } = this.text.getOriginalTextItem();

        if (languageCode === promptLanguagecode)
            return new PromptLanguageMustBeUniqueError(this.id, languageCode);

        const textUpdateResult = this.text.translate(
            new MultilingualTextItem({
                role: MultilingualTextItemRole.elicitedFromPrompt,
                languageCode,
                text,
            })
        );

        if (isInternalError(textUpdateResult)) return textUpdateResult;

        this.text = textUpdateResult;

        return this;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [TRANSLATE_TERM];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { text, published } = this;

        const textValidationResult = text.validateComplexInvariants();

        if (!isValid(textValidationResult)) allErrors.push(textValidationResult);

        // isn't this a simple invariant?
        if (typeof published !== 'boolean')
            allErrors.push(new InvalidPublicationStatusError(ResourceType.term));

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    // TODO We should 'goodlist' properties that can be targets for this context as well
    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        termId: AggregateId
    ): Maybe<ResultOrError<Term>> {
        const creationEventHandlerMap: CreationEventHandlerMap<Term> = new Map()
            .set(`TERM_CREATED`, Term.createTermFromTermCreated)
            .set(`PROMPT_TERM_CREATED`, Term.createTermFromPromptTermCreated);

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.term,
                id: termId,
            },
            // TODO think about the order of parameters
            eventStream
        );
    }

    // should these be protected?
    /**
     * Event handlers
     */
    handleTermTranslated({ payload: { translation, languageCode } }: TermTranslated) {
        return this.translate(translation, languageCode);
    }

    handleTermElicitedFromPrompt({ payload: { text, languageCode } }: TermElicitedFromPrompt) {
        return this.elicitFromPrompt(text, languageCode);
    }

    handleAudioAddedForTerm({ payload: { audioItemId, languageCode } }: AudioAddedForTerm) {
        return this.addAudio(audioItemId, languageCode);
    }

    private static createTermFromTermCreated(event: TermCreated) {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                text,
                languageCode,
            },
        } = event;

        return new Term({
            type: AggregateType.term,
            id,
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            // Terms are not published by default
            published: false,
            audio: new MultilingualAudio({
                items: [],
            }),
        });
    }

    private static createTermFromPromptTermCreated(event: PromptTermCreated): Term {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                text,
            },
        } = event;

        return new Term({
            type: AggregateType.term,
            id,
            // At present, prompts are only in English
            text: buildMultilingualTextWithSingleItem(text, LanguageCode.English),
            isPromptTerm: true,
            audio: new MultilingualAudio({
                items: [],
            }),
            // terms are not published by default
            published: false,
        });
    }
}

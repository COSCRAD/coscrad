import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { AggregateRoot } from '../../../decorators';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import InvalidPublicationStatusError from '../../../domainModelValidators/errors/InvalidPublicationStatusError';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { BaseEvent } from '../../shared/events/base-event.entity';
import {
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPromptPayload,
    TermTranslatedPayload,
} from '../commands';
import { CREATE_PROMPT_TERM, PROMPT_TERM_CREATED } from '../commands/create-prompt-term/constants';
import { CREATE_TERM, TERM_CREATED } from '../commands/create-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../commands/elicit-term-from-prompt/constants';
import { TERM_TRANSLATED, TRANSLATE_TERM } from '../commands/translate-term/constants';
import { CannotElicitTermWithoutPromptError, PromptLanguageMustBeUniqueError } from '../errors';

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
    readonly isPromptTerm?: boolean;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'text (language)',
    //     description: 'the term in the language',
    // })
    // readonly term?: string;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'text (colonial language)',
    //     description: 'the text in the colonial language',
    // })
    // readonly termEnglish?: string;

    /**
     * TODO We will need a migration for this change
     */
    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'the text for the term',
    })
    readonly text: MultilingualText;

    /**
     * Note  that eventually, we will track contributions as follows. Every
     * command can be executed `onBehalfOfContributorWithId`. If this is specified,
     * the corresponding event will be attributed to the contributor with this ID.
     * Otherwise, it will be attributed to the system user.
     */
    @NonEmptyString({
        isOptional: true,
        label: 'contributor ID',
        description: 'reference to the contributor for this term',
    })
    readonly contributorId?: AggregateId;

    /**
     * TODO Make this a mediaItemId
     */
    @NonEmptyString({
        isOptional,
        label: 'Audio Filename',
        description: 'a url link to the audio file',
    })
    readonly audioFilename?: string;

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

        const { contributorId, audioFilename, sourceProject, text, isPromptTerm } = dto;

        this.text = new MultilingualText(text);

        this.contributorId = contributorId;

        this.audioFilename = audioFilename;

        this.sourceProject = sourceProject;

        // we default to false for pre existing data
        this.isPromptTerm = isNullOrUndefined(isPromptTerm) ? false : isPromptTerm;
    }

    getName(): MultilingualText {
        return this.text.clone();
    }

    translate(text: string, languageCode: LanguageCode): ResultOrError<Term> {
        const textUpdateResult = this.text.translate(
            new MultilingualTextItem({
                role: MultilingualTextItemRole.freeTranslation,
                languageCode,
                text,
            })
        );

        if (isInternalError(textUpdateResult)) return textUpdateResult;

        return this.safeClone<Term>({
            text: textUpdateResult,
        });
    }

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

        return this.safeClone<Term>({
            text: textUpdateResult,
        });
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
        const compositeIdentifier = {
            type: AggregateType.term,
            id: termId,
        };

        const eventsForThisTerm = eventStream.filter((event) => event.isFor(compositeIdentifier));

        if (eventsForThisTerm.length === 0) {
            return NotFound;
        }

        const [creationEvent, ...updateEvents] = eventsForThisTerm;

        const initialTerm = Term.createTermFromEvent(creationEvent);

        return updateEvents.reduce((accumulatedTerm, nextEvent) => {
            if (isInternalError(accumulatedTerm)) return accumulatedTerm;

            if (nextEvent.isOfType(TERM_TRANSLATED)) {
                const { translation, languageCode } = nextEvent.payload as TermTranslatedPayload;

                return accumulatedTerm
                    .addEventToHistory(nextEvent)
                    .translate(translation, languageCode);
            }

            if (nextEvent.isOfType(TERM_ELICITED_FROM_PROMPT)) {
                const { text, languageCode } = nextEvent.payload as TermElicitedFromPromptPayload;

                return accumulatedTerm
                    .addEventToHistory(nextEvent)
                    .elicitFromPrompt(text, languageCode);
            }

            // no event handler found for this event - no update
            return accumulatedTerm;
        }, initialTerm);
    }

    // TODO Find a different pattern of code organization. This feels too Java-ish.
    private static createTermFromEvent(creationEvent: BaseEvent): Term {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
            },
        } = creationEvent;

        if (creationEvent.isOfType(TERM_CREATED)) {
            return Term.createTermFromTermCreated(creationEvent as TermCreated);
        }

        if (creationEvent.isOfType(PROMPT_TERM_CREATED)) {
            return Term.createTermFromPromptTermCreated(creationEvent as PromptTermCreated);
        }

        // TODO Let's breakout a shared error class for this
        throw new InternalError(
            `The first event for ${formatAggregateCompositeIdentifier({
                type: AggregateType.term,
                id,
            })} should have had one of the types: ${TERM_CREATED},${PROMPT_TERM_CREATED}, but found: ${
                creationEvent?.type
            }`
        );
    }

    private static createTermFromTermCreated(event: TermCreated) {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                text,
                languageCode,
                contributorId,
            },
        } = event;

        return new Term({
            type: AggregateType.term,
            id,
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            contributorId,
            // Terms are not published by default
            published: false,
        }).addEventToHistory(event);
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
            // terms are not published by default
            published: false,
        }).addEventToHistory(event);
    }
}

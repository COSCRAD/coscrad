import { CompositeIdentifier, NonEmptyString } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../lib/types/maybe';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { Valid, isValid } from '../../domainModelValidators/Valid';
import TagLabelAlreadyInUseError from '../../domainModelValidators/errors/tag/TagLabelAlreadyInUseError';
import { HasLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { CategorizableType, isCategorizableType } from '../../types/CategorizableType';
import { InMemorySnapshot } from '../../types/ResourceType';
import { Aggregate } from '../aggregate.entity';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../build-aggregate-root-from-event-history';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../shared/events/base-event.entity';
import { TagRelabelled } from './commands';
import { TagCreated } from './commands/create-tag/tag-created.event';
import { DuplicateTagError } from './commands/errors';
import { ResourceOrNoteTagged } from './commands/tag-resource-or-note/resource-or-note-tagged.event';

@RegisterIndexScopedCommands(['CREATE_TAG'])
export class Tag extends Aggregate implements HasLabel {
    type = AggregateType.tag;

    id: AggregateId;

    @NonEmptyString({
        label: 'label',
        description: 'a human readable text label for this tag',
    })
    label: string;

    @CompositeIdentifier(CategorizableType, isCategorizableType, {
        isArray: true,
        label: 'members',
        description: 'the composite identifier of every resource or note with this tag',
    })
    members: CategorizableCompositeIdentifier[];

    constructor(dto: DTO<Tag>) {
        super(dto);

        if (!dto) return;

        const { id, label, members } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
    }

    getName(): MultilingualText {
        // TODO Should tag labels be multilingual text?
        return buildMultilingualTextWithSingleItem(this.label);
    }

    isFor(categorizableCompositeIdentifier: CategorizableCompositeIdentifier) {
        return this.members.some((compositeId) =>
            isDeepStrictEqual(compositeId, categorizableCompositeIdentifier)
        );
    }

    relabel(newLabel: string) {
        return this.safeClone<Tag>({
            label: newLabel,
        });
    }

    addMember(taggedMemberCompositeIdentifier: CategorizableCompositeIdentifier) {
        /**
         * Note that this is catching what would eventually be an invariant
         * validation error sooner rather than later.
         */
        if (
            this.members.some(({ type, id }) => {
                const isMatch =
                    type === taggedMemberCompositeIdentifier.type &&
                    id === taggedMemberCompositeIdentifier.id;

                return isMatch;
            })
        )
            return new DuplicateTagError(this.label, taggedMemberCompositeIdentifier);

        return this.safeClone<Tag>({
            members: this.members.concat(taggedMemberCompositeIdentifier),
        });
    }

    getAvailableCommands(): string[] {
        return ['RELABEL_TAG'];
    }

    validateLabelAgainstExternalState(externalState: InMemorySnapshot): ValidationResult {
        const labelCollisionErrors = externalState.tag
            .filter(({ label }) => label === this.label)
            .map(({ id, label }) => new TagLabelAlreadyInUseError(label, id));

        return labelCollisionErrors.length > 0
            ? new InvalidExternalStateError(labelCollisionErrors)
            : Valid;
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const baseValidationErrors = super.validateExternalState(externalState);

        const labelValidationResult = this.validateLabelAgainstExternalState(externalState);

        // There must be a better pattern for composing these
        const allErrors = [
            ...(isValid(baseValidationErrors) ? [] : baseValidationErrors.innerErrors),
            ...(isValid(labelValidationResult) ? [] : labelValidationResult.innerErrors),
        ];

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    protected validateComplexInvariants(): InternalError[] {
        /**
         * TODO This could be a simple invariant rule if we introduce an `@Set` decorator.
         */
        const duplicateMembers: AggregateCompositeIdentifier[] = this.members.reduce(
            (
                {
                    seen,
                    duplicated,
                }: {
                    duplicated: AggregateCompositeIdentifier[];
                    seen: AggregateCompositeIdentifier[];
                },
                next: AggregateCompositeIdentifier
            ) => {
                if (seen.some((compId) => isDeepStrictEqual(compId, next)))
                    return {
                        seen,
                        duplicated: [...duplicated, next],
                    };

                return {
                    seen: [...seen, next],
                    duplicated,
                };
            },
            {
                duplicated: [],
                seen: [],
            }
        ).duplicated;

        const buildError = (compositeIdentifier: CategorizableCompositeIdentifier) =>
            new DuplicateTagError(this.label, compositeIdentifier);

        // TODO test coverage for invariant validator
        // This will be `[]` if there were no duplicated members
        return duplicateMembers.map(buildError);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        // Avoid shared references
        return this.members.map(cloneToPlainObject);
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        tagId: AggregateId
    ): Maybe<ResultOrError<Tag>> {
        const creationEventHandlerMap: CreationEventHandlerMap<Tag> = new Map().set(
            'TAG_CREATED',
            Tag.createTagFromTagCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.tag,
                id: tagId,
            },
            eventStream
        );
    }

    handleResourceOrNoteTagged({
        payload: { taggedMemberCompositeIdentifier },
    }: ResourceOrNoteTagged): ResultOrError<Tag> {
        return this.addMember(taggedMemberCompositeIdentifier);
    }

    handleTagRelabelled({ payload: { newLabel } }: TagRelabelled) {
        return this.relabel(newLabel);
    }

    private static createTagFromTagCreated(event: TagCreated): ResultOrError<Tag> {
        const {
            aggregateCompositeIdentifier: { id: tagId },
            label,
        } = event.payload;

        const buildResult = new Tag({
            type: AggregateType.tag,
            id: tagId,
            label,
            members: [],
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            return invariantValidationResult;
        }

        return buildResult;
    }
}

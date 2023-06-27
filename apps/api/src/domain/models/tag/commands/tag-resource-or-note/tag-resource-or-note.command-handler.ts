import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid, isValid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { CategorizableType } from '../../../../types/CategorizableType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, isResourceType } from '../../../../types/ResourceType';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { Tag } from '../../tag.entity';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';
import { TagResourceOrNote } from './tag-resource-or-note.command';

@CommandHandler(TagResourceOrNote)
export class TagResourceOrNoteCommandHandler extends BaseUpdateCommandHandler<Tag> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Tag>;

    protected aggregateType: AggregateType = AggregateType.tag;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.getTagRepository();
    }

    protected async fetchRequiredExternalState({
        taggedMemberCompositeIdentifier: { type: categorizableType, id },
    }: TagResourceOrNote): Promise<InMemorySnapshot> {
        const repository =
            categorizableType === CategorizableType.note
                ? this.repositoryProvider.getEdgeConnectionRepository()
                : this.repositoryProvider.forResource(categorizableType);

        const searchResult = await repository.fetchById(id);

        return new DeluxeInMemoryStore({
            [categorizableType]: isNotFound(searchResult) ? [] : [searchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        tag: Tag,
        { taggedMemberCompositeIdentifier }: TagResourceOrNote
    ): ResultOrError<Tag> {
        return tag.addMember(taggedMemberCompositeIdentifier);
    }

    protected validateExternalState(state: InMemorySnapshot, tag: Tag): InternalError | Valid {
        const labelCollisionErrors = tag.validateLabelAgainstExternalState(state);

        return labelCollisionErrors;
    }

    protected async validateAdditionalConstraints(
        command: TagResourceOrNote
    ): Promise<InternalError | typeof Valid> {
        const {
            taggedMemberCompositeIdentifier,
            aggregateCompositeIdentifier: tagCompositeIdentifier,
        } = command;

        const { type: resourceType, id } = taggedMemberCompositeIdentifier;

        const baseValidationResult = await super.validateAdditionalConstraints(
            taggedMemberCompositeIdentifier
        );

        const baseValidationErrors = isValid(baseValidationResult) ? [] : [baseValidationResult];

        const repositoryForCategorizable = isResourceType(resourceType)
            ? this.repositoryProvider.forResource(resourceType)
            : this.repositoryProvider.getEdgeConnectionRepository();

        const taggedResourceSearchResult = await repositoryForCategorizable.fetchById(id);

        const resourceSearchErrors = isNotFound(taggedResourceSearchResult)
            ? [
                  new InvalidExternalReferenceByAggregateError(tagCompositeIdentifier, [
                      taggedMemberCompositeIdentifier,
                  ]),
              ]
            : [];

        const allErrors = [...baseValidationErrors, ...resourceSearchErrors];

        return allErrors.length > 0
            ? new InternalError(`The command has failed due to invalid existing state.`, allErrors)
            : Valid;
    }

    protected buildEvent(command: TagResourceOrNote, eventId: string, userId: string): BaseEvent {
        return new ResourceOrNoteTagged(command, eventId, userId);
    }
}

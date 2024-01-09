import {
    AggregateType,
    CategorizableCompositeIdentifier,
    ITagViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { TagCreatedPayload } from '../../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTaggedPayload } from '../../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { Tag } from '../../../domain/models/tag/tag.entity';
import { AggregateId } from '../../../domain/types/AggregateId';
import { DTO } from '../../../types/DTO';
import { BaseEvent } from '../../event-sourcing';

/**
 * We are moving to event sourcing of views for all resources and potentially all
 * aggregate roots. In the interim, we use our old state-based Tag view model
 * in the Tag query service. However, we need an event sourced tag model that
 * can help us create a denormalized representation of the tags for a given
 * resource. Hence the redundancy between this class and `TagViewModel`.
 */
export class EventSourcedTagViewModel implements ITagViewModel {
    type = AggregateType.tag;

    @FromDomainModel(Tag)
    id: AggregateId;

    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    @FromDomainModel(Tag)
    label: string;

    @FromDomainModel(Tag)
    members: CategorizableCompositeIdentifier[] = [];

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name',
    })
    name: MultilingualText;

    constructor(id: AggregateId) {
        this.id = id;
    }

    apply(event: BaseEvent): EventSourcedTagViewModel {
        const { payload, type: eventType } = event;

        if (this.isForMe(payload)) {
            if (eventType === 'TAG_CREATED') {
                const { label } = payload as TagCreatedPayload;

                this.label = label;

                /**
                 * We currently only support tag labels in English.
                 *
                 * In the future, we may want to make these translateable.
                 */
                this.name = buildMultilingualTextWithSingleItem(label, LanguageCode.English);

                return this;
            }

            /**
             * TODO We eventually want to join in the full view model for each
             * resource or note that is a member for efficiency.
             */
            if (eventType === 'RESOURCE_OR_NOTE_CREATED') {
                const { taggedMemberCompositeIdentifier } = payload as ResourceOrNoteTaggedPayload;

                this.members = this.members.concat(taggedMemberCompositeIdentifier);

                return this;
            }
        }

        return this;
    }

    /**
     * @param events A temporally ordered event history, filtered for this particular aggregate.
     * @returns `DigitalTextViewModel`
     */
    applyStream(events: BaseEvent[]) {
        return events.reduce((viewModel, event) => viewModel.apply(event), this);
    }

    private isForMe({
        aggregateCompositeIdentifier: { type, id },
    }: {
        aggregateCompositeIdentifier: { type: string; id: string };
    }) {
        return type === this.type && id === this.id;
    }

    static fromSnapshot({
        id,
        label,
        members,
        name,
    }: DTO<EventSourcedTagViewModel>): EventSourcedTagViewModel {
        /**
         * Note that the flow is
         * databaseDocument -> snapshot (viewDto) -> fromSnapshot -> eventHandler
         * -> database update
         *
         * There is no need to clone on write, as the updates are controlled
         * and the references are short-lived.
         */
        const tag = new EventSourcedTagViewModel(id);

        tag.label = label;

        tag.members = members;

        tag.name = new MultilingualText(name);

        return tag;
    }
}

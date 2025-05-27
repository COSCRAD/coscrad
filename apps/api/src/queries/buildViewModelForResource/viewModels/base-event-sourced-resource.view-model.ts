import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, UUID } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../../domain/models/user-management';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { TagViewModel } from './tag.view-model';
import { EventSourcedTagViewModel } from './tag.view-model.event-sourced';
// import { EventSourcedTagViewModel } from './tag.view-model.event-sourced';

/**
 * We are slowly phasing out the `BaseResourceViewModel`, which is state-based,
 * in favor of event sourced views.
 */
export abstract class BaseEventSourcedResourceViewModel
    implements HasAggregateId, DetailScopedCommandWriteContext
{
    abstract type: ResourceType;

    @UUID({
        label: 'id',
        description: 'system identifier for this resource',
    })
    id: AggregateId;

    @NestedDataType(MultilingualText, {
        label: 'name',
        // note that we call it `name` not `text` for consistency with other models
        description: 'name (text) includes the text as well as any translations for this term',
    })
    name: MultilingualText;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource available to the public',
    })
    isPublished: boolean;

    accessControlList: AccessControlList;

    // TODO add notes

    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
        // Can't we get this from reflection?
        isArray: true,
    })
    contributions: ContributionSummary[];

    @NestedDataType(TagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    constructor(dto: DTO<BaseEventSourcedResourceViewModel>) {
        if (!dto) return;

        const { contributions, name, id, accessControlList, tags, isPublished } = dto;

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = new AccessControlList(accessControlList);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];
    }

    abstract getAvailableCommands(): string[];

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: this.type,
            id: this.id,
        };
    }

    // revision ?
}

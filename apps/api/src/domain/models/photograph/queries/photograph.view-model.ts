import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    UUID,
} from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { DetailScopedCommandWriteContext } from '../../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { ICoscradEvent } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { HasAggregateId } from '../../../types/HasAggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { PhotographCreated } from '../commands';

@CoscradDataExample<PhotographViewModel>({
    example: {
        type: ResourceType.photograph,
        id: buildDummyUuid(1),
        name: buildMultilingualTextWithSingleItem('nice photo'),
        photographer: 'Jane Deer',
        mediaItemId: buildDummyUuid(55),
        heightPx: 600,
        widthPx: 800,
        tags: [],
        isPublished: false,
        contributions: [],
        accessControlList: new AccessControlList().toDTO(),
        notes: [],
    },
})
export class PhotographViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    // extends BaseEventSourcedResourceViewModel {
    readonly type = ResourceType.photograph;

    /**
     * TODO extend base
     */

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
    tags: EventSourcedTagRecordForResourceViewModel[];

    @NestedDataType(NoteRecordForResourceViewModel, {
        label: 'notes',
        description: 'a list of contextualized notes about this resource',
        isArray: true,
    })
    notes: NoteRecordForResourceViewModel[];
    // end TODO extend base

    @UUID({
        label: 'media item',
        description: 'a reference to the raw media item for this photograph',
    })
    public mediaItemId: string;

    @ApiProperty()
    @NonEmptyString({
        label: 'photographer',
        description: 'the full name of the photographer responsible for this photograph',
    })
    public photographer: string;

    @ApiProperty()
    @PositiveInteger({
        label: 'Image Height PX',
        description: 'Height of the image in pixels',
    })
    public heightPx: number;

    @ApiProperty()
    @PositiveInteger({
        label: 'Image Height PX',
        description: 'Width of the image in pixels',
    })
    public widthPx: number;

    getAvailableCommands(): string[] {
        const allCommands = [
            'TAG_RESOURCE',
            'CREATE_NOTE_ABOUT_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'GRANT_RESOURCE_READ_ACCESS_TO_USER',
        ];

        if (!this.isPublished) {
            allCommands.push('PUBLISH_RESOURCE');
        } else {
            allCommands.push('UNPUBLISH_RESOURCE');
        }

        return allCommands;
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: AggregateType.photograph,
            id: this.id,
        };
    }

    constructor(dto: DTO<PhotographViewModel>) {
        // TODO extend base
        // super(dto);

        const { contributions, name, id, accessControlList, tags, isPublished, notes } = dto;

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = new AccessControlList(accessControlList);

        this.tags = Array.isArray(tags)
            ? tags.map((t) => new EventSourcedTagRecordForResourceViewModel(t))
            : [];

        if (Array.isArray(notes))
            this.notes = notes.map((n) => NoteRecordForResourceViewModel.fromDto(n));
        // end TODO extend base

        if (!dto) return;

        const { mediaItemId, photographer, heightPx, widthPx } = dto;

        this.photographer = photographer;

        this.mediaItemId = mediaItemId;

        this.heightPx = heightPx;

        this.widthPx = widthPx;
    }

    static fromPhotographCreated({
        payload: {
            title,
            languageCodeForTitle,
            photographer,
            mediaItemId,
            heightPx,
            widthPx,
            aggregateCompositeIdentifier: { id: photographId },
        },
    }: // contributions must be joined at a higher level
    // meta: { contributorIds },
    PhotographCreated): PhotographViewModel {
        return new PhotographViewModel({
            type: AggregateType.photograph,
            id: photographId,
            name: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            photographer,
            mediaItemId,
            heightPx,
            widthPx,
            tags: [],
            contributions: [], // joined above
            accessControlList: new AccessControlList(),
            isPublished: false,
            notes: [],
        });
    }

    static fromDto(dto: DTO<PhotographViewModel>): PhotographViewModel {
        return new PhotographViewModel(dto);
    }

    apply(event: ICoscradEvent): PhotographViewModel {
        if (
            !event.isFor({
                type: AggregateType.photograph,
                id: this.id,
            })
        )
            return this;

        // there is no handler for this event
        return this;
    }

    public forUser(
        userWithGroups?: CoscradUserWithGroups
    ): Maybe<Omit<PhotographViewModel, 'accessControlList'>> {
        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            return this;
        }

        return NotFound;
    }
}

import {
    AggregateType,
    ICommandFormAndLabels,
    LanguageCode,
    MIMEType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, UUID } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../../../app/controllers/command/services/command-info-service';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import {
    ConnectionRecordForResourceViewModel,
    TagViewModel,
} from '../../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextFromBilingualText } from '../../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateId } from '../../../../types/AggregateId';
import { HasAggregateId } from '../../../../types/HasAggregateId';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../../user-management';
import { Transcript } from '../../shared/entities/transcript.entity';
import { VideoCreated } from '../commands';

@CoscradDataExample<EventSourcedVideoViewModel>({
    example: {
        type: ResourceType.video,
        id: buildDummyUuid(6),
        actions: [],
        name: buildMultilingualTextFromBilingualText(
            { text: 'my video', languageCode: LanguageCode.English },
            { text: 'my video (clc)', languageCode: LanguageCode.Chilcotin }
        ),
        mediaItemId: buildDummyUuid(54),
        mimeType: MIMEType.mp4,
        lengthMilliseconds: 432120,
        transcript: Transcript.buildEmpty(),
        text: '',
        contributions: [],
        accessControlList: new AccessControlList(),
        isPublished: false,
        tags: [],
        notes: {},
        connections: [],
    },
})
export class EventSourcedVideoViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    readonly type = ResourceType.video;

    // TODO extend base

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
    tags: EventSourcedTagViewModel[];

    notes: Record<string, NoteRecordForResourceViewModel>;
    // end TODO extend base

    @NestedDataType(ConnectionRecordForResourceViewModel, {
        label: 'connections',
        description: 'a list of contextualized connections to other resources about with a note',
        isArray: true,
    })
    connections: ConnectionRecordForResourceViewModel[];

    actions: ICommandFormAndLabels[];
    mediaItemId: AggregateId;
    mimeType?: MIMEType;
    lengthMilliseconds: number;
    text: string;
    transcript?: Transcript;

    constructor(dto: DTO<EventSourcedVideoViewModel>) {
        if (!dto) return;

        // TODO extend base
        // super(dto);
        const {
            contributions,
            name,
            id,
            accessControlList,
            tags,
            isPublished,
            notes,
            connections,
        } = dto;

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

        this.notes = isNonEmptyObject(notes) ? cloneToPlainObject(notes) : {};
        // end TODO extend base

        if (Array.isArray(connections))
            this.connections = connections.map((n) =>
                ConnectionRecordForResourceViewModel.fromDto(n)
            );

        const { mediaItemId, transcript } = dto;

        this.mediaItemId = mediaItemId;

        if (isNonEmptyObject(transcript)) {
            this.transcript = new Transcript(transcript);
        }
    }

    getAvailableCommands(): string[] {
        return []; // TODO implement this!
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: AggregateType.video,
            id: this.id,
        };
    }

    static fromVideoCreated({
        payload: {
            aggregateCompositeIdentifier: { id: videoId },
            name,
            languageCodeForName,
            mediaItemId,
            lengthMilliseconds,
        },
        // note that attribution must be joined separately at the event consumer level
        meta: { contributorIds: _ },
    }: VideoCreated): EventSourcedVideoViewModel {
        return new EventSourcedVideoViewModel({
            type: ResourceType.video,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            mediaItemId,
            id: videoId,
            actions: [],
            contributions: [],
            isPublished: false,
            mimeType: MIMEType.mp4,
            text: '',
            lengthMilliseconds,
            // in order to grant access, we need a `RESOURCE_READ_ACCESS_GRANTED_TO_USER`
            accessControlList: new AccessControlList(),
            tags: [],
            notes: {},
            connections: [],
        });
    }

    public static fromDto(dto: DTO<EventSourcedVideoViewModel>) {
        return new EventSourcedVideoViewModel(dto);
    }
}

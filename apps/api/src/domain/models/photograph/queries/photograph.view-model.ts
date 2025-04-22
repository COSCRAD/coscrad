import { AggregateType, IMultilingualText } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    UUID,
} from '@coscrad/data-types';
import { isBoolean, isNullOrUndefined } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { DetailScopedCommandWriteContext } from '../../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
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
        name: buildMultilingualTextWithSingleItem('nice photo'),
        id: buildDummyUuid(1),
        photographer: 'Jane Deer',
        mediaItemId: buildDummyUuid(55),
        heightPx: 600,
        widthPx: 800,
        tags: [],
        actions: [],
        isPublished: false,
        contributions: [],
        accessControlList: new AccessControlList().toDTO(),
    },
})
export class PhotographViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    // TODO add decorators for this property
    public contributions: ContributionSummary[];

    @ApiProperty({
        type: MultilingualText,
    })
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'the name of this photograph',
    })
    public name: IMultilingualText;

    @ApiProperty()
    @UUID({
        label: 'ID',
        description: 'System identifier for this photograph',
    })
    public id: string;

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

    @ApiProperty({
        type: TagViewModel,
        isArray: true,
    })
    @NestedDataType(TagViewModel, {
        label: 'tags',
        description: 'the tags that apply to this photograph',
        isArray: true,
    })
    public tags: TagViewModel[];

    // note that these are mapped to form specifications in the query service layer
    @ApiProperty()
    public actions: string[];

    // TODO Should we remove this from the public view?
    @ApiProperty()
    @BooleanDataType({
        label: 'is published',
        description: 'a flag indicated if this photograph is available to the general public',
    })
    public isPublished: boolean;

    // notes

    // events ?

    // revision ?

    /**
     * This should be removed in query responses.
     *
     * Note that if we leverage `forUser`, we should be able to make this
     * private.
     * */
    public accessControlList: AccessControlList;

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
        meta: { contributorIds },
    }: PhotographCreated): PhotographViewModel {
        const photograph = new PhotographViewModel();

        photograph.name = buildMultilingualTextWithSingleItem(title, languageCodeForTitle);

        photograph.id = photographId;

        photograph.photographer = photographer;

        photograph.mediaItemId = mediaItemId;

        photograph.heightPx = heightPx;

        photograph.widthPx = widthPx;

        photograph.actions = [];

        /**
         * Note that this must be written in the DB by the event-handler, as
         * we do not have access to the contributors in this scope.
         */
        photograph.contributions = [];

        /**
         * The contributor should have access.
         */
        photograph.accessControlList = new AccessControlList().allowUsers(contributorIds);

        // photograph.notes = []; // there are no notes when the photograph is first created

        // photograph.tags = []; // there are no tags with the photograph is first created

        // set photograph.events here by applying the first event

        photograph.isPublished = false;

        photograph.actions = [
            'PUBLISH_RESOURCE',
            'TAG_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'CREATE_NOTE_ABOUT_RESOURCE',
        ];

        // note that a `RESOURCE_TAGGED` event must be handled to add tags
        photograph.tags = [];

        return photograph;
    }

    static fromDto(dto: DTO<PhotographViewModel>): PhotographViewModel {
        const photograph = new PhotographViewModel();

        if (isNullOrUndefined(dto)) {
            return photograph;
        }

        const {
            contributions,
            name,
            id,
            photographer,
            heightPx,
            widthPx,
            actions,
            accessControlList,
            mediaItemId,
            isPublished,
            // tags,
        } = dto;

        photograph.contributions = Array.isArray(contributions) ? contributions : [];

        photograph.name = name;

        photograph.id = id;

        photograph.photographer = photographer;

        photograph.heightPx = heightPx;

        photograph.widthPx = widthPx;

        photograph.actions = actions;

        photograph.accessControlList = new AccessControlList(accessControlList);

        photograph.isPublished = isBoolean(isPublished) ? isPublished : false;

        if (!isNullOrUndefined(mediaItemId)) {
            photograph.mediaItemId = mediaItemId;
        }

        /**
         * TODO Populate tags
         */
        photograph.tags = [];

        return photograph;
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

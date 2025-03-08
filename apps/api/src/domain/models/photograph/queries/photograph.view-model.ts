import { AggregateType, ContributorWithId, IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { DetailScopedCommandWriteContext } from '../../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ICoscradEvent } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { HasAggregateId } from '../../../types/HasAggregateId';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { PhotographCreated } from '../commands';

export class PhotographViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    public contributions: ContributorWithId[];

    @ApiProperty({
        type: MultilingualText,
    })
    public name: IMultilingualText;

    @ApiProperty()
    public id: string;

    @ApiProperty()
    public photographer: string;

    // Do we need pixel height and width?

    mediaItemId?: string;

    // note that these are mapped to form specifications in the query service layer
    @ApiProperty()
    public actions: string[];

    @ApiProperty()
    public isPublished: boolean;

    /**
     * This should be removed in query responses.
     *
     * Note that if we leverage `forUser`, we should be able to make this
     * private.
     * */
    public accessControlList: AccessControlList;

    getAvailableCommands(): string[] {
        /**
         * TODO Let's not cache actions on the view documents. Let's instead
         * project off the view model state to determine the available commands types.
         */
        return this.actions || [];
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: AggregateType.photograph,
            id: this.id,
        };
    }

    // notes

    // tags

    // events ?

    // revision ?

    constructor(photograph: Photograph, _allMediaItems: MediaItem[]) {
        const { photographer } = photograph;

        /**
         * TODO we are now event sourcing this view. We should cache the media
         * item ID and build the URL in the new query service layer. Since this
         * is done on another branch, we've made this property optional here and
         * will reconcile upon rebase.
         */
        // this.imageUrl = searchResult?.url;
    }

    static fromPhotographCreated({
        payload: {
            title,
            languageCodeForTitle,
            aggregateCompositeIdentifier: { id: photographId },
        },
        meta: { contributorIds },
    }: PhotographCreated): PhotographViewModel {
        const photograph = new PhotographViewModel();

        photograph.name = buildMultilingualTextWithSingleItem(title, languageCodeForTitle);

        photograph.id = photographId;

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

        return photograph;
    }

    static fromDto(dto: DTO<PhotographViewModel>): PhotographViewModel {
        const photograph = new PhotographViewModel();

        if (isNullOrUndefined(dto)) {
            return photograph;
        }

        const { contributions, name, id, actions, accessControlList, mediaItemId, isPublished } =
            dto;

        photograph.contributions = Array.isArray(contributions) ? contributions : [];

        photograph.name = name;

        photograph.id = id;

        photograph.actions = actions;

        if (!isNullOrUndefined(mediaItemId)) {
            photograph.mediaItemId = mediaItemId;
        }

        const { id, isPublished, contributions, name, actions, accessControlList: aclDto } = dto;

        this.id = id;

        this.isPublished = typeof isPublished === 'boolean' ? isPublished : false;

        this.contributions = Array.isArray(contributions) ? contributions : [];

        this.name = new MultilingualText(name);

        this.actions = Array.isArray(actions) ? actions : [];

        this.accessControlList = new AccessControlList(aclDto);
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

    static fromPhotographCreated({
        payload: {
            title,
            languageCodeForTitle,
            aggregateCompositeIdentifier: { id: photographId },
        },
    }: PhotographCreated): PhotographViewModel {
        const dto: Partial<DTO<PhotographViewModel>> = {
            name: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            id: photographId,
            actions: [
                'PUBLISH_RESOURCE',
                'TAG_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'CREATE_NOTE_ABOUT_RESOURCE',
            ],
        };

        const view = new PhotographViewModel(dto);

        return view;
    }

    static fromDto(dto: DTO<PhotographViewModel>): PhotographViewModel {
        const photograph = new PhotographViewModel(dto);

        return photograph;
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

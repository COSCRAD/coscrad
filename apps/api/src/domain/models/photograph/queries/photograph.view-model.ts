import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { NonEmptyString, PositiveInteger, UUID } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { BaseEventSourcedResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-event-sourced-resource.view-model';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { ICoscradEvent } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
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
    },
})
export class PhotographViewModel extends BaseEventSourcedResourceViewModel {
    readonly type = ResourceType.photograph;

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

    constructor(dto: DTO<PhotographViewModel>) {
        super(dto);

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

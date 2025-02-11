import { AggregateType, IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { PhotographCreated } from '../../../domain/models/photograph';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';

export class PhotographViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    contributions: { id: string; fullName: string }[];

    name: IMultilingualText;

    id: AggregateId;

    photographer: string;

    isPublished: boolean;

    mediaItemId?: string;

    actions: string[];

    accessControlList: AccessControlList;

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

        const { contributions, name, id, actions, accessControlList, mediaItemId, isPublished } =
            dto;

        photograph.contributions = Array.isArray(contributions) ? contributions : [];

        photograph.name = name;

        photograph.id = id;

        photograph.actions = actions;

        if (!isNullOrUndefined(mediaItemId)) {
            photograph.mediaItemId = mediaItemId;
        }

        photograph.accessControlList = new AccessControlList(accessControlList);

        photograph.actions = actions;

        photograph.isPublished = isNullOrUndefined(isPublished) ? false : isPublished; // we want to be extra careful here

        return photograph;
    }

    appendAction(action: string): PhotographViewModel {
        this.actions.push(action);

        return this;
    }

    appendActions(actions: string[]): PhotographViewModel {
        for (const a of actions) {
            this.actions.push(a);
        }

        return this;
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

    public getAvailableCommands() {
        return this.actions;
    }

    public getCompositeIdentifier() {
        return {
            type: AggregateType.photograph,
            id: this.id,
        };
    }
}

import {
    AggregateCompositeIdentifier,
    AggregateType,
    IDigitalTextViewModel,
} from '@coscrad/api-interfaces';
import { BooleanDataType, FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import {
    DigitalTextCreatedPayload,
    PageAddedToDigitalTextPayload,
} from '../../domain/models/digital-text/commands';
import { ContentAddedToDigitalTextPagePayload } from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { DigitalText, PageIdentifier } from '../../domain/models/digital-text/entities';
import DigitalTextPage from '../../domain/models/digital-text/entities/digital-text-page.entity';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { ResourceReadAccessGrantedToUserPayload } from '../../domain/models/shared/common-commands';
import { MultilingualAudio } from '../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTaggedPayload } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { DTO } from '../../types/DTO';
import { EventSourcedTagViewModel } from '../buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { BaseEvent } from '../event-sourcing';
import { ApplyEvent } from '../event-sourcing/apply-event.interface';

export class DigitalTextViewModel
    implements ApplyEvent<DigitalTextViewModel>, IDigitalTextViewModel
{
    #accessControlList: AccessControlList = new AccessControlList();

    #allTags: EventSourcedTagViewModel[] = [];

    public readonly type = AggregateType.digitalText;

    @FromDomainModel(DigitalText)
    public title: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name',
    })
    public name: MultilingualText;

    @BooleanDataType({
        label: 'isPublished',
        description: 'a flag that indicates whether this resource is published',
    })
    public isPublished = false;

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'tags that apply to this resource',
        isArray: true,
    })
    public tags: EventSourcedTagViewModel[] = [];

    @NestedDataType(DigitalTextPage, {
        label: 'pages',
        description: 'digital representation of the pages in this digital text',
    })
    public pages: DigitalTextPage[] = [];

    public audio: MultilingualAudio;

    constructor(public readonly id: string) {}

    /**
     * TODO We should establish an alternative approach where the views are updated
     * (eventually as documents in a second database) and the event sourcing
     * occurs via dedicated event handlers that may update one or more views (
     * including "canonical" views for each aggregate root and other views, like
     * full text search or custom reports).
     *
     * ```ts
     * @EventHandler(`CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE`)
     * class HandleContentAddedToDigitalTextPage{
     *   // ...
     *    async handle({text,languageCode,pageIdentifier, aggregateCompositeIdentifier}: ContentAddedToDigitalTextPage): Promise<void>{
     *         const digitalTextRepository = this.queryRepositoryProvider.forView(CanonicalViews.digitalText)
     *
     *        const digitalTextView = await digitalTextRepository.fetchById(aggregateCompositeIdentifier.id);
     *
     *        const updatedDigitalText = digitalTextView.addContentToPage(pageIdentifier,text,langaugeCode);
     *
     *        // maybe we want the delta here only
     *        await this.digitalTextRepository.update(updatedDigitalText);
     *
     *         await this.queryRepositoryProvider.getSearchRepository().index(aggregateCompositeIdentifier,{
     *              languageCode,
     *              tokens: tokenize(text),
     *     })
     *
     *        // then update Notes \ connections
     *
     *      // then update tags
     *    }
     * }
     * ```
     *
     */
    apply(event: BaseEvent): this {
        const { payload } = event;

        const { type: eventType } = event;

        /**
         * Handle events for which the `DigitalText` is the aggregate context.
         */
        if (this.isForMe(payload)) {
            if (eventType === 'DIGITAL_TEXT_CREATED') {
                const { title, languageCodeForTitle } = payload as DigitalTextCreatedPayload;

                const {
                    meta: { userId: idOfCreatingUser },
                } = event;

                this.title = buildMultilingualTextWithSingleItem(title, languageCodeForTitle);

                /**
                 * This denormalization provides consistency that the client
                 * relies on for consistent presentation.
                 */
                this.name = this.title.clone({});

                /**
                 * If we switch to a model in which the admin role does not
                 * automatically grant read access to all resources, the user
                 * who created the resource will still always have read access.
                 *
                 * At some point, we may want to translate roles to groups
                 * `CoscradAdmin` and `TenantAdmin` and allow those groups here.
                 *
                 * At some point, we will allow a "bookkeeper" to enter data
                 * on behalf of a knowledge keeper. At that point, the knowledge
                 * keeper's userId should be entered here was well.
                 *
                 * Note that `AccessControlList` is an immutable data structure,
                 * so we need to save an updated reference to it.
                 */
                this.#accessControlList = this.#accessControlList.allowUser(idOfCreatingUser);

                return this;
            }

            if (event.type === 'PAGE_ADDED_TO_DIGITAL_TEXT') {
                const { identifier } = payload as PageAddedToDigitalTextPayload;

                // note that this eagerly sorts the pages
                return this.addPage(identifier);
            }

            if (event.type === 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE') {
                const { pageIdentifier, text, languageCode } =
                    payload as ContentAddedToDigitalTextPagePayload;

                this.pages = this.pages.map((page) =>
                    page.identifier === pageIdentifier
                        ? new DigitalTextPage({
                              identifier: pageIdentifier,
                              content: buildMultilingualTextWithSingleItem(text, languageCode),
                              audio: new MultilingualAudio({ items: [] }),
                          })
                        : page
                );

                return this;
            }

            // The below are generic events and need to be shared across resources

            if (eventType === 'RESOURCE_PUBLISHED') {
                this.isPublished = true;

                return this;
            }

            if (eventType === 'RESOURCE_READ_ACCESS_GRANTED_TO_USER') {
                const { userId } = payload as ResourceReadAccessGrantedToUserPayload;

                // Note that `AccessControlList` is an immutable data structure
                this.#accessControlList = this.#accessControlList.allowUser(userId);

                return this;
            }
        }

        // /**
        //  * Apply foreign-context events, i.e., events whose payloads hold a
        //  * reference to this aggregate root.
        //  *
        //  * Note that in keeping with CQRS-ES we are denormalizing the views here.
        //  */

        /**
         * Apply events for tags and categories.
         *
         * We need to track the state of all tags, for example, in order
         * to join in the ones for this resource. We may want to find another pattern,
         * such as doing a referential join in the event-sourced database. Consider
         * this as we event-source additional views.
         */
        if (eventType === 'TAG_CREATED') {
            const {
                aggregateCompositeIdentifier: { id },
            } = payload as TagCreated['payload'];

            const emptyTag = new EventSourcedTagViewModel(id);

            // TODO Do we need to update this.tags as well? Do we duplicate some tags between the two lists?
            this.#allTags = [...this.#allTags, emptyTag.apply(event)];

            return this;
        }

        if (eventType === 'RESOURCE_OR_NOTE_TAGGED') {
            const {
                aggregateCompositeIdentifier: { id: tagId },
                taggedMemberCompositeIdentifier,
            } = payload as ResourceOrNoteTaggedPayload;

            if (
                this.isForMe({
                    // Note the mapping here because we are applying the event in a foreign aggregate context
                    aggregateCompositeIdentifier: taggedMemberCompositeIdentifier,
                })
            ) {
                const searchResult = this.#allTags.find(({ id }) => id === tagId);

                /**
                 * This is a safeguard so things do not blow up in the event
                 * of a system error. Do we want to throw instead?
                 */
                if (isNullOrUndefined(searchResult)) {
                    return this;
                }

                this.tags = [...this.tags, searchResult.apply(event)];

                return this;
            }

            return this;
        }
        /**
         * TODO Event source notes and edge connections for this digital text.
         *
         * TODO Event source contributions for this digital text.
         */

        return this;
    }

    /**
     * @param events A temporally ordered event history, filtered for this particular aggregate.
     * @returns `DigitalTextViewModel`
     */
    applyStream(events: BaseEvent[]) {
        return events.reduce((viewModel, event) => viewModel.apply(event), this);
    }

    hasReadAccess(userWithGroups: CoscradUserWithGroups): boolean {
        if (!userWithGroups) return false;

        /**
         * Our current permissions model allows any admin (either tenant admin
         * or COSCRAD super admin) to read any resource and make any edit (i.e.,
         * execute any command against) to any aggregate root.
         *
         * In the future, we may tighten this up by
         * - restricting read access to the resource's creator or a user explicitly added to the ACL
         * - restricting which (if any) commands a user can execute on a per-resource basis
         */
        if (userWithGroups.isAdmin()) return true;

        const { id: userId, groups } = userWithGroups;

        return (
            this.#accessControlList.canUser(userId) ||
            groups.some(({ id: userGroupId }) => this.#accessControlList.canGroup(userGroupId))
        );
    }

    private addPage<T extends DigitalTextViewModel>(this: T, pageIdentifier: PageIdentifier): T {
        // TODO  Insert the page identifier in place instead.
        const updatedPages = [
            ...this.pages,
            new DigitalTextPage({
                identifier: pageIdentifier,
                audio: new MultilingualAudio({ items: [] }),
            }),
        ].sort((a, b) => a.identifier.localeCompare(b.identifier));

        this.pages = updatedPages;

        return this;
    }

    /**
     * @returns a list of command types that should be available based on the
     * current state.
     *
     * Note that this is a matter of user convenience and aims to circumvent
     * allowing the user to attempt commands that are certain to fail.
     */
    getAvailableCommands(): string[] {
        const availableCommands: string[] = [
            'GRANT_RESOURCE_READ_ACCESS_TO_USER',
            'ADD_PAGE_TO_DIGITAL_TEXT',
        ];

        if (!this.isPublished) availableCommands.push('PUBLISH_RESOURCE');

        return availableCommands;
    }

    getCompositeIdentifier(): AggregateCompositeIdentifier {
        return {
            type: this.type,
            id: this.id,
        };
    }

    private isForMe({
        aggregateCompositeIdentifier: { type, id },
    }: {
        aggregateCompositeIdentifier: { type: string; id: string };
    }) {
        return type === this.type && id === this.id;
    }

    static getIndexScopedCommands(): string[] {
        return ['CREATE_DIGITAL_TEXT'];
    }

    static fromSnapshot({
        id,
        name,
        pages,
        tags,
        title,
        isPublished,
    }: DTO<Omit<DigitalTextViewModel, 'type'>>): DigitalTextViewModel {
        const digitalText = new DigitalTextViewModel(id);

        digitalText.name = new MultilingualText(name);

        digitalText.pages = pages.map((pageDto) => new DigitalTextPage(pageDto));

        digitalText.tags = tags.map((tag) => EventSourcedTagViewModel.fromSnapshot(tag));

        digitalText.title = new MultilingualText(title);

        digitalText.isPublished = isPublished;

        return digitalText;
    }
}

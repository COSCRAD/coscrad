import { CategorizableType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../queries/interfaces/aggregate-root-query-repository-provider.interface';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

@EventHandler(`RESOURCE_OR_NOTE_TAGGED`)
export class ResourceOrNoteTaggedEventHandler implements ICoscradEventHandler {
    constructor(
        // TODO Write the tags to a query collection as well,

        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(event: ResourceOrNoteTagged): Promise<void> {
        const {
            payload: {
                taggedMemberCompositeIdentifier: { type: categorizableType, id },
            },
        } = event;

        if (categorizableType === CategorizableType.note) {
            throw new InternalError(
                `Not implemented: support for event sourcing tags onto note views is not yet supported`
            );
        }

        const existingResource = await this.queryRepositoryProvider
            .forResource(categorizableType)
            .fetchById(id);

        if (isNotFound(existingResource)) return;

        const { tags } = existingResource;

        tags.push(new EventSourcedTagViewModel(id).apply(event));

        await this.queryRepositoryProvider.forResource(categorizableType).update({
            id,
            tags,
        });
    }
}

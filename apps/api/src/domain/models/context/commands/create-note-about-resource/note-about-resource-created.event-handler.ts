import { IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';

export interface IQueryRepositoryForNote {
    createNoteAbout(id: string, noteId: string, context: IEdgeConnectionContext): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForNote;
}

@CoscradEventConsumer('NOTE_ABOUT_RESOURCE_CREATED')
export class NoteAboutResourceCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: noteId },
            resourceContext,
            resourceCompositeIdentifier: { type: resourceType, id: resourceId },
        },
    }: NoteAboutResourceCreated): Promise<void> {
        await this.repositoryProvider
            .forResource(resourceType)
            .createNoteAbout(resourceId, noteId, resourceContext);
    }
}

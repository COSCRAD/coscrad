import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { IPublishable } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../repositories/note-query-repository.interface';
import { EdgePublished } from './edge-published.event';

@CoscradEventConsumer('EDGE_PUBLISHED')
export class EdgePublishedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly edgeQueryRepository: IPublishable
    ) {}

    async handle(event: EdgePublished): Promise<void> {
        if (isNonEmptyString(event?.payload?.aggregateCompositeIdentifier?.id)) {
            await this.edgeQueryRepository.publish(event.payload.aggregateCompositeIdentifier.id);
        }
    }
}

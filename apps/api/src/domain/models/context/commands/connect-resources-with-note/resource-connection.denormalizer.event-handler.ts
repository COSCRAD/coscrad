import { EdgeConnectionMemberRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';
import { IQueryRepositoryForConnectable } from './resources-connected-with-note.event-handler';

interface IRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForConnectable;
}

@CoscradEventConsumer('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourceConnectionDenormalizer implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IRepositoryProvider
    ) {}

    async handle(event: ResourcesConnectedWithNote): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id: noteId },
                fromMemberCompositeIdentifier,
                fromMemberContext,
                toMemberCompositeIdentifier,
                toMemberContext,
                text: textForNote,
                languageCode,
            },
        } = event;

        const repositoryForFromMember = this.repositoryProvider.forResource(
            fromMemberCompositeIdentifier.type
        );

        const repositoryForToMember = this.repositoryProvider.forResource(
            toMemberCompositeIdentifier.type
        );

        const multilingualTextForNote = buildMultilingualTextWithSingleItem(
            textForNote,
            languageCode
        );

        /**
         * TODO We should make `createConnection` idempotent or else find a pattern
         * that splits these 2 writes into separate event handlers. If one
         * write failes, we don't want to write the successful connection twice.
         *
         * A good way to do this is to make the `connections` a `Map<AggregateId,ConnectionRecordForResourceViewModel>`
         * and overwrite \ merge updates to this lookup table. This will also help
         * with improving fine-grained reactivity in Redux on the client.
         */
        await Promise.all([
            repositoryForFromMember.createConnection(fromMemberCompositeIdentifier.id, {
                noteId: noteId,
                selfContext: fromMemberContext,
                otherCompositeIdentifier: toMemberCompositeIdentifier,
                otherContext: toMemberContext,
                text: multilingualTextForNote,
                role: EdgeConnectionMemberRole.from,
            }),
            repositoryForToMember.createConnection(toMemberCompositeIdentifier.id, {
                noteId,
                selfContext: toMemberContext,
                otherCompositeIdentifier: fromMemberCompositeIdentifier,
                otherContext: fromMemberContext,
                text: multilingualTextForNote,
                role: EdgeConnectionMemberRole.to,
            }),
        ]);
    }
}

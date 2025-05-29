import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    GrantResourceReadAccessToUser,
    GrantResourceReadAccessToUserCommandHandler,
    PublishResource,
    PublishResourceCommandHandler,
    ResourceReadAccessGrantedToUser,
} from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { ResourcePublishedEventHandler } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { Attributor } from '../../domain/models/shared/common-event-handlers/attributor.event-handler';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    providers: [
        // We include this command here for lack of a better place
        GrantResourceReadAccessToUser,
        GrantResourceReadAccessToUserCommandHandler,
        PublishResource,
        PublishResourceCommandHandler,
        // Events
        ...[ResourcePublished, ResourceReadAccessGrantedToUser].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
        // Event Handlers
        // TODO These should be part of a different module. Ultimately there should be a `WebOfKnowledge` module.
        ResourcePublishedEventHandler,
        Attributor,
    ],
})
export class WebOfKnowledgeModule {}

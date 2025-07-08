import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from '../../../coscrad-cli/logging';
import {
    GrantResourceReadAccessToUser,
    GrantResourceReadAccessToUserCommandHandler,
    PublishResource,
    PublishResourceCommandHandler,
    ResourceReadAccessGrantedToUser,
} from '../../../domain/models/shared/common-commands';
import { AdditionalCreditsProvidedForResource } from '../../../domain/models/shared/common-commands/provide-additional-credits-for-resource/additional-credits-provided-for-resource.event';
import { AdditionalCreditsProvidedForResourceEventHandler } from '../../../domain/models/shared/common-commands/provide-additional-credits-for-resource/additional-credits-provided-for-resource.event-handler';
import { ProvideAdditionalCreditsForResource } from '../../../domain/models/shared/common-commands/provide-additional-credits-for-resource/provide-additional-credits-for-resource.command';
import { ProvideAdditionalCreditsForResourceCommandHandler } from '../../../domain/models/shared/common-commands/provide-additional-credits-for-resource/provide-additional-credits-for-resource.command-handler';
import { ResourcePublished } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { ResourcePublishedEventHandler } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { Attributor } from '../../../domain/models/shared/common-event-handlers/attributor.event-handler';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../persistence/persistence.module';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    providers: [
        // TODO use NestJS approach to logging
        {
            provide: COSCRAD_LOGGER_TOKEN,
            useValue: new ConsoleCoscradCliLogger(),
        },
        GrantResourceReadAccessToUser,
        GrantResourceReadAccessToUserCommandHandler,
        PublishResource,
        PublishResourceCommandHandler,
        ProvideAdditionalCreditsForResource,
        ProvideAdditionalCreditsForResourceCommandHandler,
        // Events
        ...[
            ResourcePublished,
            ResourceReadAccessGrantedToUser,
            AdditionalCreditsProvidedForResource,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
        // Event Handlers
        AdditionalCreditsProvidedForResourceEventHandler,
        // TODO These should be part of a different module. Ultimately there should be a `WebOfKnowledge` module.
        ResourcePublishedEventHandler,
        Attributor,
    ],
})
export class WebOfKnowledgeModule {}

import { CommandModule } from '@coscrad/commands';
import { forwardRef, Module } from '@nestjs/common';
import { CreatePhotograph, CreatePhotographCommandHandler } from '.';
import { IdGenerationModule } from '../../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../../persistence/persistence.module';

@Module({
    imports: [
        forwardRef(() => PersistenceModule),
        CommandModule,
        forwardRef(() => IdGenerationModule),
    ],
    providers: [
        CreatePhotographCommandHandler,
        ...[CreatePhotograph].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
    ],
    exports: [CreatePhotograph],
})
export class PhotographCommandsModule {}

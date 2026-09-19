import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateMap } from '../../domain/models/geospatial-map/commands/create-map.command';
import { CreateMapCommandHandler } from '../../domain/models/geospatial-map/commands/create-map.command-handler';
import { GeospatialMap } from '../../domain/models/geospatial-map/geospatial-map.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { CoscradNLPModule } from '../../lib/nlp';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../validation';

@Module({
    imports: [
        PersistenceModule,
        CommandModule,
        IdGenerationModule,
        DynamicDataTypeModule,
        CoscradNLPModule,
    ],
    controllers: [],
    providers: [
        // Command Handlers
        CreateMapCommandHandler,
        // Data Classes
        ...[
            GeospatialMap,
            // Commands
            CreateMap,
            // events
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class GeospatialMapModule {}

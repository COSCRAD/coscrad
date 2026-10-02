import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateMap } from '../../domain/models/geospatial-map/commands/create-map.command';
import { CreateMapCommandHandler } from '../../domain/models/geospatial-map/commands/create-map.command-handler';
import { MapCreated } from '../../domain/models/geospatial-map/commands/map-created.event';
import { MapNameTranslated } from '../../domain/models/geospatial-map/commands/translate-map-name/map-name-translated.event';
import { TranslateMapName } from '../../domain/models/geospatial-map/commands/translate-map-name/translate-map-name.command';
import { TranslateMapNameCommandHandler } from '../../domain/models/geospatial-map/commands/translate-map-name/translate-map-name.command-handler';
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
        TranslateMapNameCommandHandler,
        // Data Classes
        ...[
            GeospatialMap,
            // Commands
            CreateMap,
            TranslateMapName,
            // events
            MapCreated,
            MapNameTranslated,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class GeospatialMapModule {}

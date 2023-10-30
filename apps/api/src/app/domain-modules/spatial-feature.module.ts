import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { Line } from '../../domain/models/spatial-feature/line/entities/line.entity';
import {
    CreatePoint,
    CreatePointCommandHandler,
} from '../../domain/models/spatial-feature/point/commands';
import { SpatialFeatureQueryService } from '../../domain/services/query-services/spatial-feature-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SpatialFeatureController } from '../controllers/resources/spatial-feature.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule, DynamicDataTypeModule],
    controllers: [SpatialFeatureController],
    providers: [
        CommandInfoService,
        SpatialFeatureQueryService,
        CreatePointCommandHandler,
        // Data Classes
        ...[CreatePoint, Line].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class SpatialFeatureModule {}

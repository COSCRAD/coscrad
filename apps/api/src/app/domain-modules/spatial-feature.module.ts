import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreatePoint } from '../../domain/models/spatial-feature/point/commands';
import { SpatialFeatureQueryService } from '../../domain/services/query-services/spatial-feature-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SpatialFeatureController } from '../controllers/resources/spatial-feature.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [SpatialFeatureController],
    providers: [
        CommandInfoService,
        SpatialFeatureQueryService,
        // Data Classes
        ...[CreatePoint].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class SpatialFeatureModule {}

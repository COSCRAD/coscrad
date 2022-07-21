import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { SpatialFeatureQueryService } from '../../domain/services/query-services/spatial-feature-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SpatialFeatureController } from '../controllers/resources/spatial-feature.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [SpatialFeatureController],
    providers: [CommandInfoService, SpatialFeatureQueryService],
})
export class SpatialFeatureModule {}

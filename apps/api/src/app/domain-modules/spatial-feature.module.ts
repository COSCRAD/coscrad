import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConsoleCoscradCliLogger } from '../../coscrad-cli/logging';
import {
    CreatePoint,
    CreatePointCommandHandler,
    PointCreated,
} from '../../domain/models/spatial-feature/point/commands';
import { PointCreatedEventHandler } from '../../domain/models/spatial-feature/point/commands/point-created.event-handler';
import { SpatialFeatureNameTranslated } from '../../domain/models/spatial-feature/point/commands/translate-spatial-feature-name/spatial-feature-name-translated.event';
import { SpatialFeatureNameTranslatedEventHandler } from '../../domain/models/spatial-feature/point/commands/translate-spatial-feature-name/spatial-feature-name-translated.event-handler';
import { TranslateSpatialFeatureName } from '../../domain/models/spatial-feature/point/commands/translate-spatial-feature-name/translate-spatial-feature-name.command';
import { TranslateSpatialFeatureNameCommandHandler } from '../../domain/models/spatial-feature/point/commands/translate-spatial-feature-name/translate-spatial-feature-name.command-handler';
import { Point } from '../../domain/models/spatial-feature/point/entities/point.entity';
import { SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN } from '../../domain/models/spatial-feature/queries/spatial-feature-query-repository.interface';
import { ArangoSpatialFeatureQueryRepository } from '../../domain/models/spatial-feature/repositories/arango-spatial-feature-query-repository';
import { SpatialFeatureQueryService } from '../../domain/services/query-services/spatial-feature-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { CoscradNLPModule } from '../../lib/nlp';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SpatialFeatureController } from '../controllers/resources/spatial-feature.controller';

@Module({
    imports: [
        PersistenceModule,
        CommandModule,
        IdGenerationModule,
        DynamicDataTypeModule,
        CoscradNLPModule,
    ],
    controllers: [SpatialFeatureController],
    providers: [
        {
            provide: SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoSpatialFeatureQueryRepository(
                    arangoConnectionProvider,
                    new ConsoleCoscradCliLogger()
                ),
            inject: [ArangoConnectionProvider],
        },
        CommandInfoService,
        SpatialFeatureQueryService,
        CreatePointCommandHandler,
        TranslateSpatialFeatureNameCommandHandler,
        // Data Classes
        ...[
            Point,
            // Events
            PointCreated,
            SpatialFeatureNameTranslated,
            // Commands
            CreatePoint,
            TranslateSpatialFeatureName,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
        // Event Handlers
        PointCreatedEventHandler,
        SpatialFeatureNameTranslatedEventHandler,
    ],
})
export class SpatialFeatureModule {}

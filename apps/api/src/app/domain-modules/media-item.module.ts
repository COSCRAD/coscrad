import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { MediaItemQueryService } from '../../domain/services/query-services/media-item-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { MediaItemController } from '../controllers/resources/media-item.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [MediaItemController],
    providers: [MediaItemQueryService, CommandInfoService],
})
export class MediaItemModule {}

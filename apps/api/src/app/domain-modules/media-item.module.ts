import { Module } from '@nestjs/common';
import { MediaItemQueryService } from '../../domain/services/media-item-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { MediaItemController } from '../controllers/resources/media-item.controller';

@Module({
    imports: [PersistenceModule],
    controllers: [MediaItemController],
    providers: [MediaItemQueryService],
})
export class MediaItemModule {}

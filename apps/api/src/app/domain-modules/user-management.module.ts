import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradUserQueryService } from '../../domain/services/query-services/user-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { CoscradUserController } from '../controllers/coscrad-user.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [CoscradUserController],
    providers: [CoscradUserQueryService, CommandInfoService],
})
export class UserManagementModule {}

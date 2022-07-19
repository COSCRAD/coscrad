import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { GrantResourceReadAccessToUser } from '../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
import { GrantResourceReadAccessToUserCommandHandler } from '../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command-handler';
import { AddUserToGroup } from '../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command';
import { AddUserToGroupCommandHandler } from '../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command-handler';
import { CreateGroup } from '../../domain/models/user-management/group/commands/create-group/create-group.command';
import { CreateGroupCommandHandler } from '../../domain/models/user-management/group/commands/create-group/create-group.command-handler';
import { GrantUserRole } from '../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { GrantUserRoleCommandHandler } from '../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command-handler';
import { RegisterUser } from '../../domain/models/user-management/user/commands/register-user/register-user.command';
import { RegisterUserCommandHandler } from '../../domain/models/user-management/user/commands/register-user/register-user.command-handler';
import { CoscradUserGroupQueryService } from '../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../domain/services/query-services/coscrad-user-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { CoscradUserGroupController } from '../controllers/coscrad-user-group.controller';
import { CoscradUserController } from '../controllers/coscrad-user.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [CoscradUserController, CoscradUserGroupController],
    providers: [
        CoscradUserQueryService,
        CoscradUserGroupQueryService,
        CommandInfoService,
        RegisterUser,
        RegisterUserCommandHandler,
        CreateGroup,
        CreateGroupCommandHandler,
        AddUserToGroup,
        AddUserToGroupCommandHandler,
        GrantUserRole,
        GrantUserRoleCommandHandler,
        // We include this command here for lack of a better place
        GrantResourceReadAccessToUser,
        GrantResourceReadAccessToUserCommandHandler,
    ],
})
export class UserManagementModule {}

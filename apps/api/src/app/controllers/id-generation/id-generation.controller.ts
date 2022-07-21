import { Controller, Inject, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../domain/types/AggregateId';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';

@ApiTags('id generation')
@Controller()
export class IdGenerationController {
    constructor(@Inject('ID_MANAGER') private readonly idManager: IIdManager) {}

    @Post('ids')
    async generateId(@Res() res): Promise<AggregateId> {
        const newId = await this.idManager.generate();

        return sendInternalResultAsHttpResponse(res, newId);
    }
}

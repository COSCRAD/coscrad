import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemoryMatchService } from '../services/memory-match.service';

@ApiTags('games')
@Controller('games/memory-match')
export class MemoryMatchController {
    constructor(private readonly memoryMatchService: MemoryMatchService) {}

    @Get(`/:id`)
    async fetchById(@Param('id') id: string) {
        return this.memoryMatchService.fetchById(id);
    }

    @Get('')
    async fetchMany() {
        throw new Error('not implemented');
    }
}

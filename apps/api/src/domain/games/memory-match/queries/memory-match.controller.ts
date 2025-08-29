import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemoryMatchService } from '../services/memory-match.service';

@ApiTags('games')
@Controller('games/memory-match')
export class MemoryMatchController {
    constructor(private readonly memoryMatchService: MemoryMatchService) {}

    @Get(`/:id`)
    async fetchById() {
        throw new Error('not implemented');
    }

    @Get('')
    async fetchMany() {
        throw new Error('not implemented');
    }
}

import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Ack } from '../constants';
import { Command, CommandHandler } from '../decorators';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { CommandFinderService } from './command-finder.service';

describe('CommandFinderService', () => {
    let service: CommandFinderService;

    @Injectable()
    @Command('ADD_WIDGET')
    class AddWidget implements ICommand {
        widgetName: string;
    }

    @Injectable()
    @CommandHandler(AddWidget)
    class HandleAddWidget implements ICommandHandler {
        async execute({ widgetName }: AddWidget): Promise<Ack | Error> {
            return widgetName === 'fail' ? new Error('Add Widet failed') : Ack;
        }
    }

    beforeAll(async () => {
        // const commandModule: TestingModule = await Test.createTestingModule({
        //     providers: [AddWidget,HandleAddWidget]
        // })

        const module: TestingModule = await Test.createTestingModule({
            imports: [DiscoveryModule],
            providers: [CommandFinderService, AddWidget, HandleAddWidget],
        }).compile();

        service = module.get<CommandFinderService>(CommandFinderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('find', () => {
        it('should find the expected command and handler pair', async () => {
            const result = await service.find();

            const expectedResult = [[AddWidget, new HandleAddWidget()]];

            expect(result).toEqual(expectedResult);
        });
    });
});

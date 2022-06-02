import { Test, TestingModule } from '@nestjs/testing';
import { Ack } from '../constants';
import { Command, CommandHandler } from '../decorators';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { CommandHandlerService } from './command-handler.service';

describe('CommandsService', () => {
    let service: CommandHandlerService;

    @Command('ADD_WIDGET')
    class AddWidget implements ICommand {
        public readonly widgetName: string;
    }

    @CommandHandler(AddWidget)
    class HandleAddWidget implements ICommandHandler {
        async execute({ widgetName }: AddWidget): Promise<Ack | Error> {
            return widgetName === 'fail' ? new Error('Add Widet failed') : Ack;
        }
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CommandHandlerService, AddWidget, HandleAddWidget],
        }).compile();

        service = module.get<CommandHandlerService>(CommandHandlerService);

        // This is normally done by the finder service, but there's a separate test for that
        service.registerHandler('ADD_WIDGET', new HandleAddWidget());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('CommandHandler.execute', () => {
        describe('when the command it receives is valid', () => {
            it('should return Ack', async () => {
                const result = await service.execute({
                    type: 'ADD_WIDGET',
                    payload: { widgetName: 'ok name' },
                });

                expect(result).toBe(Ack);
            });
        });

        describe('when the command it receives is invalid', () => {
            it('should return an error', async () => {
                const result = await service.execute({
                    type: 'ADD_WIDGET',
                    payload: { widgetName: 'fail' },
                });

                expect(result).toBeInstanceOf(Error);
            });
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Ack } from '../constants';
import { Command, CommandHandler } from '../decorators';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { CommandHandlerService } from './command-handler.service';

describe('CommandsService', () => {
    let service: CommandHandlerService;

    /**
     * Note that only the `type` property is required from the point of view of
     * the `@coscrads/commands` lib. However additional metadata can be added as
     * needed by the client, and this will be returned from our
     * `CommandHandlerService` on request.
     */
    @Command({ type: 'ADD_WIDGET', label: 'Add Widget', info: 'Adds a Widget' })
    class AddWidget implements ICommand {
        public readonly widgetName: string;
    }

    @CommandHandler(AddWidget)
    class HandleAddWidget implements ICommandHandler {
        async execute({ widgetName }: AddWidget): Promise<Ack | Error> {
            return widgetName === 'fail' ? new Error('Add Widet failed') : Ack;
        }
    }

    const validAddWidgetFsa = {
        type: 'ADD_WIDGET',
        payload: { widgetName: 'ok name' },
    };

    const invalidAddWidgetFsa = {
        type: 'ADD_WIDGET',
        payload: { widgetName: 'fail' },
    };

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

    describe('CommandHandlerService.getAllCommandCtorsAndMetadata', () => {
        it('should return the expected meta', () => {
            const result = service.getAllCommandCtorsAndMetadata();

            expect(result).toMatchSnapshot();

            expect(result[0].constructor).toBe(AddWidget);
        });
    });

    describe('CommandHandlerService.execute', () => {
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

    describe('CommandHandlerService.executeCommandStream', () => {
        describe(`when the command stream is valid`, () => {
            it(`should succeed`, async () => {
                const result = await service.executeStream([validAddWidgetFsa]);

                expect(result[0].fsa).toEqual(validAddWidgetFsa);

                expect(result[0].result).toBe(Ack);
            });
        });

        describe(`when the command stream is invalid`, () => {
            it(`should fail with the expected message`, async () => {
                const result = await service.executeStream([
                    validAddWidgetFsa,
                    // comand at index 1 fails
                    invalidAddWidgetFsa,
                ]);

                expect(result).not.toEqual([Ack, Ack]);

                expect(result[0].fsa).toEqual(validAddWidgetFsa);

                expect(result[0].result).toEqual(Ack);

                expect((result[1].result as Error).message).toContain('[1]');

                expect((result[1].result as Error).message).toContain('ADD_WIDGET');
            });
        });
    });
});

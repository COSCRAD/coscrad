import { ICommand } from './ICommand';

export class TestCommand implements ICommand {
    type: 'RUN_TEST';

    constructor(public readonly runNumber: number) {}
}

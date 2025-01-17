import { NotImplementedException } from '@nestjs/common';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from '../cli-command.decorator';

interface IPerformanceScenario {
    buildCommandFsas: (n: number) => CommandFSA[];
    performQueries: (n: number) => void;
    // empty if ok
    postCheck: (n: number) => InternalError[];
}

interface ParametersAndMetrics<TParams = unknown, UMetrics = unknown> {
    parameters: TParams;
    metrics: UMetrics;
}

interface IPerformanceReport {
    scenario: string;
    parametersAndMetrics: ParametersAndMetrics<
        { numberOfAggregatesCreated: number; numberOfJoins: number },
        { metrics: { totalRunningTime: number } }
    >;
}

const scenariosMap = new Map<string, IPerformanceScenario>();

const AddTermsToVocabularyListScenario: IPerformanceScenario = {
    buildCommandFsas: (_n: number): CommandFSA[] => {
        return [];
    },
    performQueries: (_number: number): void => {
        console.log('it worked');
    },
    postCheck: (_n: number) => [],
};

scenariosMap.set('add terms to vocabualry list', AddTermsToVocabularyListScenario);

@CliCommand({
    name: 'performance-test',
    description:
        'runs specified scenarios with specified number of commands and reports performance metrics',
})
export class PerformanceTestCliCommand extends CliCommandRunner {
    run(_passedParams: string[], _options?: Record<string, string>): Promise<void> {
        throw new NotImplementedException('run');
    }

    @CliCommandOption({
        flags: '--scenario [scenario]',
        description: 'name of the performance scenario to execute',
        required: true,
    })
    parseScenario(value: string): string[] {
        if (!scenariosMap.has(value)) {
            throw new InternalError(`Unknown performance scenario: ${value}`);
        }

        return [value];
    }
}

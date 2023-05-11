/**
 * Given that we have an extensive custom set of decorators for commands in the
 * CQRS sense of the word "command", we re-export and alias `nest-commander` decorators
 * for clarity in naming. These decorators should be imported from this local file
 * into any CLI Command files.
 */
export {
    Command as CliCommand,
    CommandRunner as CliCommandRunner,
    Option as CliCommandOption,
} from 'nest-commander';

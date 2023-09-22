import { CommandHandler } from '@coscrad/commands';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { Term } from '../../entities/term.entity';
import { CreatePromptTerm } from './create-prompt-term.command';

@CommandHandler(CreatePromptTerm)
export class CreatePromptTermCommandHandler extends BaseCreateCommandHandler<Term> {}

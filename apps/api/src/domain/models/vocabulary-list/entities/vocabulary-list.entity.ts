import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import vocabularyListValidator from '../../../domainModelValidators/vocabularyListValidator';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { VocabularyListEntry } from '../vocabulary-list-entry';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

@RegisterIndexScopedCommands([])
export class VocabularyList extends Resource {
    readonly type = ResourceType.vocabularyList;

    readonly name?: string;

    readonly nameEnglish?: string;

    readonly entries: VocabularyListEntry[];

    readonly variables: VocabularyListVariable[];

    constructor(dto: DTO<VocabularyList>) {
        super({ ...dto, type: ResourceType.vocabularyList });

        const { name, nameEnglish, entries, variables } = dto;

        this.name = name;

        this.nameEnglish = nameEnglish;

        this.entries = [...entries];

        this.variables = [...variables];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return vocabularyListValidator(this);
    }

    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }
}

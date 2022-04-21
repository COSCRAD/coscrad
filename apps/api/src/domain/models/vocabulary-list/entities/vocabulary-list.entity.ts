import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import isStringWithNonzeroLength from 'apps/api/src/lib/utilities/isStringWithNonzeroLength';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { Valid } from '../../../domainModelValidators/Valid';
import { resourceTypes } from '../../../types/resourceTypes';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import { VocabularyListEntry } from '../vocabulary-list-entry';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

export class VocabularyList extends Resource {
    readonly type = resourceTypes.vocabularyList;

    readonly name?: string;

    readonly nameEnglish?: string;

    readonly entries: VocabularyListEntry[];

    readonly variables: VocabularyListVariable[];

    constructor(dto: PartialDTO<VocabularyList>) {
        super({ ...dto, type: resourceTypes.vocabularyList });

        const { name, nameEnglish, entries, variables } = dto;

        this.name = name;

        this.nameEnglish = nameEnglish;

        // TODO type guard for this (validation already complete at this point)
        this.entries = [...(entries as VocabularyListEntry[])];

        this.variables = [...(variables as VocabularyListVariable[])];
    }

    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        const { target, charRange } = context;

        const valueOfTargetProperty = this[target];

        // TODO where should we handle the case that the target property is not a string?
        if (!isStringWithNonzeroLength(valueOfTargetProperty))
            return new EmptyTargetForTextFieldContextError(this.getCompositeIdentifier(), target);

        const [_, finalIndex] = charRange;

        if (finalIndex >= valueOfTargetProperty.length)
            return new InconsistentCharRangeError(
                charRange,
                this.getCompositeIdentifier(),
                target,
                valueOfTargetProperty
            );

        return Valid;
    }
}

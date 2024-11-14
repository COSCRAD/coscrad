import { DatabaseDTO } from '../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { Term } from '../../models/term/entities/term.entity';
import { Criterion } from '../interfaces/Criterion';
import { QueryOperator } from '../interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

// TODO program to a `Nameable` interface
export class HasText implements ISpecification<DatabaseDTO<Term>, string> {
    public readonly criterion: Criterion<string>;

    constructor(value: string) {
        this.criterion = new Criterion('text', QueryOperator.hasOriginalText, value);
    }

    isSatisfiedBy(model: DatabaseDTO<Term>): boolean {
        return model.text.items[0].text === this.criterion.value;
    }
}

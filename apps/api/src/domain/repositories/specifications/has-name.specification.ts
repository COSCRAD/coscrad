import { ArangoDocumentForAggregateRoot } from '../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import { Criterion } from '../interfaces/Criterion';
import { QueryOperator } from '../interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

// TODO program to a `Nameable` interface
export class HasName
    implements ISpecification<ArangoDocumentForAggregateRoot<VocabularyList>, string>
{
    public readonly criterion: Criterion<string>;

    constructor(value: string) {
        this.criterion = new Criterion('name', QueryOperator.hasOriginalText, value);
    }

    isSatisfiedBy(model: ArangoDocumentForAggregateRoot<VocabularyList>): boolean {
        return model.getName().items[0].text === this.criterion.value;
    }
}

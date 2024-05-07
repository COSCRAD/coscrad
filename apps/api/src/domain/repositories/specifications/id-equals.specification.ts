import { Criterion } from '../interfaces/Criterion';
import { QueryOperator } from '../interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

interface IdentifiableDocument {
    _key: string;
}

export class IdEquals<TEntity extends IdentifiableDocument>
    implements ISpecification<TEntity, string>
{
    public readonly criterion: Criterion<string>;

    constructor(private readonly value: string) {
        this.criterion = new Criterion(`_key`, QueryOperator.equals, value);
    }

    isSatisfiedBy(model: TEntity): boolean {
        return this.criterion.value === model._key;
    }
}

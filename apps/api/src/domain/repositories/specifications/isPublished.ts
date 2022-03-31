import { Criterion } from '../interfaces/Criterion';
import { ISpecification } from '../interfaces/ISpecification';
import { QueryOperator } from '../interfaces/QueryOperator';

interface Publishable {
    published: boolean;
}

export default class IsPublished<TEntity extends Publishable>
    implements ISpecification<TEntity, boolean>
{
    public readonly criterion: Criterion<boolean>;

    constructor(private readonly value: boolean) {
        this.criterion = new Criterion(`published`, QueryOperator.equals, value);
    }

    isSatisfiedBy({ published }: Publishable): boolean {
        return published === this.value;
    }
}

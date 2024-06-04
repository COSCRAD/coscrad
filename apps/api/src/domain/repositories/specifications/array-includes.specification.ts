import { Resource } from '../../models/resource.entity';
import { Criterion } from '../interfaces/Criterion';
import { QueryOperator } from '../interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

export default class IsInArray<TEntity extends Resource>
    implements ISpecification<TEntity, (string | number)[]>
{
    public readonly criterion: Criterion<(string | number)[]>;

    constructor(private readonly fieldPath: string, private readonly value: (string | number)[]) {
        this.criterion = new Criterion(fieldPath, QueryOperator.isIncludedInArray, value);
    }

    isSatisfiedBy(model: TEntity): boolean {
        const needle = model[this.fieldPath];

        return this.value.includes(needle);
    }
}

import { DatabaseUuidDocument } from '../../../persistence/repositories/arango-id-repository';
import { Criterion } from '../interfaces/Criterion';
import { QueryOperator } from '../interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

export class UuidEquals implements ISpecification<DatabaseUuidDocument, string> {
    public readonly criterion: Criterion<string>;

    constructor(value: string) {
        this.criterion = new Criterion(`uuid`, QueryOperator.equals, value);
    }

    isSatisfiedBy(model: DatabaseUuidDocument): boolean {
        return this.criterion.value === model.uuid;
    }
}

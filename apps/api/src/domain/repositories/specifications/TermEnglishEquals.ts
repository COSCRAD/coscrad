import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { Criterion } from 'apps/api/src/domain/repositories/interfaces/Criterion';
import { ISpecification } from 'apps/api/src/domain/repositories/interfaces/ISpecification';
import { QueryOperator } from 'apps/api/src/domain/repositories/interfaces/QueryOperator';

export default class TermEnglishEquals implements ISpecification<Term, string> {
    /**
     * Eventually we'll need a way to compose Specifications or Criteria. Let's
     * cross that bridge when we get there.
     */
    public readonly criterion: Criterion<string>;

    constructor(private readonly value: string) {
        this.criterion = new Criterion(`termEnglish`, QueryOperator.equals, value);
    }

    isSatisfiedBy({ termEnglish }: Term): boolean {
        return termEnglish === this.value;
    }
}

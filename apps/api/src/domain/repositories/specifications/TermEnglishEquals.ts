import { Term } from '../../models/term/entities/term.entity';
import { Criterion } from '../../repositories/interfaces/Criterion';
import { QueryOperator } from '../../repositories/interfaces/QueryOperator';
import { ISpecification } from '../interfaces/specification.interface';

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

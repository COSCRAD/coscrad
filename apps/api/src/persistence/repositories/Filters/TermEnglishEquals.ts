import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { ISpecification } from 'apps/api/src/domain/repositories/interfaces/ISpecification';

export default class TermEnglishEquals implements ISpecification<Term> {
    constructor(private readonly value: string) {}

    forAQL(docName: string) {
        return () => `FILTER ${docName}.termEnglish == '${this.value}'`;
    }

    isSatisfiedBy({ termEnglish }: Term): boolean {
        return termEnglish === this.value;
    }
}

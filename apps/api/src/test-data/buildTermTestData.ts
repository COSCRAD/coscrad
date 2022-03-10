import { Term } from '../domain/models/term/entities/term.entity';
import { PartialDTO } from '../types/partial-dto';

type TermAndModels = {
  term: PartialDTO<Term>[];
};

export default (): TermAndModels => ({
  term: [
    {
      term: 'Chil-term-1',
      termEnglish: 'Engl-term-1',
      contributorId: 'John Doe',
      id: '1',
      published: true,
    },
    {
      term: 'Chil-term-2',
      termEnglish: 'Engl-term-2',
      contributorId: 'John Doe',
      id: '2',
      published: true,
    },
    {
      term: 'Chil-term-no-english',
      contributorId: 'Jane Deer',
      id: '3',
      published: false,
    },
  ].map((dto) => new Term(dto)),
});

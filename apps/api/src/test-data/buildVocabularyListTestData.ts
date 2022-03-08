import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { PartialDTO } from '../types/partial-dto';

type VocabularyListModels = {
  vocabularyList: PartialDTO<VocabularyList>[];
};

export default (): VocabularyListModels => ({
  vocabularyList: [
    // Vocabulary List 1
    {
      id: 'vocabulary-list-id-1',
      name: 'test VL 1 chil',
      nameEnglish: 'test VL 1 engl',
      entries: [
        {
          termId: '1',
          variableValues: {
            person: '11',
          },
        },
        {
          termId: '2',
          variableValues: {
            person: '21',
          },
        },
      ],
      variables: [
        {
          name: 'person',
          type: 'dropbox',
          validValues: [
            {
              display: 'I',
              value: '11',
            },
            {
              display: 'We',
              value: '21',
            },
          ],
        },
      ],
    },
    // Vocabulary List 2
    {
      id: 'vocabulary-list-id-2',
      name: 'test VL 2 CHIL- no engl name',
      entries: [
        {
          termId: '2',
          variableValues: {
            person: '23',
          },
        },
      ],
      variables: [],
    },
  ].map((dto) => new VocabularyList(dto)),
});

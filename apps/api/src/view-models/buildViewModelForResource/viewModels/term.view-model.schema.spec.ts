import { getCoscradDataSchema } from '@coscrad/data-types';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { DTO } from '../../../types/DTO';
import { TermViewModel } from './term.view-model';

describe(`Term View Model's schema`, () => {
    const _ = new Term({} as DTO<Term>);

    it('should match the snapshot', () => {
        const schema = getCoscradDataSchema(TermViewModel);

        expect(schema).toMatchSnapshot();
    });
});

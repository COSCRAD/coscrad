import { getCoscradDataSchema } from '@coscrad/data-types';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { DTO } from '../../../types/DTO';
import { TermViewModel } from './term.view-model';

/***
 * Note: This is a temporary test. Once we expose the view model schemas
 * as part of a query, we can check a snapshot of part of said query's
 * integration test.
 */
describe(`Term View Model's schema`, () => {
    const _ = new Term({} as DTO<Term>);

    it('should match the snapshot', () => {
        const schema = getCoscradDataSchema(TermViewModel);

        expect(schema).toMatchSnapshot();
    });
});

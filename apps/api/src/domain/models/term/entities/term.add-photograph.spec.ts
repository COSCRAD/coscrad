import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotOverridePhotographForTermError } from '../errors/cannot-override-photograph-for-term.error';
import { Term } from './term.entity';

const existingTermWithNoPhotohgraph = buildTestInstance(Term, {
    photographId: undefined,
});

const photograpgId = buildDummyUuid(5);

describe(`Term.addPhotograph`, () => {
    describe(`when the term does not have a photograph to start with`, () => {
        it(`should add the photograph`, () => {
            const result = existingTermWithNoPhotohgraph.addPhotophraph(photograpgId);

            expect(result).not.toBeInstanceOf(InternalError);
        });
    });

    describe(`when there is already a photograph for the term`, () => {
        it(`should return the expected error`, () => {
            const existingTermThatHasAPhotograph = existingTermWithNoPhotohgraph.clone({
                photographId: buildDummyUuid(22),
            });

            const result = existingTermThatHasAPhotograph.addPhotophraph(photograpgId);

            assertErrorAsExpected(
                result,
                new CannotOverridePhotographForTermError(
                    existingTermWithNoPhotohgraph.id,
                    photograpgId,
                    existingTermThatHasAPhotograph.photographId
                )
            );
        });
    });
});

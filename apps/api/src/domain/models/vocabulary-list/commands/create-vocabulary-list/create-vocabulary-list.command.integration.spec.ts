import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';

const commandType = 'CREATE_VOCABULARY_LIST';

describe(commandType, () => {
    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: emptyInitialState,
                buildValidCommandFSA,
            });
        });
    });
});

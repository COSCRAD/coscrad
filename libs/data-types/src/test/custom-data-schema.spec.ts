import 'reflect-metadata';
import getCoscradDataSchema from '../lib/utilities/getCoscradDataSchema';
import buildSimpleValidationFunction from '../lib/validation/buildSimpleValidationFunction';

import { buildValidWidgetDto, Widget } from './widget';
describe('NonEmptyString', () => {
    const validWidgetDTO = buildValidWidgetDto();

    it('should populate the appropriate metadata', () => {
        const actualMetadata = getCoscradDataSchema(Widget);

        expect(actualMetadata).toMatchSnapshot();
    });

    describe('the corresponding invariant validation', () => {
        describe('when the data is valid', () => {
            it('should return Valid', () => {
                const result = buildSimpleValidationFunction(Widget)(validWidgetDTO);

                expect(result).toStrictEqual([]);
            });
        });
    });

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182578952]
     * test the invalid data cases
     *
     * It may be helpful to wait for the following story to be finished
     * [https://www.pivotaltracker.com/story/show/182217249]
     */
});

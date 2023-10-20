/**
 * Unit test DigitalText.addPage
 * - build an existing text
 * - attempt to add a new page (valid and invalid cases)
 * - valid - check that state is updates
 * - invalid - check that error results
 * - test for empty string
 * - fuzz test
 *
 */

import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../types/AggregateType';
import { AddPageForDigitalText } from './commands/add-page/add-page-for-digital-text.command';
import { ADD_PAGE_FOR_DIGITAL_TEXT } from './constants';
import DigitalTextPage from './digital-text-page.entity';

const commandType = ADD_PAGE_FOR_DIGITAL_TEXT;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [
        new DigitalTextPage({
            identifier: 'IV',
        }),
        new DigitalTextPage({
            identifier: 'V',
        }),
    ],
});

const newDuplicatePageIdentifier = 'IV';

const newValidPageIdentifier = '23';

const validPayload: AddPageForDigitalText = {
    aggregateCompositeIdentifier: existingDigitalText.getCompositeIdentifier(),
    pageIdentifier: newValidPageIdentifier,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const inValidPayload: AddPageForDigitalText = {
    aggregateCompositeIdentifier: existingDigitalText.getCompositeIdentifier(),
    pageIdentifier: newDuplicatePageIdentifier,
};

const InValidCommandFSA = {
    type: commandType,
    payload: inValidPayload,
};

describe(commandType, () => {
    describe(`When there is no duplicate page identifier`, () => {
        it.todo(`should succeed`);
    });
});

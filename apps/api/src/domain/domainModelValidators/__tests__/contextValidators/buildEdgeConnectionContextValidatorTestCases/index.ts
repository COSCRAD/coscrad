import { buildPageRangeTestCase } from './pageRange.contextValidator.TestCase';
import { buildTextFieldContextTestCase } from './textField.contextValidator.TestCase';
import { buildTimeRangeTestCase } from './timeRange.contextValidator.TestCase';

export default () => [
    buildPageRangeTestCase(),
    buildTimeRangeTestCase(),
    buildTextFieldContextTestCase(),
];

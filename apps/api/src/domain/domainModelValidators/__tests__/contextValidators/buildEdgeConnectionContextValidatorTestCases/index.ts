import { buildFreeMultilineTestCase } from './freeMultiline.contextValidator.TestCase';
import { buildPageRangeTestCase } from './pageRange.contextValidator.TestCase';
import { buildPointContextTestCase } from './point.contextValidator.TestCase';
import { buildTextFieldContextTestCase } from './textField.contextValidator.TestCase';
import { buildTimeRangeTestCase } from './timeRange.contextValidator.TestCase';

export default () => [
    buildFreeMultilineTestCase(),
    buildPageRangeTestCase(),
    buildPointContextTestCase(),
    buildTextFieldContextTestCase(),
    buildTimeRangeTestCase(),
];

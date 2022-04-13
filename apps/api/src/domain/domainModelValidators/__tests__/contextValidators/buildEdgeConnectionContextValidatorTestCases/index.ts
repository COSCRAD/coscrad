import { buildPageRangeTestCase } from './pageRange.contextValidator.TestCase';
import { buildTimeRangeTestCase } from './timeRange.contextValidator.TestCase';

export default () => [buildPageRangeTestCase(), buildTimeRangeTestCase()];

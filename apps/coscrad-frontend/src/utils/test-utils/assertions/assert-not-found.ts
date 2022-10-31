import { TestId } from '../constants';
import { assertElementWithTestIdOnScreen } from './assert-element-with-test-id-on-screen';

export const assertNotFound = () => assertElementWithTestIdOnScreen(TestId.notFound);

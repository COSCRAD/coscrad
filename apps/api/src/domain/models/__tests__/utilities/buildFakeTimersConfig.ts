import { dummyDateNow } from './dummyDateNow';

/**
 * We build this so not to share references via the config object.
 */
export const buildFakeTimersConfig = (): FakeTimersConfig => ({
    now: dummyDateNow,
});

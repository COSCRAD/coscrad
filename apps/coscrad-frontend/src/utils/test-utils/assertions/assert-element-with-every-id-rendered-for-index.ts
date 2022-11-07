import { assertElementWithTestIdOnScreen } from './assert-element-with-test-id-on-screen';

type HasId<T> = T & {
    id: string;
};

export const assertElementWithEveryIdRenderedForIndex = async <T>(models: HasId<T>[]) => {
    const numberOfModelsForIndexAssertion = models.length;

    expect(numberOfModelsForIndexAssertion).toBeGreaterThan(0);

    models.forEach(async ({ id }) => await assertElementWithTestIdOnScreen(id));
};

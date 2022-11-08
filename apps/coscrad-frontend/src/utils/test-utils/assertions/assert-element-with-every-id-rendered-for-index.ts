import { screen, waitFor } from '@testing-library/react';

type HasId<T> = T & {
    id: string;
};

export const assertElementWithEveryIdRenderedForIndex = async <T>(models: HasId<T>[]) => {
    const numberOfModelsForIndexAssertion = models.length;

    expect(numberOfModelsForIndexAssertion).toBeGreaterThan(0);

    // models.forEach(async ({ id }) => await assertElementWithTestIdOnScreen(id));

    await waitFor(() =>
        models.forEach(({ id }) => {
            expect(screen.getByTestId(id)).toBeTruthy();
        })
    );
};

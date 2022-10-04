export const defaultPresenter = (data: unknown) => (
    // Iterate on this as needed
    <div>{JSON.stringify(data).replace(/"/g, '')}</div>
);

import { MemoryRouter, Route, Routes } from 'react-router-dom';

type BaseRoute = `/${string}/`;

export const withDetailRoute = (
    idInLocation: string,
    baseRoute: BaseRoute,
    element: JSX.Element
) => (
    <MemoryRouter initialEntries={[`${baseRoute}${idInLocation}`]}>
        <Routes>
            <Route path={`${baseRoute}:id`} element={element} />
        </Routes>
    </MemoryRouter>
);

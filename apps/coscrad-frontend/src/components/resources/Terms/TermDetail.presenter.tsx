import { IBaseViewModel } from '@coscrad/api-interfaces';

export const TermDetailPresenter = (termViewModel: IBaseViewModel): JSX.Element => (
    <div data-testid={termViewModel.id}>
        <h1>Term: {termViewModel.id}</h1>
        {JSON.stringify(termViewModel)}
    </div>
);

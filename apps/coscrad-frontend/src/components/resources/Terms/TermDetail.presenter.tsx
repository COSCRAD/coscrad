import { IBaseViewModel } from '@coscrad/api-interfaces';

export const TermDetailPresenter = (termViewModel: IBaseViewModel): JSX.Element => (
    <div>
        <h1>Term: {termViewModel.id}</h1>
        {JSON.stringify(termViewModel)}
    </div>
);

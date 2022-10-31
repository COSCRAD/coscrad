import { ITermViewModel } from '@coscrad/api-interfaces';

// TODO Bring across the custom component from the `tng-dictionary` project
// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailPresenter = (termViewModel: ITermViewModel): JSX.Element => (
    <div data-testid={termViewModel.id}>
        <h1>Term: {termViewModel.id}</h1>
        {JSON.stringify(termViewModel)}
    </div>
);

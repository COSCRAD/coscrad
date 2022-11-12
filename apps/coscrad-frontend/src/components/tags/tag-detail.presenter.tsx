import { ITagViewModel } from '@coscrad/api-interfaces';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagDetailPresenter = ({ id, label }: ITagViewModel): JSX.Element => (
    <div data-testid={id}>
        {label} (id: {id})
    </div>
);

import { ITag } from '@coscrad/api-interfaces';

export const TagDetailPresenter = ({ id, label }: ITag): JSX.Element => (
    <div data-testid={id}>
        {label} (id: {id})
    </div>
);

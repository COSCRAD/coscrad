import { ITag } from '@coscrad/api-interfaces';

export const TagDetailPresenter = ({ id, label }: ITag): JSX.Element => (
    <div>
        {label} (id: {id})
    </div>
);

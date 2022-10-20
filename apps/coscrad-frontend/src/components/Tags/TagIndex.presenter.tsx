import { ITag } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

interface HasTags {
    tags: ITag[];
}

export const TagIndexPresenter = ({ tags }: HasTags): JSX.Element => (
    <div>
        {tags.map((tag) => (
            // TODO Format as table
            <div key={tag.id} data-testid={tag.id}>
                <Link to={`/Tags/${tag.id}`}>
                    {tag.label} (id: {tag.id})
                </Link>
            </div>
        ))}
        {/* <h2>Index Actions</h2> */}
        {/* <CommandPanel actions={tagsData.actions}></CommandPanel> */}
    </div>
);

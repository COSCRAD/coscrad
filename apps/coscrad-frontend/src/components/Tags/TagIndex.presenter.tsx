import { ITagViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

type HasViewModels<TViewModel> = {
    data: TViewModel[];
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagIndexPresenter = ({ data: tags }: HasViewModels<ITagViewModel>): JSX.Element => (
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

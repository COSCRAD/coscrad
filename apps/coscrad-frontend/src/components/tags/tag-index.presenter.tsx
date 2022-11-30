import { ITagViewModel } from '@coscrad/api-interfaces';
import { LinkSharp as LinkIcon } from '@mui/icons-material';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ResourcesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailResourceDetailPresenterFactory } from '../resources/factories/thumbnail-resource-detail-presenter-factory';

type HasViewModels<TViewModel> = {
    data: TViewModel[];
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagIndexPresenter = ({ data: tags }: HasViewModels<ITagViewModel>): JSX.Element => {
    // const allResourceTypes = tags.reduce(
    //     ({members}) =>
    // )

    const resourceTypesAndSelectedIds = {
        term: ['1'],
    };

    return (
        <div>
            {tags.map((tag) => (
                <Card>
                    <CardHeader title={tag.label} />
                    <CardContent>
                        <h3>Tagged Resources</h3>
                        <ResourcesOfMultipleTypeContainer
                            resourceTypeAndIds={resourceTypesAndSelectedIds}
                            resourceDetailPresenterFactory={thumbnailResourceDetailPresenterFactory}
                        />
                    </CardContent>
                    <CardActionArea>
                        <CardActions>
                            <Link to={tag.id}>
                                <IconButton>
                                    <LinkIcon />
                                </IconButton>
                            </Link>
                        </CardActions>
                    </CardActionArea>
                </Card>
            ))}
            {/* <h2>Index Actions</h2> */}
            {/* <CommandPanel actions={tagsData.actions}></CommandPanel> */}
        </div>
    );
};

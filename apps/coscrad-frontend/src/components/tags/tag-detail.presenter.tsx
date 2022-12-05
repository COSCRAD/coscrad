import { ITagViewModel } from '@coscrad/api-interfaces';
import { LinkSharp as LinkIcon } from '@mui/icons-material';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagDetailPresenter = ({ id, label, members }: ITagViewModel): JSX.Element => {
    const allResourceTypesWithRepeats = members.flatMap(({ type }) => type);

    const uniqueResourceTypesWithThisTag = [...new Set(allResourceTypesWithRepeats)];

    const initialEmptyReosurceTypesAndSelectedIds = uniqueResourceTypesWithThisTag.reduce(
        (acc, resourceType) => ({
            ...acc,
            [resourceType]: [],
        }),
        {}
    );

    // A Map might improve readability here
    /**
     * TODO Let's update `CategorizablesOfMultipleTypesContainer` to take in `members`
     */
    const resourceTypesAndSelectedIds = members.reduce(
        (acc, { type: resourceType, id }) => ({
            ...acc,
            [resourceType]: acc[resourceType].concat(id),
        }),
        initialEmptyReosurceTypesAndSelectedIds
    );

    return (
        <div data-testid={id}>
            <Card>
                <CardHeader title={label} />
                <Divider />
                <CardContent>
                    <CategorizablesOfMultipleTypeContainer
                        categorizableTypeAndIds={resourceTypesAndSelectedIds}
                        detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                        heading="Tagged Resources"
                    />
                </CardContent>
                <CardActionArea>
                    <CardActions>
                        <Link to={id}>
                            <IconButton>
                                <LinkIcon />
                            </IconButton>
                        </Link>
                    </CardActions>
                </CardActionArea>
            </Card>
        </div>
    );
};

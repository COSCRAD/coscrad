import { ITagViewModel } from '@coscrad/api-interfaces';
import { LinkSharp as LinkIcon } from '@mui/icons-material';
import { Card, CardActionArea, CardActions, CardContent, CardHeader, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagDetailPresenter = ({ id, label, members }: ITagViewModel): JSX.Element => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={label} />
            <Divider />
            <CardContent>
                <CategorizablesOfMultipleTypeContainer
                    members={members}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    heading="Tagged Resources"
                />
            </CardContent>
            <CardActionArea>
                <CardActions>
                    <Link to={id}>
                        <LinkIcon />
                    </Link>
                </CardActions>
            </CardActionArea>
        </Card>
    </div>
);

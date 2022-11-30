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
import { CategorizableOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-resource-detail-presenter-factory';
import { createMultipleCategorizableLookupTable } from './createMultipleCategorizableLookupTable';

export const TagCard = ({ id, label, members }: ITagViewModel): JSX.Element => {
    const resourceTypesAndSelectedIds = createMultipleCategorizableLookupTable(members);

    return (
        <Card>
            <CardHeader title={label} />
            <Divider />
            <CardContent>
                <CategorizableOfMultipleTypeContainer
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
    );
};

import { Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { AppLinkDisplay } from './AppLinkDisplay';
import { AppInfo } from './AppsDisplay';

export function AppInfoDisplay({ name, image, meta, description, links }: AppInfo) {
    return (
        <div>
            {' '}
            <Card variant="outlined" className="appCard" key={name}>
                <CardContent>
                    <Typography color={'white'} variant="h5" component="div">
                        {name}
                    </Typography>
                    <Typography className="appMeta" color="red">
                        {meta}
                    </Typography>

                    <CardMedia className="appImage" component={'img'} image={image} />

                    <Typography className="appDescription" variant="body2" color={'white'}>
                        {description}
                    </Typography>
                    {links.map((link) => (
                        <CardActions>
                            {' '}
                            <AppLinkDisplay {...link} />{' '}
                        </CardActions>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

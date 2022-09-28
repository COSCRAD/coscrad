import LaunchIcon from '@mui/icons-material/Launch';

type LinkPresenterProps = {
    name: string;
    url: string;
    description: string;
};

export const LinkPresenter = ({ name, url, description }: LinkPresenterProps): JSX.Element => (
    <div>
        <a className="linkName" href={url} target="_blank">
            <h2>
                {name} <LaunchIcon />
            </h2>
        </a>
        <p className="presenterParagraph">{description}</p>
    </div>
);

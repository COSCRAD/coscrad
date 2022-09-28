import LaunchIcon from '@mui/icons-material/Launch';

type FunderPresenterProps = {
    name: string;
    url: string;
    description: string;
};

export const FunderPresenter = ({ name, url, description }: FunderPresenterProps): JSX.Element => (
    <div>
        <a className="linkName" href={url} target={'_blank'} rel="noreferrer">
            <h3 className="funderLink">
                {name} <LaunchIcon />
            </h3>
        </a>

        <p className="presenterParagraph">{description}</p>
    </div>
);

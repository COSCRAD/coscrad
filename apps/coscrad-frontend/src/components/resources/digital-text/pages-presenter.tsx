import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { styled } from '@mui/material';
import { PagePresenter } from './page-presenter';

const PagesContainer = styled('div')({
    width: '100%',
    position: 'relative',
});

interface PagePresenterProps {
    pages: IDigitalTextPage[];
}

export const PagesPresenter = ({ pages }: PagePresenterProps): JSX.Element => {
    return (
        <PagesContainer>
            {pages.map((page) => (
                <PagePresenter page={page} />
            ))}
        </PagesContainer>
    );
};

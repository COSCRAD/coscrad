import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Typography, styled } from '@mui/material';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';

const Page = styled('div')({
    width: '120px',
    height: '200px',
    position: 'relative',
});

interface PagePresenterProps {
    page: IDigitalTextPage;
}

export const PagePresenter = ({ page }: PagePresenterProps): JSX.Element => {
    const { identifier, content } = page;

    // const englishPageContent = items.filter(
    //     ({ languageCode }) => languageCode === LanguageCode.English
    // );

    return (
        <Page>
            <MultilingualTextPresenter text={content} />
            {/* {englishPageContent.map(({ text }) => (
                <Typography>{text}</Typography>
            ))} */}
            <Typography>{identifier}</Typography>
        </Page>
    );
};

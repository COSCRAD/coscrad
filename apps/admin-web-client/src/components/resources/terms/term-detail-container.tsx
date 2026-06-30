import { useParams } from 'react-router-dom';
import { NotesAboutTerm } from './notes-about-term';
import { TermDetailPage } from './term-detail.page';

export const TermDetailContainer = (): JSX.Element => {
    const { id } = useParams();

    return (
        <>
            <TermDetailPage id={id} />
            <NotesAboutTerm termId={id} />
        </>
    );
};

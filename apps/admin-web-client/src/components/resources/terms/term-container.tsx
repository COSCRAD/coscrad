import { useParams } from 'react-router-dom';
import { NotesAboutTerm } from './notes-about-term';
import { TermDetail } from './term-detail.page';

export const TermContainer = (): JSX.Element => {
    const { id } = useParams();

    return (
        <>
            <TermDetail id={id} />
            <NotesAboutTerm termId={id} />
        </>
    );
};

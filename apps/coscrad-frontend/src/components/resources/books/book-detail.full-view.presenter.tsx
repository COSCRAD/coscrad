import { IBookViewModel, ICategorizableDetailQueryResult } from '@coscrad/api-interfaces';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton } from '@mui/material';
import { useCallback, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import styles from './book-detail.full-view.presenter.module.scss';
import { BookReader } from './pages';

export const BookDetailFullViewPresenter = ({
    id,
    pages,
    title,
    subtitle,
    author,
    publicationDate,
}: ICategorizableDetailQueryResult<IBookViewModel>): JSX.Element => {
    const fullScreenHandle = useFullScreenHandle();
    const [screenState, setScreenState] = useState(false);

    const fullScreenChange = useCallback(
        (state) => {
            setScreenState(state);
        },
        [fullScreenHandle]
    );

    return (
        <div data-testid={id}>
            <FullScreen
                className={styles['book-container']}
                handle={fullScreenHandle}
                onChange={fullScreenChange}
            >
                <div className={styles['book-actions']}>
                    {!screenState && (
                        <IconButton onClick={fullScreenHandle.enter}>
                            <FullscreenIcon />
                        </IconButton>
                    )}
                    {screenState && (
                        <IconButton onClick={fullScreenHandle.exit}>
                            <FullscreenExitIcon />
                        </IconButton>
                    )}
                </div>
                <div>
                    <h1>{title}</h1>
                    {subtitle && <h3>{subtitle}</h3>}
                    <strong>by</strong> {author}
                    <br />
                    {publicationDate && (
                        <div>
                            <strong>published</strong> {publicationDate}
                        </div>
                    )}
                </div>
                <div className={styles['book-reader-container']}>
                    <BookReader pages={pages} />
                </div>
            </FullScreen>
        </div>
    );
};

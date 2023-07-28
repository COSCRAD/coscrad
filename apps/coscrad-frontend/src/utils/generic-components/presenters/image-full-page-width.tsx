import { styled } from '@mui/material';
import { ImageAsset } from './image-in-content';
import { StyledImage } from './styled-image';

interface FullImageViewProps {
    image: ImageAsset;
}

const StyledFullViewFigure = styled('figure')({
    left: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    maxWidth: '100vw',
    position: 'relative',
    right: '50%',
    width: '100vw',
    marginTop: '-7%',
});

export const ImageFullPageWidth = ({ image }: FullImageViewProps): JSX.Element => {
    const { title, src } = image;

    const alt = `Image Title: ${title}`;

    return (
        <StyledFullViewFigure>
            <StyledImage
                sx={{ width: '100%', maxHeight: '80vh', display: 'block', objectFit: 'cover' }}
                src={src}
                alt={alt}
            />
        </StyledFullViewFigure>
    );
};

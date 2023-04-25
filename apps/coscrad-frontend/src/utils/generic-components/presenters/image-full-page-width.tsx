import { styled } from '@mui/material';
import { ImageAsset } from './image-in-content';
import { StyledImage } from './styled-image';

interface FullImageViewProps {
    image: ImageAsset;
}

const StyledFullViewFigure = styled('figure')({
    width: '100%',
    display: 'block',
    margin: '0 0 2% 0',
});

export const ImageFullPageWidth = ({ image }: FullImageViewProps): JSX.Element => {
    const { title, src } = image;

    const alt = `Image Title: ${title}`;

    return (
        <StyledFullViewFigure>
            <StyledImage
                sx={{ width: '100%', maxHeight: '60vh', display: 'block', objectFit: 'cover' }}
                src={src}
                alt={alt}
            />
        </StyledFullViewFigure>
    );
};
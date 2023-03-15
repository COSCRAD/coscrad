import { styled, Typography } from '@mui/material';
import { StyledImage } from './styled-image';

export type ImageAsset = {
    title: string;
    src: string;
    width: number;
    height: number;
};

interface ImageInContentProps {
    image: ImageAsset;
    displayWidth?: string;
    title?: string;
    alignment?: 'left' | 'right';
}

/**
 * Note: This is just a placeholder component for a more complete approach in our CMS
 * Need to find a way to separate design, e.g., `alignment` from data, e.g., `ImageAsset`
 * Frontmatter photos should eventually come from the Photo resource in the Web of Knowledge
 * Could add the caption feature as a part of this.  It could be optional.
 * The image could have an optional borderRadius to round the corners
 * Eventually in the CMS clicking on the image could open it in full screen
 */

const StyledContentFigure = styled('figure')({
    float: 'left',
    position: 'relative',
    margin: '15px',
});

export const ImageInContent = ({ image, displayWidth, alignment }: ImageInContentProps) => {
    const { title, src, width } = image;

    const alt = `Image Title: ${title}`;

    return (
        <StyledContentFigure sx={{ width: displayWidth }}>
            <StyledImage sx={{ width: '100%', borderRadius: '5px' }} src={src} alt={alt} />
            <figcaption>
                <Typography variant="caption">{title}</Typography>
            </figcaption>
        </StyledContentFigure>
    );
};

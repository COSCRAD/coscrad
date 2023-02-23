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

export const ImageInContent = ({ image, displayWidth, alignment }: ImageInContentProps) => {
    const { title, src, width, height } = image;

    const alt = `Image Title: ${title}`;

    const divStyle = {
        width: displayWidth,
        float: alignment,
        position: 'relative',
        margin: '15px',
    } as React.CSSProperties;

    const imgStyle = {
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '7px',
    };

    return (
        <div style={divStyle}>
            <img style={imgStyle} src={src} alt={alt} title={title} width={width} height={height} />
        </div>
    );
};

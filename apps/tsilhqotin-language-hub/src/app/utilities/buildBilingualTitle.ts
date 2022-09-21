export default (title: string | undefined, titleEnglish: string | undefined): string => {
    if (!titleEnglish) return title;
    if (!title) return titleEnglish;

    return `${title} (${titleEnglish})`;
};

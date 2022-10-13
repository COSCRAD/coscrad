import rawData from './frontMatterData/configurable-front-matter.config.json';
import FrontMatter from './frontMatterData/FrontMatter';
import validateFrontMatter, { isErrorArray } from './validation/validateFrontMatter';

export default (): FrontMatter | Error => {

    const validationResult = validateFrontMatter(rawData);

    if (isErrorArray(validationResult)) {
        const msg = `Invalid front matter data encountered. Error: `
                    + `${validationResult}`;

        return new Error(msg);
    }

    return rawData as FrontMatter;
};
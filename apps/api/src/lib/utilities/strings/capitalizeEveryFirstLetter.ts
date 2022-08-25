import capitalizeFirstLetter from './capitalizeFirstLetter';

export default (inputString: string): string =>
    inputString.split(' ').map(capitalizeFirstLetter).join(' ');

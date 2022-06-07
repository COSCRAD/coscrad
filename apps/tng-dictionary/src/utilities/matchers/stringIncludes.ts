export default (input: string | null, textToMatch: string) =>
    // No match if the input is falsey
    input ? input.toLowerCase().includes(textToMatch.toLowerCase()) : false;

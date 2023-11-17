/**
 * There are several ways we can arrive at multiple translations of a
 * term, starting with an
 * - original
 * - gloss the original term in the context of a larger text
 * - translate to a target (typically indigenous) language based on a prompt (typically in the colonial language)
 * - freely translate a word, phrase, sentence, or larger text from the original to the target language
 * - literally (word for word) translate a passage of text from the original to the target language
 *
 * Within our system, we will encounter all of these situations. It is
 * important to capture this information in the database from the point of
 * view of linguistic integrity of the data collected. At a practical level,
 * this distinction helps us avoid misleading learners who take "translations"
 * between languages too literally.
 */
export enum MultilingualTextItemRole {
    original = 'original',
    glossedTo = 'glossed to',
    freeTranslation = 'free translation',
    literalTranslation = 'literal translation',
    elicitedFromPrompt = 'elicited from a prompt',
}

const firstWord = 'apple';

const secondWord = 'banana';

const lastWord = 'zebra';

const fifthWord = 'ear';

/**
 * TODO Move this to a fixture data, using a pattern that
 * allows us to override select props for the purpose of the test.
 */
const testAlphabetCharts = [
    {
        _key: '19108083',
        _id: 'games/19108083',
        _rev: '_hUV8QLe---',
        name: 'alphabet',
        data: {
            id: 1,
            name: 'English Alphabet',
            name_english: 'English Alphabet',
            poster: {
                name: 'Alphabet_v10.pdf',
                url: 'Alphabet_v10_aad2987b30.pdf',
            },
            credits: {
                images: 'Pixabay (CC0 sources), and Shutterstock (paid license)',
                'spelling by': 'Barb Speller',
                'app development': {
                    backend: {
                        'Builds and Deployment': 'John Dog',
                        'Database Administration': 'John Dog',
                        'API design and development': 'John Dog',
                    },
                    frontend: {
                        styling: 'Barb Speller',
                        'UI and UX': 'Barb Speller',
                        mobile: 'Barb Speller',
                    },
                },
                'images edited by': 'Barb Speller',
                'word list compiled by': 'Barb Speller with assistance from John Dog',
            },
            alphabet_cards: [
                {
                    letter: 'a',
                    word: firstWord,
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '1',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c1',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l1',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w1',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c1',
                },
                {
                    letter: 'b',
                    word: secondWord,
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '2',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c2',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l2',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w2',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c2',
                },
                {
                    letter: 'c',
                    word: 'car',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '3',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c3',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l3',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w3',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c3',
                },
                {
                    letter: 'd',
                    word: 'deer',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '4',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c4',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l4',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w4',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c4',
                },
                {
                    letter: 'e',
                    word: fifthWord,
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '5',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c5',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l5',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w5',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c5',
                },
                {
                    letter: 'f',
                    word: 'fork',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '6',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c6',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l6',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w6',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c6',
                },
                {
                    letter: 'g',
                    word: 'goat',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '7',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c7',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l7',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w7',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c7',
                },
                {
                    letter: 'h',
                    word: 'horse',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '8',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c8',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l8',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w8',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c8',
                },
                {
                    letter: 'i',
                    word: 'insect',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '9',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c9',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l9',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w9',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c9',
                },
                {
                    letter: 'j',
                    word: 'jacket',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '10',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c10',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l10',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w10',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c10',
                },
                {
                    letter: 'k',
                    word: 'knife',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '11',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c11',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l11',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w11',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c11',
                },
                {
                    letter: 'l',
                    word: 'lion',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '12',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c12',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l12',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w12',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c12',
                },
                {
                    letter: 'm',
                    word: 'moose',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '13',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c13',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l13',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w13',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c13',
                },
                {
                    letter: 'n',
                    word: 'nose',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '14',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c14',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l14',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w14',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c14',
                },
                {
                    letter: 'o',
                    word: 'orange',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '15',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c15',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l15',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w15',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c15',
                },
                {
                    letter: 'p',
                    word: 'phone',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '16',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c16',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l16',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w16',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c16',
                },
                {
                    letter: 'q',
                    word: 'quilt',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '17',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c17',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l17',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w17',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c17',
                },
                {
                    letter: 'r',
                    word: 'rope',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '18',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c18',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l18',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w18',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c18',
                },
                {
                    letter: 's',
                    word: 'sheep',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '19',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c19',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l19',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w19',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c19',
                },
                {
                    letter: 't',
                    word: 'tomato',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '20',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c20',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l20',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w20',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c20',
                },
                {
                    letter: 'u',
                    word: 'umbrella',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '21',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c21',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l21',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w21',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c21',
                },
                {
                    letter: 'v',
                    word: 'vest',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '22',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c22',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l22',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w22',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c22',
                },
                {
                    letter: 'w',
                    word: 'wolf',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '23',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c23',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l23',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w23',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c23',
                },
                {
                    letter: 'x',
                    word: 'xylophone',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '24',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c24',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l24',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w24',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c24',
                },
                {
                    letter: 'y',
                    word: 'yellow',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '25',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c25',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l25',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w25',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c25',
                },
                {
                    letter: 'z',
                    word: lastWord,
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    sequence_number: '26',
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c26',
                    letter_audio: 'English_Alphabet_Plahn_Aaron_2024_l26',
                    word_audio: 'English_Alphabet_Plahn_Aaron_2024_w26',
                    standalone_image: 'English_Alphabet_Plahn_Aaron_2024_c26',
                },
            ],
        },
    },
    {
        _key: '23442315',
        _id: 'games/23442315',
        _rev: '_h8U_EOq---',
        name: 'broken-media-links',
        data: {
            alphabet_cards: [
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c1',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'a',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '1',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'apple',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c2',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'b',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '2',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'banana',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c3',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'c',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '3',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'car',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c4',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'd',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '4',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'deer',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c5',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'e',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '5',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'ear',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c6',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'f',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '6',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'fork',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c7',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'g',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '7',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'goat',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c8',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'h',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '8',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'horse',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c9',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'i',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '9',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'insect',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c10',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'j',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '10',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'jacket',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c11',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'k',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '11',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'knife',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c12',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'l',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '12',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'lion',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c13',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'm',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '13',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'moose',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c14',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'n',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '14',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'nose',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c15',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'o',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '15',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'orange',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c16',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'p',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '16',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'phone',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c17',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'q',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '17',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'quilt',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c18',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'r',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '18',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'rope',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c19',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 's',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '19',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'sheep',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c20',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 't',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '20',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'tomato',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c21',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'u',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '21',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'umbrella',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c22',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'v',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '22',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'vest',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c23',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'w',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '23',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'wolf',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c24',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'x',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '24',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'xylophone',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c25',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'y',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '25',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'yellow',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
                {
                    card_image: 'English_Alphabet_Plahn_Aaron_2024_c26',
                    credits: {
                        audio: 'John Dog',
                        spelling: 'Barb Speller',
                        'audio edited by': 'Nick DeAudioguy',
                        'image edited by': 'John Dog',
                    },
                    letter: 'z',
                    letter_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/letter',
                    sequence_number: '26',
                    standalone_image:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/image',
                    word: 'zebra',
                    word_audio:
                        'English_Alphabet_Plahn_Aaron_2024_https://www.tsilhqotinlanguage.ca/never-found/word',
                },
            ],
            credits: {
                images: 'Pixabay (CC0 sources), and Shutterstock (paid license)',
                'spelling by': 'Barb Speller',
                'app development': {
                    backend: {
                        'Builds and Deployment': 'John Dog',
                        'Database Administration': 'John Dog',
                        'API design and development': 'John Dog',
                    },
                    frontend: {
                        styling: 'Barb Speller',
                        'UI and UX': 'Barb Speller',
                        mobile: 'Barb Speller',
                    },
                },
                'images edited by': 'Barb Speller',
                'word list compiled by': 'Barb Speller with assistance from John Dog',
            },
            id: 3,
            name: 'Alphabet with broken media links',
            name_english: 'Alphabet with broken media links',
            poster: {
                name: 'Alphabet_v10.pdf',
                url: 'Alphabet_v10_aad2987b30.pdf',
            },
        },
    },
];

const noTestAlphabetCharts = [];

describe('alphabet', () => {
    describe('when an alphabet chart has been configured', () => {
        before(() => {
            cy.clearDatabase();

            cy.seedDatabase(`games`, testAlphabetCharts);
        });

        describe('The alphabet carousel', () => {
            beforeEach(() => {
                cy.visit('/Alphabet');
            });

            it('should display loading component initially', () => {
                cy.getLoading();
            });

            it('should load the first card', () => {
                cy.contains(firstWord);
            });

            //TODO check network error case

            it('should navigate to the next card', () => {
                cy.getByDataAttribute('NEXT').click();

                cy.contains(secondWord);
            });

            it('should navigate to the last card', () => {
                cy.getByDataAttribute('PREV').click();

                cy.contains(lastWord);
            });

            it('should navigate to the last card and back to the first card', () => {
                cy.getByDataAttribute('PREV').click();

                cy.getByDataAttribute('NEXT').click();

                cy.contains(firstWord);
            });

            it('should navigate to the fifth card', () => {
                cy.getByDataAttribute('NEXT').click();

                cy.getByDataAttribute('NEXT').click();

                cy.getByDataAttribute('NEXT').click();

                cy.getByDataAttribute('NEXT').click();

                cy.contains(fifthWord);
            });
        });
    });

    describe('when an alphabet chart has not been configured', () => {
        before(() => {
            cy.clearDatabase();

            cy.seedDatabase(`games`, noTestAlphabetCharts);
        });

        it('should return a fallback message', () => {
            cy.visit('/Alphabet');

            cy.contains('No alphabet chart');
        });
    });
});

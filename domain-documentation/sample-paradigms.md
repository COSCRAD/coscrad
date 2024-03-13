# Vocabulary Lists and Terms
In COSCRAD, you can add terms to a digital phrasebook. There are two kinds of terms:
1. direct terms: these were collected in the Indigenous language directly
2. prompt terms: in this flow, first you add a prompt in English and then elicit a free translation of the  prompt in the Indigenous language

Terms can be collected together into vocabulary vists. One term can be included in many vocabulary lists. Each term that has been added as a vocabulary list entry can also be differentiated from the other terms by adding custom filterable properties and values. This allows the admin user to create a morphological dictionary including noun and verb paradigms for example, but it also allows one to organize a glossary for a curriculum by unit and lesson, for example.

## Concrete Examples
### Noun Paradigm
A simple example that would apply in most languages is a noun paradigm for possession. Consider the following example in English.

**hand**
- my hand
- your (singular) hand
- his or her hand
- our hands
- your (plural) hands
- their hands
- one's hands

Say that we don't know exactly what the pattern is, but we know that these 7 terms are related. We can first add the 7 terms to a vocabulary list named "hand". Already, the end users can see all of these related words grouped together.

Then we can ask ourselves, "what is the difference between each of these forms of the word hand?" We realize that what differs is whose hand the speaker is referring too. We might call this "person", but we don't have to use a formal linguistic label. We could as well call this "who" or "possessor". The label doesn't matter; it's the structure that is important.

The next step would be to decide how to label the values of "person" for each entry. One approach is as follows:
- 11- first person singular
- 21- second person singular
- 31- third person singular
- 12- first person plural
- 22- second person plural
- 32- third person plural
- 0- default

However, the label "first person singular" is not very useful to the user, and 11 isn't much better (although it's great for linguists and data admins). For this reason, we provide a label for every property value.
**property: person**
- 11: "my"
- 21: "your (singular)"
- 31: "his or hers"
- 12: "ours"
- 22: "your (plural)"
- 32: "their"
- 0: "someon's"
Note that the range of values that matter in your language may differ. Because I work with Athabaskan, I have included a 0 \ default form, because many nouns (e.g., body parts) are "inaleniably possessed". You can't simply say "ribs", but you have to say "someone's ribs".

Also note that there may be more than one property that varies between the diffferent forms. For example, in English we indicate not only the possessor but also whether the noun is singular or plural. In that case we may have:
**singular**
- my house
- your (singular) house
- his or her house
- our house
- your (plural) house
- their house
- one's house

**plural**
- my houses
- your (singular) houses
- his or her houses
- our houses
- your (plural) houses
- their houses
- one's houses

In that case, we'd want to add a second property to the vocabulary list called "house".

__vocabulary list: house__

**property: person**
- 11: "my"
- 21: "your (singular)"
- 31: "his or hers"
- 12: "ours"
- 22: "your (plural)"
- 32: "their"
- 0: "someone's"

**property: singular**
- 1: "singular"
- 0: "plural"

### Verb Paradigms
One place where this model really shines is when building verb paradigms. Consider the following paradigm.

#### compact solid object (e.g. a book)
**imperfective ("present")**
- I am picking it (e.g. a book) up.
- You are picking it (e.g. a book) up.
- He or she is picking it (e.g. a book) up.

__negative ("not")__
- I am not picking it (e.g. a book) up.
- You are not picking it (e.g. a book) up.
- He or she is not picking it (e.g. a book) up.

**perfective ("past")**
- I picked it (e.g. a book) up.
- You picked it (e.g. a book) up.
- He or she picked it (e.g. a book) up.

__negative ("not")__
- I did not pick it (e.g. a book) up.
- You did not pick it (e.g. a book) up.
- He or she did not pick it (e.g. a book) up.

#### compact solid object, round (e.g. a berry)
**imperfective ("present")**
- I am picking it (e.g. a berry) up.
- You are picking it (e.g. a berry) up.
- He or she is picking it (e.g. a berry) up.

__negative ("not")__
- I am not picking it (e.g. a berry) up.
- You are not picking it (e.g. a berry) up.
- He or she is not picking it (e.g. a berry) up.

**perfective ("past")**
- I picked it (e.g. a berry) up.
- You picked it (e.g. a berry) up.
- He or she picked it (e.g. a berry) up.

__negative ("not")__
- I did not pick it (e.g. a berry) up.
- You did not pick it (e.g. a berry) up.
- He or she did not pick it (e.g. a berry) up.

#### ropelike object \ plural (e.g. a rope)
**imperfective ("present")**
- I am picking it (e.g. a rope) up.
- You are picking it (e.g. a rope) up.
- He or she is picking it (e.g. a rope) up.

__negative ("not")__
- I am not picking it (e.g. a rope) up.
- You are not picking it (e.g. a rope) up.
- He or she is not picking it (e.g. a rope) up.

**perfective ("past")**
- I picked it (e.g. a rope) up.
- You picked it (e.g. a rope) up.
- He or she picked it (e.g. a rope) up.

__negative ("not")__
- I did not pick it (e.g. a rope) up.
- You did not pick it (e.g. a rope) up.
- He or she did not pick it (e.g. a rope) up.

#### mushy material (e.g. mud)
**imperfective ("present")**
- I am picking it (e.g. mud) up.
- You are picking it (e.g. mud) up.
- He or she is picking it (e.g. mud) up.

__negative ("not")__
- I am not picking it (e.g. mud) up.
- You are not picking it (e.g. mud) up.
- He or she is not picking it (e.g. mud) up.

**perfective ("past")**
- I picked it (e.g. mud) up.
- You picked it (e.g. mud) up.
- He or she picked it (e.g. mud) up.

__negative ("not")__
- I did not pick it (e.g. mud) up.
- You did not pick it (e.g. mud) up.
- He or she did not pick it (e.g. mud) up.

**Note**
There are many more forms but we'll truncate for simplicity.

For this verb paradigm, we would have several properties.

**property: person**
- 11: "my"
- 21: "your (singular)"
- 31: "his or hers"
- 12: "ours"
- 22: "your (plural)"
- 32: "their"
- 0: "someone's"

**property: aspect \ mode**
- 1: 'imperfective ("present")'
- 2: 'perfective ("past")'
- 3: 'inceptive-progressive ("going to")'
- 4: 'optative ("should")'
- 5: 'inceptive-perfective ("started to")'

**property: negative**
- 1: "positive"
- 0: "negative"

**property: class of object**
- 1: solid compact object (e.g. a book)
- 2: solid compact object, round (e.g. a berry)
- 3: solid compact object, round + natural material? (e.g. a rock)
- 4: solid compact object, and place (e.g. a house)
- 4: stringlike object or plural (e.g. a rope)
- 5: granular aggregate (e.g. puzzle pieces)
- 6: granular aggregate, round (e.g. handful of berries)
- etc.

Note that from a linguistic point of view, we could split the class of object into the "classificatory class" (determines the verb stem) + quasi-gender (determines the presence of 1 or 2 additional infixes) into two properties. However, this makes it much more difficult to present the values to the user in an intuitive way. It's better to display "it (e.g. a book)" than "solid compact object", "ne gender". This is a pro of our system. A linguist could always formalize the analysis for more academic purposes; the information ins't lost. 

### Curriculum Vocabulary Lists
A more novel use of the system is to present vocabulary lists for a language textbook, for example. We might have vocabulary as follows.

Term | Definition | Unit | Lesson
this is term 1, definition for term 1, 1 basics, 1 greetings
this is term 2, definition for term 2, 1 basics, 1 greetings
...
this is term 55, definition for term 55, 2 simple verbs, 2 motion
this is term 56, definition for term 56, 2 simple verbs, 2 motion

Then we could create a single vocabulary list, "Let's talk Language X."
**property: unit**
- 1: basics
- 2: simple verbs
- 3: noun possession
- 4: classificatory verbs
...

**property: lesson**
- 1.1: greetings
- 1.2: kinship terms
- 1.3: simple commands
- 1.4: numbers
- 1.5: colors
- 2.1: commands (comprehensive)
- 2.2: motion
- 2.3: descriptive verbs
- 3.1: body parts
- 3.2: contemporary objects
- 4.1: introduction
...
import { Filter } from 'bad-words';

const filter = new Filter()

// Add German bad words manually
const germanBadWords: string[] = [
    "kacken", "kackwurst", "kampflesbe", "kanake", "kimme", "lümmel", "MILF", "möpse",
    "morgenlatte", "möse", "mufti", "muschi", "nackt", "neger", "nigger", "nippel", "nutte", "onanieren",
    "orgasmus", "penis", "pimmel", "pimpern", "pinkeln", "pissen", "pisser", "popel", "poppen", "porno",
    "reudig", "rosette", "schabracke", "schlampe", "scheiße", "scheisser", "schiesser", "schnackeln",
    "schwanzlutscher", "schwuchtel", "tittchen", "titten", "vögeln", "vollpfosten", "wichse", "wichsen", "wichser", "hurensohn", "hs", "ficker", "idiot"
]

filter.addWords(...germanBadWords)

export const profanityCheck = (text: string): boolean => {
    return filter.isProfane(text)
}


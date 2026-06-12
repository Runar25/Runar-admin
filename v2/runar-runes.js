// ═══════════════════════════════════════════════════════
// RÚNAR · RUNES DATA
// Elder Futhark + Blank — 25 runes
// Edit keywords here to refine how Rúnar speaks about each rune
// ═══════════════════════════════════════════════════════

const RUNES = [
  {
    n: 'Fehu',     is_n: 'Fehu (Eignir)',
    g: 'ᚠ',        svg: 'Fehu',
    k:    'wealth, cattle, material prosperity, mobile energy',
    k_is: 'efnisleg velsæld, auður, hreyfanleg orka',
    formula_is: 'Fehu er rún flæðis, næringar og þess sem vill vaxa.',
    world: 'Midgard',   elements: ['Fire', 'Earth'],
    aett: 'freya',
  },
  {
    n: 'Uruz',     is_n: 'Uruz (Styrkur)',
    g: 'ᚢ',        svg: 'Uruz',
    k:    'raw power, strength, transformation, primal force',
    k_is: 'hráur kraftur, styrkur, umbreyting',
    formula_is: 'Uruz er rún styrks, lífskrafts og innri máttar.',
    world: 'Midgard',   elements: ['Earth'],
    aett: 'freya',
  },
  {
    n: 'Thurisaz', is_n: 'Þurs (Hlið)',
    g: 'ᚦ',        svg: 'Thurisaz',
    k:    'gateway, threshold, caution, thorn, protection',
    k_is: 'hlið, þröskuldur, aðgát, þyrnir',
    formula_is: 'Þurs er rún hrárrar umbreytingar, marka og þröskulda.',
    world: 'Hel',       elements: ['Fire'],
    aett: 'freya',
  },
  {
    n: 'Ansuz',    is_n: 'Ansuz (Boðberi)',
    g: 'ᚨ',        svg: 'Ansuz',
    k:    'messages, wisdom, divine guidance, voice, breath',
    k_is: 'skilaboð, viska, guðleg leiðsögn, rödd',
    formula_is: 'Ansuz er rún visku, orða og þess sem birtist í gegnum hlustun.',
    world: 'Asgard',    elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Raidho',   is_n: 'Raidho (Ferðalag)',
    g: 'ᚱ',        svg: 'Raidho',
    k:    'journey, movement, natural rhythm, right action',
    k_is: 'ferðalag, hreyfing, náttúruleg röð',
    formula_is: 'Raidho er rún leiðarinnar, hreyfingar og innri takts.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Kenaz',    is_n: 'Kenaz (Kyndill)',
    g: 'ᚲ',        svg: 'Kenaz',
    k:    'torch, inner light, creativity, knowledge, fire',
    k_is: 'kyndill, innri ljós, sköpunargleði, þekking',
    formula_is: 'Kenaz er rún innri elds og nýrrar sýnar.',
    world: 'Midgard',   elements: ['Fire'],
    aett: 'freya',
  },
  {
    n: 'Gebo',     is_n: 'Gebo (Félagsskapur)',
    g: 'ᚷ',        svg: 'Gebo',
    k:    'gift, companionship, giving and receiving, balance',
    k_is: 'gjöf, félagsskapur, gefa og þiggja, jafnvægi',
    formula_is: 'Gebo er rún tengsla, gjafa og þess sem flæðir á milli fólks af einlægni.',
    world: 'Midgard',   elements: ['Water'],
    aett: 'freya',
  },
  {
    n: 'Wunjo',    is_n: 'Wunjo (Gleði)',
    g: 'ᚹ',        svg: 'Wunjo',
    k:    'joy, happiness, harmony, belonging, wish fulfilled',
    k_is: 'gleði, hamingja, sátt, tilheyra',
    formula_is: 'Wunjo er rún gleði, sáttar og þess sem fyllir þegar maður er á réttum stað.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Hagalaz',  is_n: 'Hagalaz (Náttúruöfl)',
    g: 'ᚺ',        svg: 'Hagalaz',
    k:    'hail, disruption, transformation, clearing, nature force',
    k_is: 'hagl, truflun, umbreyting, náttúruöfl',
    formula_is: 'Hagalaz er rún náttúruafls og þeirrar umbreytingar sem kemur án boðunar.',
    world: 'Hel',       elements: ['Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Nauthiz',  is_n: 'Nauthiz (Nauðsyn)',
    g: 'ᚾ',        svg: 'Nauthiz',
    k:    'necessity, need, constraint, growth through challenge',
    k_is: 'nauðsyn, þrýstingur, vöxtur í áskorun',
    formula_is: 'Nauthiz er rún nauðsynjar, þrýstings og þess sem vex í myrkrinu.',
    world: 'Hel',       elements: ['Earth'],
    aett: 'heimdall',
  },
  {
    n: 'Isa',      is_n: 'Isa (Kyrrstaða)',
    g: 'ᛁ',        svg: 'Isa',
    k:    'ice, stillness, waiting, pause, clarity through cold',
    k_is: 'ís, kyrrstaða, að bíða, hlé',
    formula_is: 'Isa er rún ísins, kyrrstöðu og þess sem biður án þóknunar.',
    world: 'Hel',       elements: ['Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Jera',     is_n: 'Jera (Uppskera)',
    g: 'ᛃ',        svg: 'Jera',
    k:    'harvest, cycle, patience, right timing, reward',
    k_is: 'uppskera, hringur, þolinmæði, rétt tímasetning',
    formula_is: 'Jera er rún tímans, uppskeru og þeirrar þolinmæði sem lagar sig að náttúrunni.',
    world: 'Midgard',   elements: ['Earth'],
    aett: 'heimdall',
  },
  {
    n: 'Eihwaz',   is_n: 'Eihwaz (Vörn)',
    g: 'ᛇ',        svg: 'Eihwaz',
    k:    'yew tree, resilience, endurance, death and rebirth',
    k_is: 'ýviður, seigla, þol, dauði og endurfæðing',
    formula_is: 'Eihwaz er rún seiglu, þols og þess sem stendur þegar allt annað lútar.',
    world: 'Hel',       elements: ['Earth', 'Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Perth',    is_n: 'Perþ (Duldir hlutir)',
    g: 'ᛈ',        svg: 'Perth',
    k:    'hidden things, mystery, fate, divination, the unseen',
    k_is: 'duldir hlutir, leyndardómar, örlög, spádómar',
    formula_is: 'Perþ er rún leyndarmálsins, örlaga og þess sem felst undir yfirborðinu.',
    world: 'Hel',       elements: ['Water', 'Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Algiz',    is_n: 'Algiz (Vernd)',
    g: 'ᛉ',        svg: 'Algiz',
    k:    'protection, higher powers, shelter, connection to divine',
    k_is: 'vernd, hærri öfl, skjól, guðleg tenging',
    formula_is: 'Algiz er rún verndar, hærri afla og þess sem hlífir þegar við vitum það ekki.',
    world: 'Asgard',    elements: ['Air'],
    aett: 'heimdall',
  },
  {
    n: 'Sowilo',   is_n: 'Sowilo (Lífskraftur)',
    g: 'ᛊ',        svg: 'Sowilo',
    k:    'sun, victory, life force, clarity, will, solar energy',
    k_is: 'sól, sigur, lífskraftur, skýrleiki, vilji',
    formula_is: 'Sowilo er rún sólarinnar, sigurs og þeirrar ljósorku sem leiðir í gegnum myrkur.',
    world: 'Asgard',    elements: ['Fire'],
    aett: 'heimdall',
  },
  {
    n: 'Tiwaz',    is_n: 'Tiwaz (Hermannsandinn)',
    g: 'ᛏ',        svg: 'Tiwaz',
    k:    'justice, sacrifice, truth, courage, the warrior spirit',
    k_is: 'réttlæti, fórnfýsi, sannleikur, hugrekki',
    formula_is: 'Tiwaz er rún réttlætis, hugrekki og þess sem þarf að fórna fyrir sannleikann.',
    world: 'Asgard',    elements: ['Fire'],
    aett: 'tyr',
  },
  {
    n: 'Berkana',  is_n: 'Berkana (Þroski)',
    g: 'ᛒ',        svg: 'Berkana',
    k:    'birch, growth, new beginnings, nurturing, birth',
    k_is: 'björk, þroski, nýtt upphaf, hlúð',
    formula_is: 'Berkana er rún þroska, nýs upphaf og þeirrar hlúðar sem lætur lífið vaxa.',
    world: 'Midgard',   elements: ['Water'],
    aett: 'tyr',
  },
  {
    n: 'Ehwaz',    is_n: 'Ehwaz (Hreyfing)',
    g: 'ᛖ',        svg: 'Ehwaz',
    k:    'horse, movement, trust, partnership, progress',
    k_is: 'hestur, hreyfing, traust milli tveggja, framfarir',
    formula_is: 'Ehwaz er rún hreyfingar, trausts og þess sem opnast þegar tveir fara saman.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'tyr',
  },
  {
    n: 'Mannaz',   is_n: 'Mannaz (Sjálfið)',
    g: 'ᛗ',        svg: 'Mannaz',
    k:    'the self, self-awareness, humanity, memory, mind',
    k_is: 'sjálfið, sjálfsþekking, mannleg vitund, minni',
    formula_is: 'Mannaz er rún sjálfsins, mannlegrar vitundar og þess sem við erum þegar við horfum inn á við.',
    world: 'Asgard',    elements: ['Air'],
    aett: 'tyr',
  },
  {
    n: 'Laguz',    is_n: 'Laguz (Flæði)',
    g: 'ᛚ',        svg: 'Laguz',
    k:    'water, flow, intuition, the unconscious, emotion',
    k_is: 'vatn, flæði, innsæi, tilfinningar',
    formula_is: 'Laguz er rún vatnsins, innsæis og þeirra djúpu strauma sem við finnum en skiljum ekki alltaf.',
    world: 'Hel',       elements: ['Water'],
    aett: 'tyr',
  },
  {
    n: 'Ingwaz',   is_n: 'Ingwaz (Frjósemi)',
    g: 'ᛜ',        svg: 'Ingwaz',
    k:    'fertility, inner development, potential, seed, new life',
    k_is: 'frjósemi, innri þróun, möguleiki, fræ, nýtt líf',
    formula_is: 'Ingwaz er rún fræsins, innri þróunar og þess sem þroskast í kyrrð áður en það kemur í ljós.',
    world: 'Asgard',    elements: ['Water'],
    aett: 'tyr',
  },
  {
    n: 'Othila',   is_n: 'Othila (Aðskilnaður)',
    g: 'ᛟ',        svg: 'Othila',
    k:    'inheritance, letting go, heritage, home, ancestral wisdom',
    k_is: 'arfur, að sleppa, hefðir, heimili, forfeðraviska',
    formula_is: 'Othila er rún arfsins, heimilis og þess sem þarf að sleppa til að vera sjálfur sér.',
    world: 'Asgard',    elements: ['Earth'],
    aett: 'tyr',
  },
  {
    n: 'Dagaz',    is_n: 'Dagaz (Tímamót)',
    g: 'ᛞ',        svg: 'Dagaz',
    k:    'turning point, dawn, breakthrough, light, transformation',
    k_is: 'tímamót, dögun, ljós, umbreyting, bylting',
    formula_is: 'Dagaz er rún tímamóta, dögunar og þeirrar umbreytingar sem breytir öllu með einum svip.',
    world: 'Asgard',    elements: ['Fire'],
    aett: 'tyr',
  },
  {
    n: 'Blank',    is_n: 'Auða rúnan (Óðinn)',
    g: '○',        svg: 'Blank',
    k:    'the unknown, unwritten potential, destiny, the void, Odin',
    k_is: 'hið óþekkta, óskrifaður möguleiki, örlög, Óðinn',
    formula_is: 'Auða rúnan er rún hins óþekkta, óskrifaðra möguleika og þeirrar þagnar sem geymir allt.',
    world: 'Hel',       elements: ['Water', 'Shadow'],
  },
];

// ─── LIFE RUNE CALCULATOR ───────────────────────────────
function calcLifeRune(d, m, y) {
  let s = String(d + m + y).split('').map(Number).reduce((a, b) => a + b, 0);
  while (s > 24) s = String(s).split('').map(Number).reduce((a, b) => a + b, 0);
  return RUNES[(s - 1 + 24) % 24];
}

// ─── AREA OF LIFE OPTIONS ───────────────────────────────
const AREAS = {
  en: [
    'Love & Relationships',
    'Purpose & Path',
    'Career & Creativity',
    'Healing & Wellbeing',
    'Spirituality',
    'Family & Home',
    'Inner Growth',
    'Crossroads & Decisions',
  ],
  is: [
    'Ást & Sambönd',
    'Tilgangur & Leið',
    'Starf & Sköpun',
    'Heilun & Líðan',
    'Andlægi',
    'Fjölskylda & Heimili',
    'Innri Vöxtur',
    'Vegamót & Ákvarðanir',
  ],
  // Norns axis: branch placement on tree + pattern classification
  // urd=roots (past/hidden), verdandi=middle (present), skuld=crown (future/ideals)
  // Dual-axis areas (e.g. urd/verdandi): primary axis listed first in patch v0.9
  norns: [
    'verdandi',  // Love & Relationships
    'skuld',     // Purpose & Path
    'skuld',     // Career & Creativity
    'urd',       // Healing & Wellbeing  (dual: urd/verdandi)
    'skuld',     // Spirituality
    'urd',       // Family & Home
    'urd',       // Inner Growth         (dual: urd/skuld)
    'verdandi',  // Crossroads & Decisions
  ],
};

// ─── SEEKING OPTIONS ────────────────────────────────────
const SEEKS = {
  en: [
    'General Guidance',
    'Clarity',
    'Confirmation',
    'Insight into Challenge',
    'Reflection',
  ],
  is: [
    'Almenn leiðsögn',
    'Skýrleiki',
    'Staðfesting',
    'Innsýn í áskorun',
    'Hugleiðing',
  ],
  // Seeking modifier: shifts branch axis tendency when combined with Area
  // null = neutral (no axis shift)
  norns: [
    null,        // General Guidance — neutral
    'verdandi',  // Clarity
    'verdandi',  // Confirmation
    'urd',       // Insight into Challenge
    'urd',       // Reflection
  ],
};

// ─── AETTY — THREE FAMILIES OF THE FUTHARK ─────────────
// Used for: pattern detection, visual pulse, Gathering triggers
// Blank/Odin has no Aett — outside the Futhark structure
const AETTY = {
  freya: {
    name_en: "Freya's Aett",    name_is: 'Freyju ætt',
    runes:   ['Fehu','Uruz','Thurisaz','Ansuz','Raidho','Kenaz','Gebo','Wunjo'],
    theme_en: 'world, body, strength, communication, joy',
    theme_is: 'heimur, líkami, styrkur, samskipti, gleði',
  },
  heimdall: {
    name_en: "Heimdall's Aett", name_is: 'Heimdalls ætt',
    runes:   ['Hagalaz','Nauthiz','Isa','Jera','Eihwaz','Perth','Algiz','Sowilo'],
    theme_en: 'fate, time, cycle, hidden, protection',
    theme_is: 'örlög, tími, hringrás, dulið, vernd',
  },
  tyr: {
    name_en: "Tyr's Aett",      name_is: 'Týs ætt',
    runes:   ['Tiwaz','Berkana','Ehwaz','Mannaz','Laguz','Ingwaz','Dagaz','Othila'],
    theme_en: 'justice, growth, movement, humanity, completion',
    theme_is: 'réttlæti, vöxtur, hreyfing, mannkyn, lokið',
  },
};

// ─── MOOD OPTIONS (HOW ARE YOU FEELING) ────────────────────
// norns: branch axis tendency | element: visual color on tree
const MOODS = {
  en: ['Grounded', 'Unsettled', 'Hopeful', 'Lost'],
  is: ['Jarðtengdur', 'Órólegur', 'Voníull', 'Villtur'],
  norns:   ['urd',   'verdandi', 'skuld',   'urd'],
  element: ['Earth', 'Air',      'Fire',    'Water'],
};

// ─── INTENTION OPTIONS (THIS READING IS FOR) ─────────────
const INTENTIONS = {
  en: ['Right now', 'Decision ahead', 'Understanding the past'],
  is: ['Í þessari stund', 'Ákvörðun framundan', 'Skilja fortíðina'],
  norns: ['verdandi', 'skuld', 'urd'],
};

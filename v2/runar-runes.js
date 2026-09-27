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
    k_is: 'efnisleg velsæld, auður, búfé, hreyfanleg orka',
    formula_is: 'Fehu er rún flæðis, næringar og þess sem vill vaxa.',
    world: 'Midgard',   elements: ['Fire', 'Earth'],
    aett: 'freya',
  },
  {
    n: 'Uruz',     is_n: 'Uruz (Styrkur)',
    g: 'ᚢ',        svg: 'Uruz',
    k:    'raw power, strength, primal force',
    k_is: 'hráur kraftur, styrkur, frumkraftur',
    formula_is: 'Uruz er rún styrks, lífskrafts og innri máttar.',
    world: 'Midgard',   elements: ['Earth'],
    aett: 'freya',
  },
  {
    n: 'Thurisaz', is_n: 'Þurs (Hlið)',
    g: 'ᚦ',        svg: 'Thurisaz',
    k:    'gateway, threshold, caution, thorn, protection, disruptive force',
    k_is: 'hlið, þröskuldur, aðgát, þyrnir, vernd, ógnandi kraftur',
    formula_is: 'Þurs er rún hrárrar umbreytingar, marka og þröskulda.',
    world: 'Hel',       elements: ['Fire'],
    aett: 'freya',
  },
  {
    n: 'Ansuz',    is_n: 'Ansuz (Boðberi)',
    g: 'ᚨ',        svg: 'Ansuz',
    k:    'messages, wisdom, divine guidance, voice, breath',
    k_is: 'skilaboð, viska, guðleg leiðsögn, rödd, andardráttur',
    formula_is: 'Ansuz er rún visku, orða og þess sem birtist í gegnum hlustun.',
    world: 'Asgard',    elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Raidho',   is_n: 'Raidho (Ferðalag)',
    g: 'ᚱ',        svg: 'Raidho',
    k:    'the road, movement, natural rhythm, right action',
    k_is: 'leið, hreyfing, náttúruleg röð, rétt breytni',
    formula_is: 'Raidho er rún leiðarinnar, hreyfingar og innri takts.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Kenaz',    is_n: 'Kenaz (Kyndill)',
    g: 'ᚲ',        svg: 'Kenaz',
    k:    'torch, inner light, creativity, knowledge, fire',
    k_is: 'kyndill, innra ljós, sköpunargleði, þekking, eldur',
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
    k_is: 'gleði, hamingja, sátt, tilheyra, uppfyllt ósk',
    formula_is: 'Wunjo er rún gleði, sáttar og þess sem fyllir þegar maður er á réttum stað.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'freya',
  },
  {
    n: 'Hagalaz',  is_n: 'Hagalaz (Náttúruöfl)',
    g: 'ᚺ',        svg: 'Hagalaz',
    k:    'hail, disruption, transformation, clearing, nature force',
    k_is: 'hagl, truflun, umbreyting, hreinsun, náttúruöfl',
    formula_is: 'Hagalaz er rún náttúruafls og þeirrar umbreytingar sem kemur án boðunar.',
    world: 'Hel',       elements: ['Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Nauthiz',  is_n: 'Nauthiz (Nauðsyn)',
    g: 'ᚾ',        svg: 'Nauthiz',
    k:    'necessity, need, constraint, growth through challenge',
    k_is: 'nauðsyn, þörf, þrýstingur, vöxtur í áskorun',
    formula_is: 'Nauthiz er rún nauðsynjar, þrýstings og þess sem vex í myrkrinu.',
    world: 'Hel',       elements: ['Earth'],
    aett: 'heimdall',
  },
  {
    n: 'Isa',      is_n: 'Isa (Kyrrstaða)',
    g: 'ᛁ',        svg: 'Isa',
    k:    'ice, stillness, waiting, pause, clarity through cold',
    k_is: 'ís, kyrrstaða, að bíða, hlé, skýrleiki í kulda',
    formula_is: 'Isa er rún ísins, kyrrstöðu og þess sem biður án þóknunar.',
    world: 'Hel',       elements: ['Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Jera',     is_n: 'Jera (Uppskera)',
    g: 'ᛃ',        svg: 'Jera',
    k:    'harvest, cycle, patience, right timing, reward',
    k_is: 'uppskera, hringur, þolinmæði, rétt tímasetning, umbun',
    formula_is: 'Jera er rún tímans, uppskeru og þeirrar þolinmæði sem lagar sig að náttúrunni.',
    world: 'Midgard',   elements: ['Earth'],
    aett: 'heimdall',
  },
  {
    n: 'Eihwaz',   is_n: 'Eihwaz (Vörn)',
    g: 'ᛇ',        svg: 'Eihwaz',
    k:    'yew tree, resilience, endurance, death and rebirth, world-tree, protection',
    k_is: 'ýviður, seigla, þol, dauði og endurfæðing, heimstré, vernd',
    formula_is: 'Eihwaz er rún seiglu, þols og þess sem stendur þegar allt annað lútar.',
    world: 'Hel',       elements: ['Earth', 'Shadow'],
    aett: 'heimdall',
  },
  {
    n: 'Perth',    is_n: 'Perþ (Duldir hlutir)',
    g: 'ᛈ',        svg: 'Perth',
    k:    'chance, the hidden coming to light, fate in the making, luck, the unseen',
    k_is: 'tilviljun, hið hulda sem kemur í ljós, örlög í mótun, happ, hið hulda',
    formula_is: 'Perþ er rún tilviljunar, leyndarmálsins og örlaga sem enn eru að mótast.',
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
    k_is: 'sól, sigur, lífskraftur, skýrleiki, vilji, sólarorka',
    formula_is: 'Sowilo er rún sólarinnar, sigurs og þeirrar ljósorku sem leiðir í gegnum myrkur.',
    world: 'Asgard',    elements: ['Fire'],
    aett: 'heimdall',
  },
  {
    n: 'Tiwaz',    is_n: 'Tiwaz (Hermannsandinn)',
    g: 'ᛏ',        svg: 'Tiwaz',
    k:    'justice, sacrifice, truth, courage, the warrior spirit',
    k_is: 'réttlæti, fórnfýsi, sannleikur, hugrekki, hermannsandi',
    formula_is: 'Tiwaz er rún réttlætis, hugrekki og þess sem þarf að fórna fyrir sannleikann.',
    world: 'Asgard',    elements: ['Fire'],
    aett: 'tyr',
  },
  {
    n: 'Berkana',  is_n: 'Berkana (Þroski)',
    g: 'ᛒ',        svg: 'Berkana',
    k:    'birch, growth, new beginnings, nurturing, birth',
    k_is: 'björk, þroski, nýtt upphaf, umhyggja, fæðing',
    formula_is: 'Berkana er rún þroska, nýs upphafs og þeirrar umhyggju sem lætur lífið vaxa.',
    world: 'Midgard',   elements: ['Water'],
    aett: 'tyr',
  },
  {
    n: 'Ehwaz',    is_n: 'Ehwaz (Hreyfing)',
    g: 'ᛖ',        svg: 'Ehwaz',
    k:    'horse, movement, trust, partnership, progress',
    k_is: 'hestur, hreyfing, traust milli tveggja, samfylgd, framfarir',
    formula_is: 'Ehwaz er rún hreyfingar, trausts og þess sem opnast þegar tveir fara saman.',
    world: 'Midgard',   elements: ['Air'],
    aett: 'tyr',
  },
  {
    n: 'Mannaz',   is_n: 'Mannaz (Sjálfið)',
    g: 'ᛗ',        svg: 'Mannaz',
    k:    'the self, self-awareness, humanity, mind',
    k_is: 'sjálfið, sjálfsþekking, mannleg vitund, hugur',
    formula_is: 'Mannaz er rún sjálfsins, mannlegrar vitundar og þess sem við erum þegar við horfum inn á við.',
    world: 'Asgard',    elements: ['Air'],
    aett: 'tyr',
  },
  {
    n: 'Laguz',    is_n: 'Laguz (Flæði)',
    g: 'ᛚ',        svg: 'Laguz',
    k:    'water, flow, intuition, the unconscious, emotion, memory, dreams',
    k_is: 'vatn, flæði, innsæi, dulvitund, tilfinningar, minni, draumar',
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
    k:    'inheritance, letting go, heritage, home, ancestral wisdom, foundation, belonging',
    k_is: 'arfur, að sleppa, hefðir, heimili, forfeðraviska, grunnur, tilheyra',
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
    n: 'Blank',    is_n: 'Auða rúnin (Óðinn)',
    g: '○',        svg: 'Blank',
    k:    'the unknown, unwritten potential, destiny, the void, Odin',
    k_is: 'hið óþekkta, óskrifaður möguleiki, örlög, tómið, Óðinn',
    formula_is: 'Auða rúnin er rún hins óþekkta, óskrifaðra möguleika og þeirrar þagnar sem geymir allt.',
    world: 'Hel',       elements: ['Water', 'Shadow'],
  },
];

// ─── LIFE RUNE CALCULATOR ───────────────────────────────
// Životní runa = RUNOVÝ PŮLMĚSÍC, ve kterém se člověk narodil (KUKY 2026-09-27, HANDOFF62 Cowork; RUNAR_DECISIONS 2026-09-27 (5)).
// Rok je rozdělený na 24 období po 15–16 dnech s PEVNÝMI daty, cyklus začíná Fehu 29. 6. Je to moderní rozdělení roku (poprvé
// publikované 1990), ne dochovaný severský systém — historicky doložená „rodná runa“ neexistuje. Autor se v aplikaci nejmenuje (owner).
// Zdroje a srovnání variant → docs/eval/2026-09-27-zivotni-runa/README.md.
// PROČ ne numerologie: ciferný součet data nemá k runám žádný vztah (stejné datum dalo podle pořadí sčítání Gebo i Fehu); půlměsíc
// je místo v kruhu roku a dá se vysvětlit jednou větou.
// Konvence: hraniční den patří NOVÉ runě (tabulky se v něm překrývají; tahle konvence jediná nedá dnu dvě runy).
// Sowilo od 13. 2. — tak ho mají všechny tři tabulky ověřené 2026-09-27 (asktherunes, WeMystic, Uniwelry); Coworkův druhý zdroj
// uváděl 12. 2. (neověřeno, stránka nedostupná). Důsledek: Algiz 16 dní, Sowilo 14. Pět run má 16 dní, jedna 14, ostatní 15.
// PASTI (HANDOFF62, změřeno): (1) nikdy „den v roce“ — v přestupném roce se druhá půlka tabulky posune; porovnává se jen
// (měsíc, den). (2) 29. 2. padne do Tiwaz. (3) Eihwaz přechází přes Nový rok (28. 12. – 12. 1.). (4) Tabulka je úplná — každý den
// má právě jednu runu, žádný záložní výsledek. Hlídá verify_liferune_states.js (všechny dny přestupného i běžného roku).
// Pořadí = RUNES[0..23] (Fehu … Dagaz); hodnota = [měsíc, den] ZAČÁTKU období.
const LIFE_RUNE_STARTS = [
  [6, 29], [7, 14], [7, 29], [8, 13], [8, 29], [9, 13], [9, 28], [10, 13],      // Fehu Uruz Thurisaz Ansuz Raidho Kenaz Gebo Wunjo
  [10, 28], [11, 13], [11, 28], [12, 13], [12, 28], [1, 13], [1, 28], [2, 13],  // Hagalaz Nauthiz Isa Jera Eihwaz Perth Algiz Sowilo
  [2, 27], [3, 14], [3, 30], [4, 14], [4, 29], [5, 14], [5, 29], [6, 14],       // Tiwaz Berkana Ehwaz Mannaz Laguz Ingwaz Othila Dagaz
];
function calcLifeRune(d, m, y) {
  d = Number(d); m = Number(m);
  // Neplatné datum = žádná runa (null), ne náhodná runa. Nehází: runar-yggdrasil.html sem posílá ručně psané číslo bez kontroly
  // rozsahu a výjimka by rozbila vstup do Yggdrasilu. Úplnost TABULKY hlídá smoke (každý den roku má právě jednu runu).
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
  const k = m * 100 + d;
  // runa, jejíž začátek je v kalendářním roce nejpozději před datem; před 13. 1. žádný není → Eihwaz (28. 12. přes Nový rok)
  let best = -1, bestKey = -1;
  LIFE_RUNE_STARTS.forEach(function (st, i) {
    const sk = st[0] * 100 + st[1];
    if (sk <= k && sk > bestKey) { bestKey = sk; best = i; }
  });
  if (best === -1) best = LIFE_RUNE_STARTS.findIndex(function (st) { return st[0] === 12 && st[1] === 28; });   // Eihwaz
  return RUNES[best];
}

// ─── AREA OF LIFE OPTIONS ───────────────────────────────
const AREAS = {
  en: [
    'Love & Relationships',
    'Purpose & Path',
    'Career & Creativity',
    'Healing & Wellbeing',
    'The Unseen',
    'Family & Home',
    'Inner Growth',
    'Crossroads & Decisions',
  ],
  is: [
    'Ást & Sambönd',
    'Tilgangur & Leið',
    'Starf & Sköpun',
    'Heilun & Líðan',
    'Hið dulda',
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
    'skuld',     // The Unseen
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

// ─── INTENTION OPTIONS (THIS READING IS FOR) ─────────────
const INTENTIONS = {
  en: ['Right now', 'Decision ahead', 'Understanding the past'],
  is: ['Í þessari stund', 'Ákvörðun framundan', 'Skilja fortíðina'],
  norns: ['verdandi', 'skuld', 'urd'],
};

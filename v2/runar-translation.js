// ═══════════════════════════════════════════════════════
// RÚNAR · TRANSLATIONS
// UI text for all supported languages
// To add a language: copy the 'en' block, translate, add key to APP.supported_langs in config
// ═══════════════════════════════════════════════════════

const UI_TEXT = {

  en: {
    // Header
    brand:   'AGNDOFA · RÚNAR SYSTEM',
    title:   'Knowledge Shrine',
    sub:     'Teach Rúnar. Shape his voice. Feed his wisdom.',

    // Tabs
    tab_teach:   'TEACH RÚNAR',
    tab_char:    'CHARACTER',
    tab_reader:  'RÚNAR THE RUNE KEEPER',
    tab_correct: 'WORD CORRECTIONS',

    // Teach tab
    teach_card1_lbl:  '📖 SOURCE TEXT FROM BOOK',
    teach_card1_note: 'Open the book, find the page about a rune, and paste or type the text here.',
    teach_src_ph:     'Paste or type the book text here\u2026',
    teach_card2_lbl:  'ᚠ WHICH RUNE IS THIS ABOUT?',
    rune_none:        'No rune selected.',
    src_ref_lbl:      'SOURCE REFERENCE',
    src_ref_ph:       'e.g. Agndofa Rune Guide, p.1',
    teach_card3_lbl:  '✦ LET RÚNAR INTERPRET',
    teach_card3_note: 'Rúnar will read the source and rewrite it in his own voice — not a translation, his interpretation.',
    invoke_btn:       '↯ INVOKE RÚNAR',
    runar_speaks:     'RÚNAR SPEAKS',
    commit_btn:       'COMMIT TO RÚNAR\u2019S MEMORY',

    // Reader tab
    reader_card1_lbl: '✦ BEFORE WE BEGIN',
    reader_note:      'Only your name is required. Everything else helps Rúnar speak more personally.',
    name_lbl:         'YOUR NAME OR PREFERRED NAME',
    name_ph:          'How shall Rúnar address you?',
    dob_lbl:          'DATE OF BIRTH',
    area_lbl:         'AREA OF LIFE',
    seek_lbl:         'WHAT ARE YOU SEEKING?',
    q_lbl:            'SPECIFIC QUESTION',
    q_ph:             'e.g. What is holding me back?',
    opt:              '(OPTIONAL)',
    begin_btn:        'BEGIN THE READING',
    draw_lbl:         'ᚠ DRAW YOUR RUNE',
    draw_note:        'Close your eyes. Hold your question. Then choose the rune that calls to you.',
    speak_btn:        'LET RÚNAR SPEAK',
    life_rune_lbl:    'YOUR LIFE RUNE',
    drawn_lbl:        'DRAWN RUNE',
    layer1_lbl:       '✦ RÚNAR SPEAKS',
    layer2_lbl:       '~ DEEPER REFLECTION',
    draw_another:     'DRAW ANOTHER RUNE',
    start_over:       'START OVER',

    // Voice
    voice_btn:         'ᚢ GENERATE RÚNAR\u2019S VOICE',
    voice_btn_loading: 'ᚢ RÚNAR IS SPEAKING\u2026',
    voice_btn_regen:   'ᚢ REGENERATE VOICE',
    voice_player_lbl:  '♪ RÚNAR SPEAKS',
    voice_err_credits: 'No credits remaining.',
    voice_err_timeout: 'API timeout. Please try again.',

    // Corrections tab
    corr_lbl:       '✎ WORD CORRECTIONS',
    corr_note:      'Teach Rúnar better words. Enter what he said and what he should say instead.',
    orig_lbl:       'WORD OR PHRASE RÚNAR USED',
    orig_ph:        '"good luck" or "you will succeed"\u2026',
    repl_lbl:       'REPLACE WITH',
    repl_ph:        '"may the path open before you"\u2026',
    ctx_lbl:        'CONTEXT',
    ctx_ph:         'e.g. "when speaking about Fehu"',
    applies_lbl:    'APPLIES TO',
    scope_both:     'Both languages',
    scope_en:       'English only',
    scope_is:       'Icelandic only',
    save_corr:      'SAVE CORRECTION',
    saved_corr_lbl: '📜 SAVED CORRECTIONS',
    no_corr:        'No corrections yet.',

    // Character tab
    char_lbl:       '👤 RÚNAR\u2019S IDENTITY',
    char_note:      'This is who Rúnar is. Edit freely — changes take effect on the next invocation.',
    test_lbl:       '🧪 TEST RÚNAR\u2019S VOICE',
    test_note:      'Type something and hear how Rúnar responds with the current character.',
    test_ph:        'e.g. I drew Fehu today and I feel stuck\u2026',
    test_btn:       'TEST CURRENT CHARACTER',
    runar_responds: 'RÚNAR RESPONDS',
    version_lbl:    '📜 VERSION HISTORY',
    preview_btn:    'PREVIEW FULL PROMPT',
    save_char_btn:  'SAVE CHARACTER',

    // Status messages
    st_traversing:   'Rúnar is traversing the realms\u2026',
    st_spoken:       '✓ Rúnar has spoken. Review and commit.',
    st_listening:    'Listening\u2026',
    st_saving:       'Saving\u2026',
    st_saved:        '✓ Saved.',
    st_saved_local:  '✓ Saved locally.',
    st_char_saved:   '✓ Character saved.',
    st_char_memory:  '✓ Updated in memory.',
    st_restored:     '✓ Version restored.',
    st_name_req:     'Please enter your name.',
    st_fill_fields:  'Fill in both fields.',
    st_no_versions:  'No saved versions yet.',
    st_no_table:     'Create runar_character table to enable history.',
  },

  is: {
    // Header
    brand:   'AGNDOFA · RÚNAR KERFI',
    title:   'Þekkingarskrínn',
    sub:     'Kenndu Rúnari. Móta rödd hans. Fæða visku hans.',

    // Tabs
    tab_teach:   'KENNA RÚNARI',
    tab_char:    'PERSÓNULEIKI',
    tab_reader:  'RÚNAR RÚNAVÖRÐURINN',
    tab_correct: 'ORÐALEIÐRÉTTINGAR',

    // Teach tab
    teach_card1_lbl:  '📖 TEXTI ÚR BÓK',
    teach_card1_note: 'Opnaðu bókina, finndu síðuna um rúnina og límdu eða skrifaðu textann hér.',
    teach_src_ph:     'Límdu eða skrifaðu texta hér\u2026',
    teach_card2_lbl:  'ᚠ UM HVAÐA RÚNU ER ÞETTA?',
    rune_none:        'Engin rúna valin.',
    src_ref_lbl:      'HEIMILD',
    src_ref_ph:       'T.d. Agndofa Rúnaleiðbeiningar, bls. 1',
    teach_card3_lbl:  '✦ LÁTUM RÚNAR TÚLKA',
    teach_card3_note: 'Rúnar les textann og endurskrifar hann með sinni eigin rödd — ekki þýðing, heldur túlkun hans.',
    invoke_btn:       '↯ KALLA FRAM RÚNAR',
    runar_speaks:     'RÚNAR TALAR',
    commit_btn:       'VISTA Í MINNI RÚNARS',

    // Reader tab
    reader_card1_lbl: '✦ ÁÐUR EN VIÐ BYRJUM',
    reader_note:      'Aðeins nafnið þitt er nauðsynlegt. Allt annað hjálpar Rúnari að tala persónulegra.',
    name_lbl:         'NAFNIÐ ÞÍT EÐA GÆLUNAFN',
    name_ph:          'Hvernig á Rúnar að kalla þig?',
    dob_lbl:          'FÆÐINGARDAGUR',
    area_lbl:         'SVIÐ LÍFSINS',
    seek_lbl:         'HVAÐ ERTU AÐ LEITA AÐ?',
    q_lbl:            'SÉRSTÖK SPURNING',
    q_ph:             'T.d. Hvað heldur mér aftur?',
    opt:              '(VALKVÆTT)',
    begin_btn:        'HEFJA LESTURINN',
    draw_lbl:         'ᚠ DRAGÐU RÚNINA ÞÍNA',
    draw_note:        'Lokaðu augunum um stund. Haltu spurningunni í huga. Veldu síðan rúnina sem kallar til þín.',
    speak_btn:        'LÁTUM RÚNAR TALA',
    life_rune_lbl:    'LÍFSTÍÐARRÚNAN ÞÍN',
    drawn_lbl:        'DREGIN RÚNA',
    layer1_lbl:       '✦ RÚNAR TALAR',
    layer2_lbl:       '~ DÝPRI HUGLEIÐING',
    draw_another:     'DRAGA AÐRA RÚNU',
    start_over:       'BYRJA AFTUR',

    // Voice
    voice_btn:         'ᚢ BÚA TIL RÖDD RÚNARS',
    voice_btn_loading: 'ᚢ RÚNAR TALAR\u2026',
    voice_btn_regen:   'ᚢ ENDURGERA RÖDD',
    voice_player_lbl:  '♪ RÚNAR TALAR',
    voice_err_credits: 'Engar einingar eftir.',
    voice_err_timeout: 'API tímamörk. Reyndu aftur.',

    // Corrections tab
    corr_lbl:       '✎ ORÐALEIÐRÉTTINGAR',
    corr_note:      'Kenndu Rúnari betri orð. Skráðu orðið sem hann notaði og hvað hann ætti að segja í staðinn.',
    orig_lbl:       'ORÐ EÐA SETNING SEM RÚNAR NOTAÐI',
    orig_ph:        '"gangi þér vel" eða "þú munt ná árangri"\u2026',
    repl_lbl:       'SKIPTA ÚT FYRIR',
    repl_ph:        '"megi leiðin opnast fyrir þér"\u2026',
    ctx_lbl:        'SAMHENGI',
    ctx_ph:         'T.d. "þegar talað er um Fehu"',
    applies_lbl:    'GILDIR FYR',
    scope_both:     'Bæði tungumál',
    scope_en:       'Aðeins enska',
    scope_is:       'Aðeins íslenska',
    save_corr:      'VISTA LEIÐRÉTTINGU',
    saved_corr_lbl: '📜 VISTAÐAR LEIÐRÉTTINGAR',
    no_corr:        'Engar leiðréttingar enn.',

    // Character tab
    char_lbl:       '👤 PERSÓNULEIKI RÚNARS',
    char_note:      'Þetta er hver Rúnar er. Breyttu frjálslega — breytingar taka gildi við næstu köllun.',
    test_lbl:       '🧪 PRÓFAÐU RÖDD RÚNARS',
    test_note:      'Skrifaðu eitthvað og heyrðu hvernig Rúnar svarar með núverandi persónuleika.',
    test_ph:        'T.d. Ég dró Fehu í dag og finn fyrir fastri\u2026',
    test_btn:       'PRÓFA NÚVERANDI PERSÓNULEIKA',
    runar_responds: 'RÚNAR SVARAR',
    version_lbl:    '📜 ÚTGÁFUSAGA',
    preview_btn:    'FORSKOÐUN',
    save_char_btn:  'VISTA PERSÓNULEIKA',

    // Status messages
    st_traversing:   'Rúnar fer um heimana\u2026',
    st_spoken:       '✓ Rúnar hefur talað.',
    st_listening:    'Hlustandi\u2026',
    st_saving:       'Vista\u2026',
    st_saved:        '✓ Vistað.',
    st_saved_local:  '✓ Vistað staðbundið.',
    st_char_saved:   '✓ Persónuleiki vistaður.',
    st_char_memory:  '✓ Uppfært í minni.',
    st_restored:     '✓ Útgáfa endurreist.',
    st_name_req:     'Vinsamlegast sláðu inn nafnið þitt.',
    st_fill_fields:  'Fylltu í bæði svæðin.',
    st_no_versions:  'Engar vistaðar útgáfur enn.',
    st_no_table:     'Búðu til runar_character töflu til að virkja sögu.',
  },

};

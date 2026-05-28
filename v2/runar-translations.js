// ═══════════════════════════════════════════════════════
// RÚNAR · TRANSLATIONS
// UI text for all supported languages
// ═══════════════════════════════════════════════════════

const UI_TEXT = {

  en: {
    // Header
    brand:   'AGNDOFA · RÚNAR SYSTEM',
    title:   'Knowledge Shrine',
    sub:     'Teach Rúnar. Shape his voice. Feed his wisdom.',

    // Tabs
    tab_teach:    'TEACH RÚNAR',
    tab_progress: 'PROGRESS',
    tab_reader:   '⚗ V2 LAB',
    tab_correct:  'WORD CORRECTIONS',
    progress_lbl: '♦ AUDIO PROGRESS',

    // Teach tab
    teach_select_lbl:   'ᚠ SELECT RUNE',
    teach_select_note:  'Select a rune. Rúnar will speak directly to whoever draws it — in the current language.',
    rune_none:          'No rune selected.',
    teach_speak_lbl:    '✦ RÚNAR SPEAKS',
    invoke_btn:         '↯ LET RÚNAR SPEAK',
    runar_speaks:       'RÚNAR SPEAKS',
    teach_edit_lbl:     'EDIT BEFORE SAVING — CHANGES APPLY TO BOTH TEXT AND VOICE',
    commit_btn:         'COMMIT TO RÚNAR’S MEMORY',
    teach_audio_lbl:    '♪ RÚNAR SPEAKS — PREVIEW',
    teach_save_btn:     'SAVE VOICE TO MEMORY',
    teach_next_btn:     'ᚠ TEACH ANOTHER RUNE',
    teach_voice_ready:  '✓ Voice ready. Listen, then save.',
    teach_voice_saving: 'Saving to memory…',

    // Reader tab
    reader_card1_lbl: '✦ BEFORE WE BEGIN',
    reader_note:      'Only your name is required. Everything else helps Rúnar speak more personally.',
    name_lbl:         'YOUR NAME OR PREFERRED NAME',
    name_ph:          'How shall Rúnar address you?',
    dob_lbl:          'DATE OF BIRTH',
    day_ph:           'Day',
    month_ph:         'Month',
    year_ph:          'Year',
    area_lbl:         'AREA OF LIFE',
    seek_lbl:         'WHAT ARE YOU SEEKING?',
    q_lbl:            'SPECIFIC QUESTION',
    q_ph:             'e.g. What is holding me back?',
    opt:              '(OPTIONAL)',
    begin_btn:        'BEGIN THE READING',
    draw_lbl:         'ᚠ DRAW YOUR RUNE',
    draw_note:        'Close your eyes. Hold your question. Then choose the rune that calls to you.',
    speak_btn:        'HEAR RÚNAR SPEAK',
    life_rune_lbl:    'YOUR LIFE RUNE',
    drawn_lbl:        'DRAWN RUNE',
    layer1_lbl:       '✦ RÚNAR SPEAKS',
    layer2_lbl:       '~ DEEPER REFLECTION',
    draw_another:     'DRAW ANOTHER RUNE',
    start_over:       'START OVER',

    // Voice
    voice_btn:         'ᚢ HEAR RÚNAR SPEAK',
    voice_btn_loading: 'ᚢ RÚNAR IS SPEAKING…',
    voice_btn_regen:   'ᚢ REGENERATE VOICE',
    voice_player_lbl:  '♪ RÚNAR SPEAKS',

    // Ritual names — change here, reflects everywhere
    ritual_gathering:         "THE GATHERING",
    ritual_gathering_jcard:   "THE GATHERING",
    ritual_gathering_request: "REQUEST THE GATHERING",
    ritual_gathering_new:     "NEW GATHERING",
    ritual_3readings:         "3 READINGS",

    // Corrections tab
    corr_lbl:       '✒ WORD CORRECTIONS',
    corr_note:      'Teach Rúnar better words. Enter what he said and what he should say instead.',
    orig_lbl:       'WORD OR PHRASE RÚNAR USED',
    orig_ph:        '"good luck" or "you will succeed"…',
    repl_lbl:       'REPLACE WITH',
    repl_ph:        '"may the path open before you"…',
    ctx_lbl:        'CONTEXT',
    ctx_ph:         'e.g. "when speaking about Fehu"',
    applies_lbl:    'APPLIES TO',
    scope_both:     'Both languages',
    scope_en:       'English only',
    scope_is:       'Icelandic only',
    save_corr:      'SAVE CORRECTION',
    saved_corr_lbl: '\u{1F4DC} SAVED CORRECTIONS',
    no_corr:        'No corrections yet.',

    // Character tab
    char_lbl:       '\u{1F464} RÚNAR’S IDENTITY',
    char_note:      'This is who Rúnar is. Edit freely — changes take effect on the next invocation.',
    test_lbl:       '\u{1F9EA} TEST RÚNAR’S VOICE',
    test_note:      'Type something and hear how Rúnar responds with the current character.',
    test_ph:        'e.g. I drew Fehu today and I feel stuck…',
    test_btn:       'TEST CURRENT CHARACTER',
    runar_responds: 'RÚNAR RESPONDS',
    version_lbl:    '\u{1F4DC} VERSION HISTORY',
    preview_btn:    'PREVIEW FULL PROMPT',
    save_char_btn:  'SAVE CHARACTER',

    // Status messages
    st_traversing:   'Rúnar is traversing the realms…',
    st_spoken:       '✓ Rúnar has spoken. Review and commit.',
    st_listening:    'Listening…',
    st_saving:       'Saving…',
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
    sub:     'Kenndu Rúnari. Mótaðu rödd hans. Fóðraðu hann af visku.',

    // Tabs
    tab_teach:    'KENNA RÚNARI',
    tab_progress: 'FRAMVINDA',
    tab_reader:   '⚗ V2 RANNSÓKNARSTOFA',
    tab_correct:  'ORÐALEIÐRÉTTINGAR',
    progress_lbl: '♦ HLJÓÐFRAMVINDA',

    // Teach tab
    teach_select_lbl:   'ᚠ VELJA RÚNU',
    teach_select_note:  'Veldu rúnu. Rúnar mun tala beint til þess sem dregur hana — í núverandi tungumáli.',
    rune_none:          'Engin rúna valin.',
    teach_speak_lbl:    '✦ RÚNAR TALAR',
    invoke_btn:         '↯ LÁTUM RÚNAR TALA',
    runar_speaks:       'RÚNAR TALAR',
    teach_edit_lbl:     'BREYTA ÁÐUR EN VISTAÐ — BREYTINGAR GILDA BÆÐI FYRIR TEXT OG RÖDD',
    commit_btn:         'VISTA Í MINNI RÚNARS',
    teach_audio_lbl:    '♪ RÚNAR TALAR — FORSKOÐUN',
    teach_save_btn:     'VISTA RÖDD Í MINNI',
    teach_next_btn:     'ᚠ KENNA AÐRA RÚNU',
    teach_voice_ready:  '✓ Rödd tilbúin. Hlustaðu, síðan vistaðu.',
    teach_voice_saving: 'Vista í minni…',

    // Reader tab
    reader_card1_lbl: '✦ ÁÐUR EN VIÐ BYRJUM',
    reader_note:      'Aðeins nafnið þitt er nauðsynlegt. Allt annað hjálpar Rúnari að tala persónulega.',
    name_lbl:         'NAFNIÐ ÞÍT EÐA GÆLUNAFN',
    name_ph:          'Hvernig á Rúnar að kalla þig?',
    dob_lbl:          'FÆÐINGARDAGUR',
    day_ph:           'Dagur',
    month_ph:         'Mánuður',
    year_ph:          'Ár',
    area_lbl:         'SVIÐ LÍFSINS',
    seek_lbl:         'HVAÐ ERTU AÐ LEITA AÐ?',
    q_lbl:            'SÉRSTÖK SPURNING',
    q_ph:             'T.d. Hvað heldur mér aftur?',
    opt:              '(VALKVÆTT)',
    begin_btn:        'HEFJA LESTURINN',
    draw_lbl:         'ᚠ DRAGÐU RÚNINA ÞÍNA',
    draw_note:        'Lokaðu augunum um stund. Haltu spurningunni í huga. Veldu síðan rúnina sem kallar til þín.',
    speak_btn:        'HEYRA RÚNAR TALA',
    life_rune_lbl:    'LÍFSTÍÐARRÚNAN ÞÍN',
    drawn_lbl:        'DREGIN RÚNA',
    layer1_lbl:       '✦ RÚNAR TALAR',
    layer2_lbl:       '~ DÝPRI HUGLEIÐING',
    draw_another:     'DRAGA AÐRA RÚNU',
    start_over:       'BYRJA AFTUR',

    // Voice
    voice_btn:         'ᚢ HEYRA RÚNAR TALA',
    voice_btn_loading: 'ᚢ RÚNAR TALAR…',
    voice_btn_regen:   'ᚢ ENDURGERA RÖDD',
    voice_player_lbl:  '♪ RÚNAR TALAR',

    // Ritual names — change here, reflects everywhere
    ritual_gathering:         "THE GATHERING",
    ritual_gathering_jcard:   "SAFN RÚNANNA",
    ritual_gathering_request: "BIÐJA UM THE GATHERING",
    ritual_gathering_new:     "NÝ SAMKOMA",
    ritual_3readings:         "3 LESTUR",

    // Corrections tab
    corr_lbl:       '✒ ORÐALEIÐRÉTTINGAR',
    corr_note:      'Kenndu Rúnari betri orð. Skráðu orðið sem hann notaði og hvað hann ætti að segja í staðinn.',
    orig_lbl:       'ORÐ EÐA SETNING SEM RÚNAR NOTAÐI',
    orig_ph:        '"gangi þér vel" eða "þú munt ná árangri"…',
    repl_lbl:       'SKIPTA ÚT FYRIR',
    repl_ph:        '"megi leiðin opnast fyrir þér"…',
    ctx_lbl:        'SAMHENGI',
    ctx_ph:         'T.d. "þegar talað er um Fehu"',
    applies_lbl:    'GILDIR FYRIR',
    scope_both:     'Bæði tungumál',
    scope_en:       'Aðeins enska',
    scope_is:       'Aðeins íslenska',
    save_corr:      'VISTA LEIÐRÉTTINGU',
    saved_corr_lbl: '\u{1F4DC} VISTAÐAR LEIÐRÉTTINGAR',
    no_corr:        'Engar leiðréttingar enn.',

    // Character tab
    char_lbl:       '\u{1F464} PERSÓNULEIKI RÚNARS',
    char_note:      'Þetta er hver Rúnar er. Breyttu frjálslega — breytingar taka gildi við næstu köllun.',
    test_lbl:       '\u{1F9EA} PRÓFAÐU RÖDD RÚNARS',
    test_note:      'Skrifaðu eitthvað og heyrðu hvernig Rúnar svarar með núverandi persónuleika.',
    test_ph:        'T.d. Ég dró Fehu í dag og finn mig standa í stað…',
    test_btn:       'PRÓFA NÚVERANDI PERSÓNULEIKA',
    runar_responds: 'RÚNAR SVARAR',
    version_lbl:    '\u{1F4DC} ÚTGÁFUSAGA',
    preview_btn:    'FORSKOÐUN',
    save_char_btn:  'VISTA PERSÓNULEIKA',

    // Status messages
    st_traversing:   'Rúnar fer um heimana…',
    st_spoken:       '✓ Rúnar hefur talað.',
    st_listening:    'Hlustandi…',
    st_saving:       'Vistandi…',
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

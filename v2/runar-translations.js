// ═══════════════════════════════════════════════════════
// RÚNAR · TRANSLATIONS
// UI text for all supported languages
// ═══════════════════════════════════════════════════════

const UI_TEXT = {

  en: {
    // Header
    brand:   'RÚNAR SYSTEM',   // 2026-10-21 owner: AGNDOFA → Rúnar všude (shrine)
    title:   'Knowledge Shrine',
    sub:     'Teach Rúnar. Shape his voice. Feed his wisdom.',

    // Tabs
    tab_teach:    'TEACH RÚNAR',
    tab_progress: 'PROGRESS',
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
    teach_audio_lbl:    '♪ RÚNAR SPEAKS — PREVIEW',
    teach_save_btn:     'SAVE VOICE TO MEMORY',
    teach_next_btn:     'ᚠ TEACH ANOTHER RUNE',
    teach_voice_ready:  '✓ Voice ready. Listen, then save.',
    teach_voice_saving: 'Saving to memory…',

    // Reader tab
    reader_card1_lbl: 'BEFORE WE BEGIN',   // 2026-10-21: ✦ → svíčka (kreslí _updateReadingForm v runar-reading.js)
    // 2026-10-27 (owner, hlášení 5439bcc1 / 36f14a03): rituál pod BEFORE WE BEGIN, rozbalí se „+“.
    // 2026-10-28 (owner „2. ano“): „think about what is on your heart“ — ownerova věta s doplněným „is“ (Google Books: „what is on your heart“
    // doloženo; „in your heart“ 11× častější, ale znamená city, „on“ = co tě tíží, k tahu sedí). Namluvené: v2/audio/ritual_en.mp3.
    ritual_text: 'Find a quiet place before you draw. Light a candle or some incense if you like, or simply sit in silence. Breathe in deeply and think about what is on your heart. When your mind settles, draw a rune.',
    player_listen: 'Listen to Rúnar',   // nota přehrávače-svíčky (aria-label) — hlas čtení, Kolekce, deník, rituál
    player_seek: 'Recording',           // svíčka jako posuvník (aria-label; hodnotu čte čtečka jako „0:12 / 1:30“)
    reader_note:      'Tell me where to look. The rune speaks for itself.',
    name_lbl:         'YOUR NAME OR PREFERRED NAME',
    name_ph:          'How shall I address you?',
    reading_mode_mine:    'MY READING',
    reading_mode_someone: 'FOR SOMEONE',
    sign_out:             'SIGN OUT',
    auth_or:              'or',
    auth_modal_sub_google: 'No password needed — continue with Google.',
    // 2026-10-09: přihlášení e-mailem kódem (runar-auth.js sendLoginCode) — viditelné až s AUTH_EMAIL_ENABLED.
    // 2026-10-10: bez počtu číslic — Supabase posílá 8, ne 6, a délka je nastavení v dashboardu, ne vlastnost appky.
    auth_modal_sub_code:  'No password needed — you will get a code by email.',
    auth_email_lbl:       'YOUR EMAIL',
    auth_email_ph:        'your@email.com',   // 2026-10-12: zástupný text pole — do té doby jen natvrdo v HTML, v IS anglicky (CODE-read)
    auth_code_send:       'SEND CODE',
    auth_code_sent:       'A code is on its way to {email}. Enter it here.',
    auth_code_lbl:        'CODE',
    auth_code_enter:      'ENTER',
    auth_code_back:       'Use a different email',
    auth_code_bad:        'That code did not work. Check it, or ask for a new one.',
    auth_closed_test:     'Rúnar is still being tested. This email is not on the list.',
    auth_email_need:      'Please enter your email.',
    auth_sending:         'Sending…',
    auth_checking:        'Checking the code…',
    auth_signing_in:      'SIGNING IN…',   // 2026-10-10: tlačítko při návratu z Google, do té doby natvrdo v runar-app.js
    auth_rate:            'Too many attempts — wait a little, or use Google above.',
    auth_code_wait:       'Your code is on its way. You can ask for a new one after a minute.',   // 2026-10-10: druhý kód do minuty
    auth_failed:          'Sign-in did not work. Try again, or write to runar@therunekeeper.com.',   // 2026-10-22: bez technického textu Supabase
    auth_send_failed:     'Your code could not be sent. Try again in a moment, or write to runar@therunekeeper.com.',
    auth_offline:         'Rúnar could not be reached. Check your connection and try again.',
    auth_expired:         'Your sign-in has run out. Please sign in again.',
    q_teaser:             'Deeper questions open with {tier}.',
    journal_teaser:       'Every reading you take for yourself is kept. Move to {tier} to open your full journal.',   // 2026-10-10: čtení „pro někoho“ se neukládá (CODE-read (l))
    journal_teaser_count: 'Every reading you take for yourself is kept — {count} in total. Move to <strong style="color:var(--gold);font-style:normal;">{tier}</strong> to open your full journal.',   // 2026-09-30: dřív natvrdo v runar-journal.js
    tree_growth_quote:    '<em>"The tree does not grow between visits.<br>It grows through them — slowly,<br>the way birch roots find water under stone.<br>Each rune you draw is already here.<br>Come back. The tree remembers."</em>',
    setup_someone_note:   'Enter the name of the person you are reading for. This reading will not be added to your journal.',
    setup_for_name_lbl:   'NAME',
    setup_for_name_ph:    'Name or nickname',
    day_ph:           'Day',
    month_ph:         'Month',
    area_lbl:         'AREA OF LIFE',
    // 2026-10-12: tři nápovědy pod „+“ vrácené (znění z 2026-09-29) — 2026-10-10 je úklid mrtvých klíčů smazal, protože je kód skládá
    // `t(k + '_hint')` (_updateAreaSeekLabels, toggleFormHint) a ㉽ dynamickou příponu neviděla; „+“ pak ukazoval holý klíč.
    area_hint:        'The area tells Rúnar where in your life to let the picture land.',
    seek_hint:        'This sets the tone.',
    intention_hint:   'This sets the time the reading speaks to — for a single rune only.',   // 2026-10-16 owner: „platí jen pro single“ → „stačí jen for a single rune only“
    // 2026-09-29 (KUKY bod 4: jen jedna věta, „není potřeba to víc vysvětlovat, alespoň ne zatím“) — rozbalí „+“ u popisku.
    seek_lbl:         'WHAT ARE YOU SEEKING?',
    intention_lbl:    'THIS READING IS FOR',
    report_btn:       'Report a note',
    sp_gender_lbl:    'How Rúnar addresses you',
    report_title:     'Report',
    report_who:       'Who are you?',
    report_who_ph:    'Name or initials',
    report_who_save:  'Save',
    // 2026-09-25: náhled reportu ukazuje celý zachycený text, zvláštní řádek o přiloženém Asku (report_ask_attached) odešel.
    report_flagging:  'Reporting:',
    // Přepínač čtení přes Opus 5 — jen admin (od 2026-10-09 čtou všichni přes GPT-6 sol, DECISIONS 2026-10-09 (13));
    // do 2026-10-08 opačně: 'Read with GPT-6 sol (test)'. Jméno modelu hlídá smoke ㉴ proti MODELS v claude-proxy.
    opus_toggle:      'Read with Opus 5 (test)',
    // Výběr obrazu pro admina (2026-10-06) — týž obraz vybrané runy víckrát pro testování.
    img_pin_lbl:      'Image for this rune (test)',
    img_pin_random:   'chosen at random',
    img_pin_vyz_auto: 'meanings take turns',
    img_pin_title:    'The same image stays with this rune until you choose another.',
    img_pin_cold:     'in winter',
    img_pin_bright:   'spring to autumn',
    img_pin_offseason: 'not this time of year',
    report_type:      'Type',
    report_t_replace: 'Replace text',
    report_t_rephrase:'Reword',
    report_t_pattern: 'Repeated phrase',
    report_t_visual:  'Visual / layout',
    report_t_crash:   'Error / crash',
    report_t_other:   'Other',
    report_t_keep:    '✦ Keep this',   // 2026-09-30 (KUKY bod 6): uložit dobré čtení / větu pro vizuály
    report_t_grammar: 'Grammar',       // 2026-10-09: typ pro testery (hlášení 83f2d16c)
    report_t_wrongword: 'Wrong word',  // 2026-10-09: testerovi se tak jmenuje typ rephrase (admin dál „Reword“)
    report_msg:       'What is wrong?',
    report_msg_ph:    'A short note',
    report_repl_lbl:  'Correct text',
    report_repl_ph:   'How it should read',
    report_send:      'Send',
    report_cancel:    'Cancel',
    report_saved:     'Saved — will send when you are online',
    report_sent:      'Sent',
    report_need_type: 'Pick a type first',
    q_lbl:            'THE SITUATION',
    // Navadi ke „kde stojim", ne k „co se stane" — to je hranice mezi otazkou,
    // na kterou Runar umi odpovedet, a otazkou, kterou musi odmitnout (G2b no-fate).
    q_hint:           'Tell Rúnar where you stand now — not what is to come.',
    // 2026-10-12 (DECISIONS 2026-10-12 (7), kontrola GDPR bod 1): upozornění pod „+“ za THE SITUATION — volná otázka může nést
    // zvláštní kategorii údajů (zdraví, vztahy, víra), jde k AI v USA a u vlastního čtení se ukládá. Souhlas při psaní je krok 2.
    // 2026-10-13 (hlášení ownera 564fac2a, DECISIONS 2026-10-13 (1)): jen krátké obecné poučení, bez zmínky o AI — kam otázka jde
    // a že se ukládá, říká souhlas u pole (qconsent_lbl), který každý, kdo otázku píše, vidí dřív, než odejde.
    qpriv_hint:       'Please do not write anything about your health here.',
    // 2026-10-12 (DECISIONS 2026-10-12 (7), krok 2): výslovný souhlas s odesláním a uložením otázky (čl. 9 GDPR) + věk 13+;
    // ukáže se při prvním psaní do otázky nebo Asku (_showQuestionConsent, runar-app.js), odvolání v menu (sp_qconsent_lbl).
    qconsent_lbl:     'I agree that my questions are sent to OpenAI in the USA, whose AI writes the readings, even when I write about my health or anything else sensitive. I also agree that they are kept in my journal when the reading is mine. I am 13 or older.',
    qconsent_need:    'Your question is sent only with your consent. Tick the box. To continue without a question, delete it.',
    qconsent_need_ask: 'Your question is sent only with your consent. Tick the box to send it.',
    qconsent_saved:   'Your consent has been saved.',
    qconsent_withdrawn: 'Consent withdrawn. Your questions will not be sent.',
    sp_qconsent_lbl:  'Send my questions with my readings',
    q_ph:             'e.g. I am deciding whether to take on more work',
    // 2026-09-08: ukazky, JAK napsat otazku (handoff #55). Rotuji, viz _phRotate.
    q_placeholders:   ['I keep putting off a conversation I need to have.',
                       'Something in my relationship feels unsettled, and I do not know why.',
                       'I am standing at a fork between staying and leaving.',
                       'I feel disconnected from something that used to matter to me.',
                       'I am carrying a decision about my family that I have not made yet.',
                       'I do not know if I am ready for the change that is coming.',
                       'I have been avoiding looking closely at where I am right now.',
                       'I am deciding whether to take on more work.'],
    // Staticke upozorneni — NENI Runarovym hlasem zamerne. Runar sam na popis
    // priznaku reagovat nema: komentoval by tim necí telo, coz mu _noColdRead
    // a zakaz rad zakazuji (rozhodnuto s ownerem 2026-08-16). Tohle mluvi APPKA.
    // 2026-10-19 (owner „13. pod BEGIN THE READING“, text CODE-read): uživatel ví, že mluví s AI (EU AI Act čl. 50 od 2. 8. 2026).
    // 2026-10-22 (owner „5. c“, návrh CODE-read): jedna věta místo dvou — AI (EU AI Act čl. 50) + „ne odborná rada“ (do té doby zvlášť
    // klíč disclaimer, #reader-disclaimer); „his words are made new each time“ znělo divně (made new = obnovené).
    ai_note:          'Rúnar is an AI. His readings are for reflection, not professional advice.',
    opt:              '(OPTIONAL)',
    begin_btn:        'BEGIN THE READING',
    draw_lbl:         'ᚠ DRAW YOUR RUNE',
    random_btn:       'ᚲ LET THE RUNES DECIDE',
    speak_btn:        'HEAR RÚNAR SPEAK',
    begin_btn_visitor: 'DRAW A RUNE',        // 2026-10-10: návštěvník čtení nedostane — tlačítko ho neslibuje (_updateReadingForm); vráceno s formulářem návštěvníka
    speak_btn_visitor: 'DRAW THIS RUNE',     // 2026-10-10: návštěvník čtení nedostane — tlačítko tahu ho neslibuje (_updateReadingForm)
    speak_btn_add:    'ADD RUNE',
    speak_btn_draw:   'DRAW YOUR RUNES',
    // Okno „mluvit znovu v jiném jazyce“ (openLangSwitchModal) — 2026-10-11, do té doby natvrdo anglicky v runar-app.js (procházka CODE-read).
    // lang_in_<jazyk> = jak tenhle jazyk UI nazývá daný jazyk ve vazbě „in …“ (IS 3. pád po „á“); klíč skládá kód: t('lang_in_' + l).
    lang_in_en:       'English',
    lang_in_is:       'Icelandic',
    lsm_title:        'SPEAK AGAIN IN {language}?',
    lsm_body:         'Rúnar’s voice in {language} carries its own truth — not a translation, but a fresh reading of the same rune. This draws from Rúnar again and uses {casts}.',
    lsm_confirm:      'YES — SPEAK IN {language}',
    lsm_cancel:       'STAY IN {language}',
    spread_cost:      'This reading costs {casts}.',   // 2026-09-29 reporty ownera: cena čtení nikde nebyla
    life_rune_lbl:    'YOUR LIFE RUNE',
    badge_life_note:  'your life rune',
    layer1_lbl:       '✦ RÚNAR SPEAKS',
    layer2_lbl:       '~ DEEPER REFLECTION',
    start_over:       'START OVER',

    // Voice
    voice_btn:         'ᚢ HEAR RÚNAR SPEAK',
    voice_btn_loading: 'ᚢ RÚNAR IS SPEAKING…',
    voice_btn_regen:   'ᚢ REGENERATE VOICE',
    voice_btn_done:    '♪ RÚNAR HAS SPOKEN',
    voice_player_lbl:  'RÚNAR SPEAKS',   // 2026-10-29 bez ♪ (owner „odeber notu“ — nota je hned pod nadpisem v přehrávači)

    spread3_mode_single:      "SINGLE RUNE",
    spread_mode_norns:        "NORNS",
    spread_mode_kriz:         "COMPASS",
    spread_mode_horseshoe:    "HORSESHOE",
    spread_mode_yggdrasil:    "YGGDRASIL",
    tree_name_ph:             "A name only you will know...",
    redeem_ph:                "e.g. FEHU-7K3M-P9QX",
    jf_all_runes:             "All runes",
    jf_all_areas:             "All areas",
    jf_spreads:               "✦ Spreads",
    slot_remove_hint:         "click to remove",

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

    // Status messages
    st_traversing:   'Rúnar is traversing the realms…',
    st_spoken:       '✓ Rúnar has spoken. Review and commit.',
    st_saving:       'Saving…',
    st_saved:        '✓ Saved.',
    st_saved_local:  '✓ Saved locally.',
    st_fill_fields:  'Fill in both fields.',
    // ── Reader UI (added refactor #6) ──────────────────────
    dam_title:          'DELETE YOUR ACCOUNT?',
    delete_btn:         'DELETE',
    cancel_btn:         'CANCEL',
    deleting_btn:       'DELETING...',
    journal_title:      'YOUR RUNE READINGS',   // 2026-10-20: ✦ → ikona knihy (runar-journal.js)
    journal_count_recent: 'last {n}',   // 2026-10-10: dřív natvrdo v runar-journal.js; počet všech čtení skládá vn('reading')
    journal_empty:      'No rune readings recorded yet.<br>Draw your first rune.',
    profile_load_err:   'Could not load your account details — check your connection and try again.',   // 2026-10-12: selhané načtení profilu (fetchUserProfile), vzor journal_load_err
    profile_retry_btn:  'TRY AGAIN',
    journal_load_err:   'Could not load your rune readings — check your connection and try again.',   // 2026-10-10: chyba načtení deníku (dřív brána návštěvníka / prázdný deník)
    life_rune_short:    'Life rune',
    // 2026-10-11: hlas čtení v deníku (owner „hear the reading by znělo líp“); tlačítko Kolekce z deníku pryč i s klíči jcard_audio_btn,
    // audio_loading/none/playing/error (owner: „ty mají být jen v kolekci“)
    jcard_voice_btn:    'ᚢ HEAR THE READING',
    gift_card_btn:      '+ GET A {card}',
    become_rs_btn:      'BECOME A RUNE SEEKER \u2192',
    install_title:      'INSTALL R\u00daNAR',
    got_it_btn:         'GOT IT',
    install_body_ios:   'In Safari: tap the <strong>Share</strong> button (□↑) at the bottom of your screen, then select <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.',   // 2026-10-10: dřív natvrdo v installPWA (runar-auth.js)
    install_body_other: 'In Chrome or Brave: tap the <strong>⋮ menu</strong> in the top right and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.',
    sw_update:          'A new version of Rúnar is here. Tap to refresh the page.',   // 2026-10-22: výzva místo okamžitého reloadu (runar-auth.js)
    sp_guide_link:      '? GUIDE & FAQ',
    sp_higher_path:     'UPGRADE YOUR JOURNEY',   // 2026-09-29 KUKY: „dáme Upgrade your journey“ (dřív THE JOURNEY BEYOND)
    sp_install_btn:     '\u2b07 INSTALL R\u00daNAR',
    sp_privacy_link:    'PRIVACY POLICY',
    // 2026-10-15 „Send Rúnar a line“ (owner „8. ano“): menu, okno se zprávou, hlášky (openLine / sendLine v runar-app.js)
    line_menu:          '✉ SEND RÚNAR A LINE',
    line_menu_visitor:  '✉ WRITE TO runar@therunekeeper.com',
    sp_menu_title:      'MENU',   // 2026-10-27: nadpis menu (owner „něco bych nahoru dal, buď MENU…“)
    sp_instagram:       'INSTAGRAM',   // 2026-10-28: značka, EN i IS stejně
    line_title:         'SEND RÚNAR A LINE',
    line_sub:           'Write what is on your mind. You will get the answer by email.',
    line_ph:            'What happened, or what would you like to say?',
    line_note:          'The app version and your device go with it, so we can help.',
    line_send:          'SEND',
    line_sent:          'Your line is on its way.',
    line_err:           'The line did not get through. Try again in a moment.',
    line_limit:         'You sent a few lines just now. Try again in an hour.',
    line_empty:         'Write something first.',
    sp_privacy_settings_lbl: 'PRIVACY',
    optout_label: 'Help improve R\u00fanar with my readings',
    optout_saved_on: 'Thanks \u2014 your readings help improve R\u00fanar',
    optout_saved_off: 'Done \u2014 your readings will not be used for analysis',
    optout_err: 'Could not save \u2014 please try again',
    tcm_title: 'YOU ARE A R\u00daNAR TESTER',
    // 2026-10-09: čtení píše OpenAI, Anthropic jen jako záloha (DECISIONS 2026-10-09 (13)); znění = docs/inbox/2026-09-30-navrh-textu-soukromi.md C.
    tcm_body: 'To help us make the readings better, we store the readings you draw and review their text and the details you enter, to improve the quality of Rúnar. For a reading to exist at all, the details you enter are sent to OpenAI, which writes it (or to Anthropic, if OpenAI is unavailable), and its text to ElevenLabs for the voice — all in the United States. Neither OpenAI nor Anthropic uses them to train its models, and each keeps them for no more than 30 days, to check for misuse. What we keep is stored in the EU, we never sell it, and you can ask us to delete it at any time. You can stop testing whenever you like.',
    tcm_agree: 'I AGREE',
    tree_visitor_dob:   'Your life rune is written into the day you were born. Enter it, and see which one you carry.',
    tree_visitor_read:  'Sign in to read what this rune carries.',
    // 2026-09-27 (KUKY „ano zapoj“; DECISIONS 2026-09-27 (5)): odkud životní runa je. Autora nejmenuje (owner), ale přiznává, že
    // rozdělení roku je moderní — ne dochované ze severu (HANDOFF62 Cowork, upraveno CODE-tune: „halves“ → „half-months“).
    tree_lr_origin:     'The runic year turns through twenty-four half-months, one rune to each. Your life rune is the one the sun stood in on the day you came. The runes are old; this way of dividing the year is not — it is a modern reckoning, not something carried down from the old north.',
    name_lore_lbl:      'YOUR NORSE NAME',
    name_lore_intro_add: 'Your life rune comes from the day you were born. A name is a separate thread — give Rúnar your Norse name, your own or one you choose, and he will read what it carries.',
    name_lore_add_btn:  'Give Rúnar your Norse name',
    name_lore_limit:    'Rúnar has already read the names you gave him.',
    tree_admin_reset:      'RESET LIFE RUNE (ADMIN)',
    tree_admin_reset_done: 'Life rune reset.',
    name_lore_btn:      'What does my name carry?',
    name_no_norse:      'Rúnar sees no Norse root in this name.',
    name_known_untraced: 'Rúnar knows this name, but has not traced its roots.',
    name_no_norse_from: 'Rúnar sees no Norse root in this name — its roots go back to {origin}.',
    name_lore_intro:    'Your life rune comes from the day you were born. Your name is a separate thread — Rúnar can look at it, and will say plainly if it holds nothing of the north.',
    tree_rs_teaser:     'This rune is the root you grew from, carried since birth. Rúnar does not foretell it — he helps you remember it.',
    life_rune_free:   'Free',
    tree_rs_balance:    'your rune readings:',
    tree_rs_free_line:  '{casts} available for regular draws',   // 2026-10-10: dřív natvrdo v runar-tree.js (ráčna ㉸)
    tree_carry_life_rune: 'You carry the life rune {rune}',   // 2026-10-10: dřív natvrdo v runar-tree.js (isIs ? … — ㉸ alias neviděl)
    // 2026-10-12: + člen „the“ — „You carry life rune Fehu“ zní jako zkratka, ne věta (nález CODE-read při procházce appky)
    tree_name_label:    'NAME YOUR TREE',
    tree_hist_all:      'whole tree · {casts}',
    tree_hist_at:       'reading {k} of {n}',
    tree_hist_seed:     'before the first reading',
    tree_insp_hint:     'tap a branch to inspect it',
    tree_insp_count:    '{casts} in this theme',
    tree_insp_rank:     'rune order:',
    tree_export_btn:    'COPY TREE STATE',
    tree_zoom_in:       'zoom in',
    tree_zoom_out:      'zoom out',
    tree_zoom_all:      'whole tree',
    tree_step_prev:     'previous reading',
    tree_step_next:     'next reading',
    tree_export_ok:     'copied · {casts} · {kb} kB — paste it to Claude',
    tree_export_fail:   'clipboard refused — select the text below and copy it',
    tree_named_label:   'YOUR TREE',
    tree_name_edit:     'edit',
    tree_name_err:      'Could not save',
    save_btn:           'SAVE',
    tree_reveal_btn:    'REVEAL YOUR LIFE RUNE',
    tree_read_btn:      'Read what it carries',
    // 2026-10-06 (KUKY „opravíme ty losované… věty jsou natvrdo v kódu místo v překladech“): věty nad čtením, pozdravy a citát
    // bydlí tady (dřív natvrdo v runar-app.js). hero_phrases = los při načtení; EN a IS na STEJNÝCH indexech. Proč přepsáno: DECISIONS 2026-10-06.
    hero_phrases: [
      'The stones are laid out. Take your time — they are not going anywhere.',
      'Close your eyes for a moment, then draw. Whatever rune comes up, we will look at it together.',
      'I have sat with these stones a long time. They do not tell me who you are — they help you look.',
      'Something brought you here today. Draw, and we will see what it stirs.',
      'The rune you draw is rarely the one you expected. That is the point.',
      'Before you draw — breathe. The stones read stillness as clearly as questions.',
      'I have watched seekers come through darkness, doubt, and full moons. The runes receive all of it. Draw freely.',
      'You do not need to know the question clearly. Sometimes the reading shows you what you were asking.',
      'Some days the stone speaks loudly. Other days it whispers. Either way — it speaks.',
      'A rune decides nothing. It gives you something to look at — the deciding stays with you.',
      'Whatever you carry through the door — leave it on the table. The reading begins from here.',
      'Draw when you are ready. There is no wrong moment — only the one you chose.',
    ],
    hero_quote:         '"The runes do not predict your fate.<br>They remind you of the path<br>you already walk."',
    hero_down_aria:     'Scroll down to the reading',   // 2026-10-09: proužek pod hero (#hero-down), jen pro čtečku obrazovky
    hero_up_aria:       'Back up to Rúnar',             // 2026-10-09: týž proužek u horní lišty (šipka nahoru)
    greet_hello:        'Good to see you.',   // 2026-10-10: bez jména (hlášení 26cac032) — jméno stojí vedle v liště
    greet_again:        'Good to see you again.',
    tester_suffix:        '(tester)',
    tier_soon:            '— coming soon',   // 2026-09-26: z runar-app.js (§10), poznámka u tieru v panelu účtu
    // 2026-10-19: okno „Your journey with Rúnar“ (openJourney v runar-app.js; DECISIONS 2026-10-19 (7), (8)). Sada EN + IS od CODE-read,
    // čte ji i web therunekeeper.com (CODE-web) — texty jen tady (§20). {tier} = jméno účtu z TIERS, {price}/{year} z TIERS.*.price_isk_*.
    journey_title:        'WALK WITH RÚNAR',   // 2026-10-20 owner „10. ano“ (hlášení bd915d60) — dřív „YOUR JOURNEY WITH RÚNAR“; IS nadpis vymyslí CODE-read
    journey_sub:          'Each step gives you more {casts}. Walk as far as you wish, and step back whenever you like.',   // 2026-10-20 owner (hlášení bd915d60); {casts} z VOCAB
    journey_monthly:      'MONTHLY',
    journey_yearly:       'YEARLY',
    journey_price_m:      '{price} kr a month',
    journey_price_y:      '{year} kr a year',   // 2026-10-21 owner: měsíční částka až za roční, v závorce a menším písmem (journey_price_y_mesic)
    journey_price_y_mesic: '({price} kr a month)',
    journey_gift:         'Two months are a gift.',
    journey_here:         'you are here',
    journey_walk_on:      'WALK ON AS {tier}',
    journey_step_back:    'STEP BACK TO {tier}',
    journey_step_note:    'From the end of this period.',
    journey_manage:       'MANAGE YOUR SUBSCRIPTION',
    journey_web_note:     'Opens therunekeeper.com. You return here with the same account.',
    journey_free:         'Free',
    journey_free_join:    'Registration is free',   // owner 2026-10-20 (CODE-web 6f6a1df); 2026-10-20 bez tečky — štítek jako „Free“
    // 2026-10-21 owner (přes CODE-web, „ano, informační řádek s cenou“): u Rune Seekera pod „Registration is free“ menším písmem, kolik
    // stojí čtení — jako měsíční dovětek u ročních cen; ne druhé tlačítko. {casts} = vlp('cast'), první písmeno velké v kódu; {card} = vl('card');
    // {price} = nejlevnější balíček CARD_PACKS. V Play se nezobrazuje (ceny, consumption-only).
    journey_seeker_card:  '{casts} with a {card}, from {price} kr',
    journey_card_note:    'Have a code? Enter it here.',   // 2026-10-27 owner: bez ceny (cena stojí u Rune Seekera v journey_seeker_card)
    journey_play_sub:     'Where you stand on the path, and what each step holds.',
    journey_play_foot:    'Rúnar asks nothing of you here.',
    journey_foot:         'Prices in Icelandic krónur. Cancel any time.',
    journey_visitor_ft:   'The Runes Collection and your life rune.',
    tester_reset_btn:     'RESET TREE (TESTER)',
    tester_reset_confirm: 'Reset your tree — life rune, birth date and founding? This is for testing.',
    tester_reset_done:    'Tree reset. Begin again.',
    tree_founding_reading_lbl: 'The Norns who rooted your tree',
    founding_story_lbl:  '\u2726 THE ROOTING',
    founding_story_text: 'What comes now is the rooting. Three runes for the three who tend the well beneath the tree: Urður, who holds what has been. Verðandi, who holds what is becoming. Skuld, who holds what is still owed. Draw them, and the tree is yours. Every rune you draw after these makes it grow.',
    tree_founding_intro: 'Now your life rune is the seed your tree grows from. Next come the three Norns — Urður, Verðandi and Skuld — and the tree takes root. Free, and told in text alone.',
    founding_cost:       'Free, and told in text alone.',
    tree_need_rune:      'Every tree begins as a seed in the soil. The seed of your tree is your life rune — the rune that has been with you since birth. Let Rúnar read it first; from it your tree will grow.',
    lr_plant_intro:      'Your life rune is more than a sign — it is a seed. From it your tree of life can grow.',
    tree_founding_btn:   'ROOT YOUR TREE',
    tree_founding_toast: 'Draw three runes for the Norns.',
    tree_reveal_intro:  'Before the runes speak of today \u2014 shall R\u00fanar reveal the rune you carry since birth?',
    reading_loading:    'THE STONES SPEAK IN SILENCE\u2026',
    reading_error:      'Error generating rune reading.',
    // Hesla zrcadla — jedno se losuje pod loading label pri startu cteni (reporty #5/#6, KUKY 2026-09-21:
    // "rict mu, ze cteni je obraz, zrcadlo… nejlepe pred tim nez runar vytvori cteni").
    motto_image:        'Rúnar speaks in images — the rune lives inside the image.',
    motto_mirror:       'The image is a mirror. What you seek, you find in it yourself.',
    motto_paths:        'Rúnar does not tell you what to do. He points to what is possible.',
    // Helper ? (runar-helper.js) — report #2, KUKY 2026-09-21: zviditelnit glyf-tap a Ask ("veci ktere nejdou na prvni pohled videt").
    helper_btn:         'Help with the reading',
    helper_guide:       'Tap here — it shows how a reading works.',
    helper_glyph:       'Tap the rune — it tells its name and meaning.',
    helper_ask:         'Tap here — suggested questions open.',
    helper_ask2:        'Ask how the image touches your question.',
    // Navod pod statickou runou (Kolekce), KUKY 2026-09-23. Radky = odstavce, poradi = hierarchie z RUNAR_DESIGN.
    // Kolekce (2026-09-23, z runar-app.js kvuli §10)
    coll_no_audio:      'No recording available yet.',
    coll_audio_missing: 'Audio file missing.',
    // 2026-10-10: „draw one“ → „choose one“ — v Safn rúna se runa vybírá, netáhne.
    vcn_text:           'You walk here as a <strong>Visitor</strong>. Five runes await you — choose one, and listen to the ancient stones.<br><br>Should you want all twenty-five, and a reading that speaks to you alone, become a <strong>Rune Seeker</strong>. Free to join.',
    // 2026-10-12 (owner „ano“): klepnutí na zamčenou runu — dřív nedělalo nic a působilo jako porucha. Navazuje na vcn_text („Five runes await you“).
    // Okno „Where to start“ — jednou pro každého (2026-10-11, DECISIONS (65)); {guide} = guide_title. Text schválil owner.
    wts_title:          'WHERE TO START',
    wts_l1:             'I speak in images, not in plain answers. Each reading is a picture with a rune inside it.',
    wts_l2:             'Begin in the Runes Collection. Under every rune I tell you how I see it, and what to look for when it comes to you.',
    wts_note:           'You will find this again under “{guide}”.',
    wts_open:           'OPEN THE RUNES COLLECTION',
    wts_later:          'LATER',
    guide_title:        'How a reading works',
    // 2026-09-29 (report KUKY 10:04 „mělo by být: you bring the question… in area of life, pak pojmenovat seeking a intention“):
    // první řádek nahrazen čtyřmi o tom, co člověk volí a co to ve čtení dělá (oblast · tón · čas · volitelné).
    // 2026-10-30 (owner „5. B“): mluví Rúnar sám, 1. osoba, krátké věty pro poslech (návod má i hlas, RUNAR_NAVOD_HLAS v configu);
    // výčty u hledání a času pryč (owner: „nemusíme úplně vypisovat každé zvlášť, je to logická volba“). Do té doby 3. osoba
    // („sets how Rúnar speaks“) a z pěti voleb hledání jen tři jmenované.
    guide_lines:        ['You bring the question. Then you show me where it lives: the part of your life I should look at.',
                         'Tell me what you are seeking, and I will know how to speak.',
                         'Tell me what the reading is for, and I will know where in time to look.',
                         'You do not have to choose any of it. Leave it open, and the rune will lead you.',
                         'The rune opens a way of looking at your question: an angle you might not have taken on your own.',   // 2026-09-29: „it“ po nových řádcích nemělo k čemu patřit
                         'I give the rune a voice. It speaks through an image of a place or a moment, something happening out in nature or at a kitchen table. A rune holds more than one word can.',
                         'The meaning is yours to find. Read the image slowly and notice what stays with you — one detail, one movement. That is where the reading touches your life.',
                         'The last line is not advice, but a possibility or a question for you to weigh.',
                         'I carry the light and point to where you might look. The seeing is yours.',
                         'In the Runes Collection, each rune has its own description.'],
    // Text runy pod statickou runou v Kolekci (KUKY 2026-09-23 „4. ano“ po schválení tónu na Fehu/Tiwaz/Hagalaz).
    // Z ownerových statických popisů (RUNAR_POPISY_RUN.md); 4 odstavce: co runa je · jak ji číst v obraze ·
    // co neslibuje · její otázka. IS psané nativně, ověřené is-grammar-qa + korpusem (workflow kolekce-texty).
    // Tvar runy vedle velkého glyfu v detailu Kolekce (KUKY 2026-09-29 bod 5: „udělej všechny… přesně vedle toho velkého glyfu“).
    // Kánon o tvarech nic nemá → Rúnarův pohled na tvar (co v něm lze vidět), žádná etymologie ani historie
    // (Thurisaz původně s „Old English þorn“ — owner: „OLD english?“ → jen obraz). Obraz drží význam z coll_rune níž.
    coll_shape: {
      Fehu: 'One upright line with two short arms lifted from it to the right. You can see the horns of a beast in it, turned to the side, or a stem that has put out shoots and is still growing. Either way it reaches outward; it does not stay still.',
      Uruz: 'One line stands straight, and from its top a second comes down on a slant, like a broad back, or a head lowered to push. It stands on its own two legs and leans its weight forward.',
      Thurisaz: 'An upright line with a sharp point growing out of its side, like a thorn on a stem: something you cannot run your hand along without noticing.',
      Ansuz: 'An upright line with two branches slanting down from its top, like words leaving a mouth and falling toward whoever is there to hear them.',
      Raidho: 'An upright line with a loop at its top and a leg stepping out below, forward and to the right. It is a shape in motion: something leaning into the road, one foot already on its way.',
      Kenaz: 'Two short lines meet in a point and open to the right, like light spreading from a single flame. It does not fill the room; it reaches only as far as the next step.',
      Gebo: 'Two lines cross at the centre, and neither lies over the other. Take one away and what is left is only a slanted stroke; the sign exists only while both are there.',
      Wunjo: 'An upright line with a small closed triangle at its top, like a flag raised over a house when everyone has come home. The shape is complete; nothing in it is still reaching.',
      Hagalaz: 'Two upright lines, and a single stroke falling across the gap between them at a slant, like hail driving between two posts. The posts still stand when it has passed.',
      Nauthiz: 'An upright line with a short stroke laid across it at a slant, like a bar across a doorway. The line goes on below it, but not without having met it.',
      Isa: 'A single upright line, nothing more. Like an icicle, or a person standing still in the cold: everything else has fallen away, and this is what is left.',
      Jera: 'Two small bent strokes, one above and one below, each turned toward the other without touching. Like two halves of the year going round, one bringing in what the other sowed.',
      Eihwaz: 'An upright line whose two ends are bent away in opposite directions, one at the top and one at the bottom. Like a yew trunk with a branch above and a root below: it holds on to both and grows slowly between them.',
      Perth: 'An upright line with two bent strokes on its side, open like a cup tipped on its side, or a lid lifted just enough to guess what is inside. You see the opening, not what it holds.',
      Algiz: 'An upright line that opens into three at the top, like an elk lifting its antlers, or a raised hand. It is the shape of something that has heard a sound and does not yet know what it was.',
      Sowilo: 'A line that breaks, turns and breaks again, like sunlight striking through a gap in the cloud. It comes in one stroke, and for a moment everything in its path is lit.',
      Tiwaz: 'An upright line with two strokes sloping down from its tip, like an arrowhead pointing upward. Everything in the shape leans one way; there is no second direction in it.',
      Berkana: 'An upright line with two pointed swellings on its side, one above the other, like two buds on a bare twig: small and still closed, but already full.',
      Ehwaz: 'Two upright lines joined across the top by strokes that dip and meet between them. Like two horses walking side by side, or a horse and the one who rides it: neither stands alone in the shape.',
      Mannaz: 'Two upright lines, and two strokes that cross between their tops, like two people clasping hands. Out of two, one figure is made.',
      Laguz: 'An upright line with a short stroke falling from its top to one side, like a wave breaking, or water running off a ledge. It bends downward, the way water always finds the lower way.',
      Ingwaz: 'A small diamond whose sides run on past its top and bottom corners and cross there. Like a seed in its husk: closed in the middle, holding everything it needs and letting nothing out until it is ready.',
      Othila: 'A closed diamond standing on two legs that cross beneath it, like a house on its own ground, or a home-field inside its old wall. What is inside has been kept for a long time.',
      Dagaz: 'Two triangles that meet at a single point, closed at either side, like night and day touching at dawn. The shape turns on that point, where one becomes the other.',
      Blank: 'No line at all, only the smooth face of the stone. Whatever you look for in it, you bring with you.',
    },
    coll_rune: {
      Fehu: ['Fehu is value that moves. Like water poured into a vessel: for a while there is too little, then it runs over.', 'In a reading, look at what flows in the image — what gathers, passes on, spills over. Fehu is in that movement, not in what is counted.', 'It promises no gain. What flows in can flow out. What you tend grows; what you leave standing loses its strength.', 'It may ask you: what is in your hands now that could come alive if you let it move?'],
      Uruz: ['Uruz is the strength of an aurochs, heavy and untamed. It asks no one whether it may pass.', 'In a reading, look for what in the image keeps going though the way is hard. Uruz brings no ready answer, only the power to change.', 'It is not for show. Something in it is still unpolished, so it can be uncomfortable: it brings you up against your own strength, and its limits.', 'Rather than telling you to be stronger, it asks: what strength is already in you, and what could come of it?'],
      Thurisaz: ['Thurisaz is a sharp edge. It does not tell you to cross, nor to turn back. It says: careful.', 'In a reading, look at what stops short in the image, and what that reveals. The rune is the pause after a blow, before you act.', 'Its hardness is not always an attack. Beyond the edge there may be no enemy, only something you have not yet seen.', 'In that pause, it asks: what will appear if, this time, you do not strike back?'],
      Ansuz: ['Ansuz is a word that comes at the right moment and stays with you longer than it should.', 'In a reading, look for what opens in the image or is named so clearly it cannot be unseen. The rune is in what shifts once something is said.', 'It brings no ready answer. A word can also hide what is real, so Ansuz is as much about listening as speaking.', 'Perhaps it asks: what will change if you truly hear what is coming to you now?'],
      Raidho: ['Raidho is a road already begun. Step follows step, and only when you look back do you see the road they made.', 'In a reading, look at what moves in the image. Here the road itself makes something: each step changes the next.', 'Sometimes the road seems straight; sometimes it bends, and for a while you do not know why. No route is set in advance.', 'Perhaps Raidho asks: does your road truly lead where you want to go — or do you walk on only because you once set out?'],
      Kenaz: ['Kenaz is a light that reaches only a step ahead of you, to a door that was there all along, unseen.', 'In a reading, look for what becomes clear in the image. Kenaz is the moment things fit together.', 'Not every light is welcome. What it falls on never looks the same again, but can now be built on, mended or changed.', 'Then it asks: what do you see more clearly than before — and what will you do with it, now that you cannot look past it?'],
      Gebo: ['Gebo is a gift between two sides. One hand gives, another receives, and something new begins.', 'In a reading, look at what is given and received in the image. The rune is the space between the hands, and it belongs to both.', 'It is not a trade and keeps no count of who owes whom. A forced gift is no gift.', 'The question points both ways: what are you willing to give without knowing it will return — and what can you receive without repaying it at once?'],
      Wunjo: ['Wunjo is the moment something falls into place. It is no great victory; for a while you can loosen your grip.', 'In a reading, look for what people share in the image, and whether they truly see one another. Wunjo shows itself where no one has to prove anything.', 'It is not a lasting state, and the questions remain. You notice it precisely because it comes after strain.', 'It does not ask how to keep it. It asks: where in your life is there already something good — and will you let yourself fully enjoy it?'],
      Hagalaz: ['Hagalaz is hail that falls without warning. In a few moments it changes what looked solid.', 'In a reading, look for what breaks in the image, and what still stands once it has passed. Here the rune is the thing no one asked for.', 'It is not punishment, and it does not say everything must fall. Some things remain because their roots go deep.', 'So the question is not how to stop it, but: what is falling in your life now — and what will remain when the storm has passed?'],
      Nauthiz: ['Nauthiz is the feeling that something is missing. Some doors are closed now, and wanting will not open them.', 'In a reading, look at what is lacking in the image, and what the lack brings into focus. Its pressure separates need from want.', 'It can also be a warning: push too long against what cannot be, and the pressure turns inward.', 'Before you look for a way out, it asks: what do you lack so badly now that you can no longer pretend you do not need it?'],
      Isa: ['Isa is silence. Water freezes, and what was flowing a moment ago stops.', 'In a reading, look at what has stopped in the image. When all goes still, one thing is left before you. That may be why Isa is not empty.', 'It need not mean an end. The time may not have come yet. Under the ice the water may still move, unseen.', 'Perhaps it asks: what in your life is not moving now — and what could you see if you let it be this time?'],
      Jera: ['Jera is time at work. A seed lies long unseen in the ground, until the first shoot appears.', 'In a reading, look for what ripened slowly in the image, and what finally comes to light. The rune gives the seed time and room to grow.', 'The reward does not come at once. What was tended may bear fruit; neglect shows too — not as punishment.', 'Perhaps Jera asks: what are you harvesting in your life now — and what did you sow long before you knew what that harvest would look like?'],
      Eihwaz: ['Eihwaz is the yew, which grows slowly and lives long.', 'In a reading, look for what holds in the image, between an old way that no longer serves and a new one still unshaped. The rune is like a root that need not know what the branch will be.', 'It does not show where this leads, nor does it break through. Not every change comes from one decision.', 'Perhaps it asks: what is changing in you now, though it cannot yet be seen from outside?'],
      Perth: ['Perth is a closed vessel. You can guess what it holds, but until it opens, part of the picture stays hidden.', 'In a reading, look at what is closed in the image, and what is still ripening. Perth brings its own uncertainty: not "I know nothing", but "not yet".', 'It does not say what is coming. What is hidden need not be empty, and you need not break it open to see inside.', 'One question remains: what in your life can you not yet name — and what if that is because it is not ready to open?'],
      Algiz: ['Algiz is watchfulness that stays open. Like someone in a forest who hears something and lifts their head before knowing what it was.', 'In a reading, look at what listens in the image, keeps watch or draws a line. Algiz guards by noticing, not by shutting everything out.', 'It need not mean danger is near. It may only remind you that not everything has to be let in.', 'Perhaps it asks you: what do you need to protect now — and what do you not need to hold your boundary against?'],
      Sowilo: ['Sowilo is the sun that appears at the end of a long wandering. It does not tell you where to go. It lights the path, and you see where you stand.', 'In a reading, notice where the light falls in the image and what you now see from another side. Sowilo comes as that moment of understanding.', 'It does not promise that all will be well, only that now you can see. Too sharp a light can also dazzle, and show what you did not want to see.', 'Perhaps it asks: what has just lit up before you — and what can you no longer overlook?'],
      Tiwaz: ['Tiwaz is an arrow on a drawn bow, pointing one way — because a moment has come when you cannot stand on every side at once.', 'In a reading, look for what holds its direction in the image, and what that costs. The rune is in the choosing, not the winning.', 'It promises no victory. Some choices have a price, and Tiwaz does not hide it.', 'Its question could be: what matters to you so much that you stay true to it even when it costs you something?'],
      Berkana: ['Berkana is life appearing where there was only stillness. A seed needs soil, water and light, and it needs time.', 'In a reading, look for what is sprouting in the image, small but not weak. Berkana is about letting it grow without needing to know what it will become.', 'A beginning need not be impressive. Too much meddling can harm as much as neglect.', 'So perhaps it asks: what is being born in you or around you now — and what room can you give it to grow at its own pace?'],
      Ehwaz: ['Ehwaz is a horse and rider. Each feels the other, and they answer one another with every step.', 'In a reading, look at what moves together in the image, and what slackens the reins so movement can begin. Ehwaz is interplay, not speed.', 'It is not blind trust. When the two pull different ways, the movement comes apart. Nor is it about who leads.', 'Perhaps it asks: with whom or what are you trying to get moving now — and can you fall into step together?'],
      Mannaz: ['Mannaz is a person among people — not alone against the world, but taking shape among others too.', 'In a reading, look at where people meet in the image, in conflict or closeness. The rune is in what passes between them.', 'It is also a reminder: no one is a god who sees everything. For what cannot be seen from within, another person can be the mirror.', 'Perhaps it asks: what do you see of yourself in another person now — and why might that surprise you?'],
      Laguz: ['Laguz is water. It can mirror the sky, yet shows nothing of its own.', 'In a reading, look for what lies hidden in the image and still bends its course. Laguz is that hidden pull.', 'It does not say every feeling is true. Water can also be deep and murky, so the bottom cannot be seen.', 'Perhaps it asks: what do you feel inside before you have words for it?'],
      Ingwaz: ['Ingwaz is a seed in the earth: no longer what it was, not yet a plant.', 'In a reading, look for what in the image waits within until it is ready. Ingwaz is the moment when nothing more needs adding.', 'It brings no force that wants out at once. Something can be complete before you know what follows — not a loss, but a circle closing.', 'Perhaps what to begin matters less now. Ask instead: what in you has ripened enough that you no longer need to hold it inside?'],
      Othila: ['Othila is the place you come back to. Land you know, things passed from older hands into yours.', 'In a reading, look at what is handed down in the image, and what goes no further. Othila stands between where you come from and what you make of it.', 'If something old returns, it is not to pull you back, but perhaps to let you see what of it belongs in the life ahead.', 'The question it leaves you with: what have you inherited — and what of it will you choose to truly call your own?'],
      Dagaz: ['Dagaz is the moment night breaks into light, when a pale strip appears on the dark horizon. Nothing has changed in one great sweep, and yet the day is coming.', 'In a reading, look at what in the image passes into another state or shows its other side. Here the rune is the crossing itself: the old has passed, the new has not quite come.', 'It is not a light that solves everything. It can be much quieter: a question you have long asked yourself is suddenly no longer the same question.', 'It leaves you with a question: what has changed in you, so that the same world begins to look different?'],
      Blank: ['The Blank rune bears no sign, nothing to lean on. It is a pause in a story.', 'In a reading, look for what is happening in the image before you can say what it is. Here the rune does not speak; your own life does.', 'It decides nothing and foretells nothing. Rush to fill the gap, and you may hide what is just beginning to show.', 'One question remains: what in your life has no name yet — and can you leave it open a while?'],
    },
    // ── Dynamic banner strings — used via tp(), vars: {casts}, {casts_month}, {units}, {card}, {n}, {rune}, {bal}, {UNITS}
    // Rule §10: ALL user-visible strings here. tp() in logic files. Adding a language = add block here only.
    rs_banner_desc:     'You walk as <strong>Rune Seeker</strong> \u2014 {casts_month} to begin, all twenty-five runes open, R\u00fanar listening.<br><br>When it is drawn and the stones still have more to say, a {card} keeps the door open. One card. As many readings as you carry. No subscription, no expiry.',
    rs_credits_counter: '{units} remaining',
    voice_left:        'Rúnar can still read {casts} aloud this month.',   // 2026-10-11: menu pod jménem, předplatitel a tester (strop hlasu)
    rs_credits_desc:    'Your free rune reading is used. R\u00fanar will draw from your {units} from here on.',
    rs_exhausted_one:   'You have drawn your free rune reading. Keep the door open with a <b>{card}</b> \u2014 one card, no expiry, no subscription.',
    rs_exhausted_many:  'You have drawn all {n} of your free rune readings. Keep the door open with a <b>{card}</b> \u2014 one card, no expiry, no subscription.',
    err_rate_limited:   'Too many requests. Please wait a moment.',
    ask_lbl:            'Ask Rúnar about this reading',
    ask_placeholder:    'What caught your attention?',
    // 2026-09-08: ukazky, JAK se zeptat (handoff #55). Rotuji po ~3 s, viz _askPhStart.
    ask_h_rune:         'What does {rune} mean in this reading?',
    ask_h_runes:        'What do these runes mean together?',
    // 2026-09-25 (KUKY): výklad runy bez obrazu — Rúnar v něm „perfektně vysvětluje význam runy“.
    ask_h_explain:      'Explain {rune} without the image.',
    ask_h_explain_all:  'Explain these runes without the image.',
    ask_h_image:        'What is the image pointing to?',
    // 2026-10-03 (KUKY „ať u clearer image zůstane u stejného obrazu“; report 2026-10-01 u Thurisaz „dal mi jiný obraz“): „give me a
    // clearer image“ model četl jako NOVÝ obraz (3 ze 3 ownerových Asků). „make THIS image clearer“ = tentýž obraz, 3 ze 3 (sol 6).
    ask_h_image_area:   '{area} — can you make this image clearer?',
    ask_h_when_now:     'What in this has to do with right now?',
    ask_h_when_ahead:   'What in this has to do with the decision ahead?',
    ask_h_when_past:    'What in this has to do with the past?',
    ask_h_asked:        'How does this relate to what I asked?',
    ask_h_me:           'What is this reading telling me?',   // 2026-09-25 owner; bez vlastní otázky místo ask_h_asked · 2026-09-28 report KUKY: „co mi to říká“ zodpoví Rúnar snáz než „jak mě to ovlivňuje“
    ask_h_unseen:       'What am I not seeing here?',
    ask_h_seek_clarity: 'What is this making clearer?',
    ask_h_seek_challenge: 'Where does this get hard?',   // 2026-10-06 (KUKY „opravit“): dřív „…about the hard part?“ — sol vracel „the hard part“ 9/9; tohle 0/9, bez stálého začátku (docs/eval/2026-10-06-ask-otazky)
    ask_h_seek_reflect: 'What is this asking me to stay with?',
    ask_h_life_all:     'How does my life rune {life} affect this reading?',
    // 2026-10-06 (KUKY): u single se tip ptá na taženou runu jménem — sol bez ozvěny „drawn“ 0/6 (docs/eval/2026-10-06-ask-zivotni-runa)
    ask_h_life_rune:    'How does my life rune {life} affect {rune} in this reading?',
    ask_btn:            'ASK',
    ask_thinking:       'Rúnar listens…',
    ask_teaser:         'Your own questions to Rúnar open with {tier}.',   // 2026-09-25 KUKY (stavba jako q_teaser)
    ask_teaser_more:    'Another question opens with {tier}.',   // 2026-09-30 KUKY: po poslední otázce tarifu (Standard → Premium)
    err_no_credits:     'What you have left is not enough for this reading. Use a {card} to continue.',   // 2026-10-21: i když chybí jen na spread (proxy 402 no_credits)
    err_monthly_limit: 'What remains of this month’s readings is not enough for this one. They return with the new month.',   // 2026-10-21: proxy hlásí, když used + cena > strop
    renew_toast:       'Your readings have returned with the new month.',   // 2026-10-11: _renewalNotice (runar-app.js), dvojice s err_monthly_limit
    err_voice_month:   'The voice has spoken {n} times this month. It returns with the new month.',
    err_voice_quota:   'The voice is resting for now, but the words of the reading stay with you.',   // 2026-10-11: bezpečná hladina kvóty ElevenLabs (VOICE_SAFE_SHARE)
    err_generic:        'R\u00fanar is resting \u2014 please try again in a moment.',
    err_save_failed:    'Could not save \u2014 check your connection and try again.',
    // 2026-10-10 (DECISIONS 2026-10-10 (1) bod 1): návštěvník čtení nedostane (proxy ho odmítá od 2026-08-02) — texty mu ho už
    // neslibují. Pryč visitor_counter („1 rune reading remaining“) a visitor_exhausted; karta po tahu = visitor_join_*.
    visitor_desc:       'You walk here as a <strong>Visitor</strong>. Draw a rune and see which one comes to you.<br><br>Rúnar reads the runes for those who walk with him. Become a <strong>Rune Seeker</strong> — {onboarding} when you join.',
    // 2026-10-10 (KUKY: „runa thurisaz bez jakékoliv zprávy o tom, že nemůžu udělat jako visitor žádné čtení… přesměrování na rune
    // collection“): karta po tahu řekne napřímo, že čtení je pro Rune Seekery, a ukáže Safn rúna. Do té doby jen „Rúnar reads the runes
    // for those who walk with him“. Nadpis THE RUNE IS DRAWN pryč — karta má styl pruhu návštěvníka a ten nadpis nemá; runa stojí nad ní.
    visitor_join_note_pl: 'As a <strong>Visitor</strong>, you see which runes came to you. The reading itself is for <strong>Rune Seekers</strong> — {onboarding} when you join.<br><br>Meanwhile, the Runes Collection waits for you.',   // 2026-10-22 po výkladu (owner „5. ano“)
    visitor_join_note:  'As a <strong>Visitor</strong>, you see which rune came to you. The reading itself is for <strong>Rune Seekers</strong> — {onboarding} when you join.<br><br>Meanwhile, the Runes Collection waits for you.',
    redeem_ok_msg:      '\u2746 {units} added{rune} \u2014 balance: {bal}',
    redeem_toast_msg:   '\u2746 {UNITS} ADDED',
    redeem_card_code:   '\u16a0 ENTER {card} CODE',
    // 2026-10-09 (kontrola architektury, smoke \u3278): texty d\u0159\u00edv natvrdo v runar-auth.js / runar-tree.js \u2014 beze zm\u011bny zn\u011bn\u00ed.
    redeem_checking:      'Verifying code\u2026',
    redeem_err_not_found: 'Code not found.',
    redeem_err_used:      'This code has already been used.',
    redeem_err_signin:    'Please sign in first.',
    redeem_err_empty:     'Enter a code.',   // 2026-10-19: dřív natvrdo v runar-auth.js redeemCode (§10)
    redeem_err_session:   'Please sign in again.',
    redeem_err_rate:      'Too many attempts. Please wait 15 minutes.',
    life_need_units:      'You need {units}',
    life_need_credits:    'You need {units}. Get a {card}.',
    name_you:             'you',
    // 2026-10-10 (ráčna ㉸, DECISIONS 2026-10-10 (1) bod 5): texty dřív psané natvrdo v runar-app.js a runar-reading.js — znění
    // beze změny, jen jméno tieru a karty jde z TIERS / VOCAB ({tier}, {card}, §15).
    lock_become_rs:       '· Become a {tier} to unveil',
    lock_card_unveils:    '· {card} unveils all',
    atab_journal:         'JOURNAL',
    journal_gate_txt:     'You walk here as a <strong>Visitor</strong>.<br>The journal keeps every reading, so none is lost.<br>It opens when you become a <strong>Rune Seeker</strong> — free to join.',
    redeem_btn:           'REDEEM',
    auth_consent_txt:     'By continuing, you agree to our <a href="runar-privacy.html" target="_blank" rel="noopener">Privacy Policy</a>. We keep your readings and what you tell Rúnar, so he remembers them and his readings get better. No tracking, no ads.',   // 2026-10-10: „only what is needed“ zužovalo — ukládáme i pro rozbor kvality (zásady, oprávněný zájem); CODE-read (l)
    auth_modal_title:     "ENTER RÚNAR'S WORLD",
    auth_google_lbl:      'CONTINUE WITH GOOGLE',
    // 2026-10-19 (DECISIONS 2026-10-19 (8)): záložky bez znaků ✧ ✦ ◌ ◈ — kreslenou ikonu přidá _zalozka (runar-app.js).
    atab_reading:         'RUNE READING',
    atab_collection:      'RUNES COLLECTION',
    atab_tree:            'TREE OF LIFE',
    atab_liferune:        'LIFE RUNE',
    hero_eyebrow:         'THE RUNE KEEPER',
    voice_resting:        'The voice of Rúnar is resting — please try again in a moment.',
    shop_buy_more:      '\u2192 {card}',   // 2026-10-21: otevře okno cesty na kartě Rúnakort; „at Agndofa.is“ pryč — tam se nekupuje
    dam_text:           'This will permanently erase your account, all rune readings, and your journal. This cannot be undone.',
    tree_intro: '<p class="tree-intro-title">THE LIFE RUNE</p><p>It is said that no tree reaches toward the sky without first sending its roots into the darkness below.<br>So it is with us.</p><p>The runes are not here to tell you who you are.<br>They are here to help you remember.</p><p>Your Life Rune is the first step.<br>To discover it, begin where your story began.</p><p>When were you born?</p>',
    sign_in_btn:      'SIGN IN',
    name_modal_title: 'BEFORE THE RUNES SPEAK',
    name_modal_sub:   'The runes speak differently to those whose name they know.',
    name_modal_norse_lbl:  'YOUR NORSE NAME',
    name_modal_norse_hint: 'Your own, or one you choose. If Rúnar knows it, he will read what it carries.',
    name_modal_norse_ph:   'e.g. Sigrún, Einar',
    name_modal_name_lbl:   'YOUR NAME OR NICKNAME',
    name_modal_call_lbl:   'RÚNAR CALLS YOU BY',
    name_modal_call_norse: 'NORSE NAME',
    name_modal_call_name:  'NAME',
    sp_names_btn:          '✎ MY NAMES',
    sp_delete_account:     '× DELETE ACCOUNT',
    name_modal_skip:  'Continue without a name',
    name_modal_btn:   'LET THE RUNE READING BEGIN',
    name_modal_ph:    'Your name or nickname',
    shrine_audio_lbl: "\u266a RUNE READING",   // 2026-09-28 report KUKY: je to jen rune reading (drive RUNAR'S TEACHING)
    coll_rune_lbl:    '\u2726 HOW R\u00daNAR SEES THE RUNE',   // nadpis textu runy v Kolekci (KUKY 2026-09-24)
    invalid_date:     'INVALID DATE',
    language_lbl:       'LANGUAGE',
  },

  is: {
    // Header
    brand:   'RÚNAR KERFI',
    title:   'Þekkingarskrínn',
    sub:     'Kenndu Rúnari. Mótaðu rödd hans. Fóðraðu hann af visku.',

    // Tabs
    tab_teach:    'KENNA RÚNARI',
    tab_progress: 'FRAMVINDA',
    tab_correct:  'ORÐALEIÐRÉTTINGAR',
    progress_lbl: '♦ HLJÓÐFRAMVINDA',

    // Teach tab
    teach_select_lbl:   'ᚠ VELJA RÚNU',
    teach_select_note:  'Veldu rún. Rúnar mun tala beint til þess sem dregur hana — í núverandi tungumáli.',
    rune_none:          'Engin rúna valin.',
    teach_speak_lbl:    '✦ RÚNAR TALAR',
    invoke_btn:         '↯ LÁTUM RÚNAR TALA',
    runar_speaks:       'RÚNAR TALAR',
    teach_edit_lbl:     'BREYTA ÁÐUR EN VISTAÐ — BREYTINGAR GILDA BÆÐI FYRIR TEXTA OG RÖDD',
    teach_audio_lbl:    '♪ RÚNAR TALAR — FORSKOÐUN',
    teach_save_btn:     'VISTA RÖDD Í MINNI',
    teach_next_btn:     'ᚠ KENNA AÐRA RÚN',
    teach_voice_ready:  '✓ Rödd tilbúin. Hlustaðu, síðan vistaðu.',
    teach_voice_saving: 'Vista í minni…',

    // Reader tab
    reader_card1_lbl: 'ÁÐUR EN VIÐ BYRJUM',
    // 2026-10-27: ověřeno Greynirem a korpusem („finna rólegan stað“ 7, „kveikja á reykelsi“ 33, „vertu bara í“ 175, „hugsaðu um það“ 176,
    // „sem þú spyrð“ 367, „hugurinn kyrrist“ 6). Kalky z návrhu Gemini („í rólegu rými“, „þægilegum ilmi“ … 0×) nahrazeny.
    // 2026-10-28: „hugsaðu um það sem liggur þér á hjarta“ (korpus „liggur á hjarta“ 724, „liggur þér á“ 116, „þér á hjarta“ 111; Greynir čistý).
    ritual_text: 'Finndu rólegan stað áður en þú dregur. Kveiktu á kerti eða reykelsi ef þú vilt, eða vertu bara í þögn. Dragðu andann djúpt og hugsaðu um það sem liggur þér á hjarta. Þegar hugurinn kyrrist, dragðu rún.',
    player_listen: 'Hlustaðu á Rúnar',   // korpus „hlustaðu á“ 1709, Greynir čistý
    player_seek: 'Upptaka',              // holé podstatné jméno: „spóla í upptökunni“ korpusem nedoloženo (2026-10-29)
    reader_note:      'Segðu mér hvert ég á að líta. Rúnin talar sínu máli.',
    name_lbl:         'NAFNIÐ ÞITT EÐA GÆLUNAFN',
    name_ph:          'Hvað á ég að kalla þig?',
    reading_mode_mine:    'MÍN SPÁ',
    reading_mode_someone: 'FYRIR AÐRA',
    sign_out:             'SKRÁ ÚT',
    auth_or:              'eða',
    auth_modal_sub_google: 'Það þarf ekkert lykilorð — haltu áfram með Google.',   // 2026-10-10: „Ekkert lykilorð þarf“ korpus 0×
    // 2026-10-09: kód místo odkazu. Korpus (Risamálheild): „sex stafa“ 116 · „kóða í tölvupósti“ 10 · „var sendur á“ 1430 ·
    // „inn kóðann“ 130 · „sláðu inn“ 432 · „annað netfang“ 80 · „virkaði ekki“ 9918 · „biðja um nýjan“ 58 · „enn í prófun“ 13 ·
    // „ekki á listanum“ 1460 · „of margar tilraunir“ 11 · „bíddu aðeins“ 671 · „hér fyrir ofan“ 15011 · „ganga inn“ 8694.
    auth_modal_sub_code:  'Það þarf ekkert lykilorð — þú færð kóða í tölvupósti.',   // 2026-10-10 bez „sex stafa“: kód má 8 číslic
    auth_email_lbl:       'NETFANGIÐ ÞITT',
    auth_email_ph:        'nafn@dæmi.is',   // 2026-10-12: vzor příkladové adresy (jméno@příklad.is); „dæmi“ korpus 388 353
    auth_code_send:       'SENDA KÓÐA',
    auth_code_sent:       'Kóði var sendur á {email}. Sláðu inn kóðann hér.',
    auth_code_lbl:        'KÓÐINN',
    auth_code_enter:      'GANGA INN',
    auth_code_back:       'Nota annað netfang',
    auth_code_bad:        'Kóðinn virkaði ekki. Athugaðu hann eða biddu um nýjan.',
    auth_closed_test:     'Rúnar er enn í prófun. Þetta netfang er ekki á listanum.',
    auth_email_need:      'Sláðu inn netfangið þitt.',
    auth_sending:         'Sendi…',
    auth_checking:        'Athuga kóða…',
    auth_signing_in:      'AUGNABLIK…',   // „augnablik“ korpus 16690; „skrái þig inn“ 0
    auth_rate:            'Of margar tilraunir — bíddu aðeins eða notaðu Google hér fyrir ofan.',
    // korpus: „er á leiðinni“ 14448 · „nýjan kóða“ 15 · „má biðja um“ 76 · „eftir mínútu“ 189 · „kóðinn er á“ 12
    auth_code_wait:       'Kóðinn er á leiðinni. Nýjan kóða má biðja um eftir mínútu.',
    // 2026-10-22: Greynir čisté (4 věty); korpus „innskráning tókst“ 5 · „tókst að senda“ 119 · „aftur eftir smástund“ 45 · „náðist samband
    // við“ 324 · „nettenginguna“ 380 · „er útrunnin“ 211 · „skráðu þig inn“ 104
    auth_failed:          'Innskráning tókst ekki. Reyndu aftur eða skrifaðu á runar@therunekeeper.com.',
    auth_send_failed:     'Ekki tókst að senda kóðann. Reyndu aftur eftir smástund eða skrifaðu á runar@therunekeeper.com.',
    auth_offline:         'Ekki náðist samband við Rúnar. Athugaðu nettenginguna og reyndu aftur.',
    auth_expired:         'Innskráningin þín er útrunnin. Skráðu þig inn aftur.',
    q_teaser:             'Dýpri spurningar opnast með {tier}.',
    journal_teaser:       'Allir þínir eigin lestrar eru geymdir. Farðu yfir í {tier} til að opna alla dagbókina þína.',   // 2026-10-10: jen vlastní čtení; „taka lestur“ byl kalk, krónika navíc s chybou v pravopisu
    journal_teaser_count: 'Allir þínir eigin lestrar eru geymdir — {count} samtals. Farðu yfir í <strong style="color:var(--gold);font-style:normal;">{tier}</strong> til að opna alla dagbókina þína.',   // {tier} ve 4. pádě (tierLabel)
    tree_growth_quote:    '<em>"Tréð vex ekki milli heimsókna.<br>Það vex í gegnum þær — hægt,<br>eins og bjarkarrætur finna vatn undir steini.<br>Sérhver rún sem þú dregur er þegar hér.<br>Komdu aftur. Tréð man."</em>',
    setup_someone_note:   'Sláðu inn nafn þess sem þú ert að spá fyrir. Þessi spá fer ekki í dagbókina þína.',
    setup_for_name_lbl:   'NAFN',
    setup_for_name_ph:    'Nafn eða gælunafn',
    day_ph:           'Dagur',
    month_ph:         'Mánuður',
    area_lbl:         'SVIÐ LÍFSINS',
    area_hint:        'Sviðið segir Rúnari hvar í lífi þínu myndin á að lenda.',   // 2026-10-12 vráceno (viz EN), znění z 2026-09-29
    seek_hint:        'Þetta ræður tóninum.',
    intention_hint:   'Þetta ræður því um hvaða tíma lesturinn talar og á aðeins við um eina rún.',   // 2026-10-16: Greynir OK; věta o lagnir pryč (owner: stačí jen „for a single rune only“)
    seek_lbl:         'HVAÐ ERTU AÐ LEITA AÐ?',
    intention_lbl:    'ÞESSI LESTUR ER FYRIR',
    report_btn:       'Tilkynna athugasemd',
    sp_gender_lbl:    'Hvernig Rúnar ávarpar þig',
    report_title:     'Tilkynning',
    report_who:       'Hver ert þú?',
    report_who_ph:    'Nafn eða upphafsstafir',
    report_who_save:  'Vista',
    report_flagging:  'Tilkynni:',
    opus_toggle:      'Lestur með Opus 5 (prófun)',
    img_pin_lbl:      'Mynd fyrir þessa rún (prófun)',
    img_pin_random:   'valin af handahófi',
    img_pin_vyz_auto: 'merkingarnar skiptast á',
    img_pin_title:    'Sama myndin gildir um þessa rún þar til þú velur aðra.',
    img_pin_cold:     'að vetri',
    img_pin_bright:   'frá vori til hausts',
    img_pin_offseason: 'ekki á þessum árstíma',
    report_type:      'Tegund',
    report_t_replace: 'Skipta út texta',
    report_t_rephrase:'Umorða',
    report_t_pattern: 'Endurtekið orðalag',
    report_t_visual:  'Útlit / sjónrænt',
    report_t_crash:   'Villa / hrun',
    report_t_other:   'Annað',
    report_t_keep:    '✦ Geyma þetta',
    report_t_grammar: 'Málfræði',      // 2026-10-09; korpus „málfræði“ 5813
    report_t_wrongword: 'Rangt orð',   // 2026-10-09; korpus „rangt orð“ 122
    report_msg:       'Hvað er að?',
    report_msg_ph:    'Stutt athugasemd',
    report_repl_lbl:  'Réttur texti',
    report_repl_ph:   'Hvernig það ætti að vera',
    report_send:      'Senda',
    report_cancel:    'Hætta við',
    report_saved:     'Vistað — sendist þegar þú ert með nettengingu',
    report_sent:      'Sent',
    report_need_type: 'Veldu tegund fyrst',
    q_lbl:            'STAÐAN',
    // Overeno: „hvar þú stendur" 302 vyskytu, „hvað verður" 13915 (Risamalheild);
    // GreynirCorrect 0 flagu. Vymysleno islandsky, ne prelozeno (§2).
    q_hint:           'Segðu Rúnari hvar þú stendur núna, ekki hvað verður.',
    // 2026-10-13 viz EN. Greynir a is-gpt-check bez nálezu; „Ekki skrifa neitt…“ Greynir četl jako sloveso bez podmětu, „skrifaðu ekkert“ 0×.
    qpriv_hint:       'Skrifaðu ekki neitt um heilsu þína hér.',
    // 2026-10-12 krok 2 souhlasu, viz EN. Greynir u qconsent_lbl hlásí pád „spurningar mínar“ — falešně, „samþykki“ bere jako
    // podstatné jméno; korpus „ég samþykki að“ 93×, is-gpt-check 0 nálezů. „haka við“ (hakað við 996×), ne „haka í“ (0×).
    qconsent_lbl:     'Ég samþykki að spurningar mínar séu sendar til gervigreindar OpenAI í Bandaríkjunum sem semur lestrana, líka ef ég skrifa um heilsu mína eða annað viðkvæmt. Ég samþykki líka að þær séu geymdar í dagbókinni minni þegar lesturinn er minn. Ég er 13 ára eða eldri.',
    qconsent_need:    'Spurningin er aðeins send með samþykki þínu. Hakaðu við reitinn. Til að halda áfram án spurningar skaltu eyða henni.',
    qconsent_need_ask: 'Spurningin er aðeins send með samþykki þínu. Hakaðu við reitinn til að senda hana.',
    qconsent_saved:   'Samþykki þitt hefur verið vistað.',
    qconsent_withdrawn: 'Samþykkið er dregið til baka. Spurningar þínar verða ekki sendar.',
    sp_qconsent_lbl:  'Senda spurningar mínar með lestrunum',
    q_ph:             'T.d. Ég er að ákveða hvort ég eigi að taka að mér meiri vinnu',
    q_placeholders:   ['Ég fresta stöðugt samtali sem ég þarf að eiga.',
                       'Eitthvað í sambandinu er ekki í jafnvægi og ég veit ekki af hverju.',
                       'Ég stend á krossgötum milli þess að vera og fara.',
                       'Ég finn ekki lengur tenginguna við það sem skipti mig máli áður.',
                       'Ég á eftir að taka ákvörðun um fjölskylduna mína.',
                       'Ég veit ekki hvort ég treysti mér í breytinguna sem er í vændum.',
                       'Ég hef forðast að horfa almennilega á það hvar ég stend núna.',
                       'Ég er að ákveða hvort ég eigi að taka að mér meiri vinnu.'],
    // Vymysleno islandsky, ne prelozeno (§2). Overeno: 'til umhugsunar' 10432 vyskytu,
    // 'faglega ráðgjöf' 626 (Risamalheild 2000-2021); GreynirCorrect 0 priznaku.
    // 2026-10-19: viz EN. Greynir bez nálezu; korpus „er gervigreind“ 78×, „eru fornar“ 63×, „verða til ný“ 197×, „orð hans verða“ 14×.
    // 2026-10-22 (CODE-read): Greynir OK (s čárkou „…umhugsunar, ekki fagleg ráðgjöf“ P_NT_SvigaInnihaldNl → „en ekki“); korpus
    // „til umhugsunar“ 10 432×, „umhugsunar en ekki“ 11×, „fagleg ráðgjöf“ 72×.
    ai_note:          'Rúnar er gervigreind. Lestrar hans eru til umhugsunar en ekki fagleg ráðgjöf.',
    opt:              '(VALKVÆTT)',
    begin_btn:        'HEFJA LESTURINN',
    draw_lbl:         'ᚠ DRAGÐU RÚNINA ÞÍNA',
    random_btn:       'ᚲ LÁTTU RÚNIRNAR VELJA',
    speak_btn:        'HEYRA RÚNAR TALA',
    begin_btn_visitor: 'DRAGA RÚN',          // 2026-10-10: viz EN; „draga rún“ korpus 4× (jako DRAGA AÐRA RÚN)
    speak_btn_visitor: 'DRAGA ÞESSA RÚN',    // 2026-10-10: „draga þessa“ 928×, „þessa rún“ 6×
    speak_btn_add:    'BÆTA VIÐ RÚNU',
    speak_btn_draw:   'DRAGÐU RÚNIRNAR',
    // 2026-10-11 okno přepnutí jazyka (viz EN): psáno islandsky, ne překladem — „upp á nýtt“ místo „fresh reading of the same rune“;
    // greynir + is-gpt-check bez nálezu, korpus: „tali aftur“ 21, „aftur á ensku“ 83, „tala á ensku“ 114, „vera áfram á“ 1974, „upp á nýtt“ 25320.
    lang_in_en:       'ensku',
    lang_in_is:       'íslensku',
    lsm_title:        'VILTU AÐ RÚNAR TALI AFTUR Á {language}?',
    lsm_body:         'Á {language} les Rúnar rúnina upp á nýtt. Þetta er ekki þýðing heldur nýr lestur, og hann kostar {casts}.',
    lsm_confirm:      'JÁ — TALA Á {language}',
    lsm_cancel:       'VERA ÁFRAM Á {language}',
    spread_cost:      'Þessi lestur kostar {casts}.',   // 2026-09-29 viz EN; is-grammar-qa čisté (spá/spár = 4. pád)
    life_rune_lbl:    'LÍFSRÚNIN ÞÍN',
    badge_life_note:  'lífsrúnin þín',
    layer1_lbl:       '✦ RÚNAR TALAR',
    layer2_lbl:       '~ DÝPRI HUGLEIÐING',
    start_over:       'BYRJA AFTUR',

    // Voice
    voice_btn:         'ᚢ HEYRA RÚNAR TALA',
    voice_btn_loading: 'ᚢ RÚNAR TALAR…',
    voice_btn_regen:   'ᚢ ENDURGERA RÖDD',
    voice_btn_done:    '♪ RÚNAR HEFUR TALAÐ',
    voice_player_lbl:  'RÚNAR TALAR',

    // Ritual names — change here, reflects everywhere
    spread3_mode_single:      "EIN RÚN",
    spread_mode_norns:        "NORNIR",
    spread_mode_kriz:         "ÁTTAVITI",
    spread_mode_horseshoe:    "SKEIFA",
    spread_mode_yggdrasil:    "YGGDRASIL",
    tree_name_ph:             "Nafn sem aðeins þú þekkir...",
    redeem_ph:                "T.d. FEHU-7K3M-P9QX",
    jf_all_runes:             "Allar rúnir",
    jf_all_areas:             "Öll svið",
    jf_spreads:               "✦ Lagnir",
    slot_remove_hint:         "smelltu til að fjarlægja",

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

    // Status messages
    st_traversing:   'Rúnar fer um heimana…',
    st_spoken:       '✓ Rúnar hefur talað.',
    st_saving:       'Vistandi…',
    st_saved:        '✓ Vistað.',
    st_saved_local:  '✓ Vistað staðbundið.',
    st_fill_fields:  'Fylltu í bæði svæðin.',
    // ── Reader UI (added refactor #6) ──────────────────────
    dam_title:          'EY\u00d0A REIKNINGI?',
    delete_btn:         'EY\u00d0A',
    cancel_btn:         'H\u00c6TTA VI\u00d0',
    deleting_btn:       'EY\u00d0IR...',
    journal_title:      'SP\u00c1R \u00de\u00cdNAR',
    journal_count_recent: 'síðustu {n}',   // 2026-10-10: dřív kalk z „last N“ (tvar v check-is.py BAD_PATTERNS, korpus 2×); „síðustu fimm“ 13 235×
    journal_empty:      'Engar skr\u00e1\u00f0ar sp\u00e1r enn.<br>Dragðu fyrstu r\u00fanina þ\u00edna.',
    profile_load_err:   'Ekki tókst að sækja upplýsingarnar þínar — athugaðu nettenginguna og reyndu aftur.',   // 2026-10-12: greynir, korpus („sækja upplýsingarnar“ 44), is-gpt-check OK
    profile_retry_btn:  'REYNDU AFTUR',   // „Reyna aftur.“ greynir nerozebral (E001); „reyndu aftur“ korpus 370
    journal_load_err:   'Ekki tókst að sækja spárnar þínar — athugaðu nettenginguna og reyndu aftur.',   // 2026-10-10: vzor err_save_failed; korpus viz runar-journal.js
    life_rune_short:    'L\u00edfsr\u00fan',
    jcard_voice_btn:    'ᚢ HLUSTA Á LESTURINN',   // 2026-10-11: greynir + gpt-check OK, korpus „hlusta á lesturinn“ 17×
    gift_card_btn:      '+ {card}',
    become_rs_btn:      'GERAST LEITANDI \u2192',
    install_title:      'SETJA INN R\u00daNAR',
    got_it_btn:         'SKILI\u00d0',
    install_body_ios:   'Í Safari: ýttu á <strong>Deila</strong> táknið (□↑) neðst á skjánum, veldu síðan <strong>Bæta við heimaskjá</strong> og ýttu á <strong>Bæta við</strong>.',   // 2026-10-10: viz EN; znění beze změny
    install_body_other: 'Í Chrome eða Brave: ýttu á <strong>⋮ valmynd</strong> efst til hægri og veldu <strong>Setja upp forrit</strong> eða <strong>Bæta við heimaskjá</strong>.',
    sw_update:          'Ný útgáfa af Rúnari er komin. Ýttu hér til að endurhlaða síðuna.',   // 2026-10-22: Greynir čisté; „ýttu hér“ 20, „útgáfa er komin“ 11, „endurhlaða síðuna“ 43 (Risamálheild)
    sp_guide_link:      '? LEI\u00d0BEININGAR & SPURNINGAR',
    sp_higher_path:     'TAKTU FERÐINA LENGRA',   // 2026-09-29 viz EN; obrat „taka X lengra“ (korpus 158×), dřív FERÐIN HANDAN
    sp_install_btn:     '\u2b07 SETJA INN R\u00daNAR',
    sp_privacy_link:    'PERS\u00d3NUVERNDARSTEFNA',
    // 2026-10-15 „Sendu Rúnari línu“ — IS ověřeno Greynirem a korpusem (čísla v popisu commitu)
    line_menu:          '✉ SENDU RÚNARI LÍNU',
    line_menu_visitor:  '✉ SKRIFAÐU Á runar@therunekeeper.com',
    sp_menu_title:      'VALMYND',   // korpus „valmynd“ 475×
    sp_instagram:       'INSTAGRAM',
    line_title:         'SENDU RÚNARI LÍNU',
    line_sub:           'Skrifaðu það sem þér liggur á hjarta. Þú færð svarið í tölvupósti.',
    line_ph:            'Hvað gerðist, eða hvað viltu segja?',
    line_note:          'Útgáfa appsins og tækið þitt fylgja með, svo að við getum hjálpað.',
    line_send:          'SENDA',
    line_sent:          'Línan þín er á leiðinni.',
    line_err:           'Línan komst ekki til skila. Reyndu aftur eftir smástund.',
    line_limit:         'Þú sendir nokkrar línur rétt áðan. Reyndu aftur eftir klukkustund.',
    line_empty:         'Skrifaðu eitthvað fyrst.',
    sp_privacy_settings_lbl: 'PERS\u00d3NUVERND',
    optout_label: 'Hj\u00e1lpa til vi\u00f0 a\u00f0 b\u00e6ta R\u00fanar me\u00f0 lestrunum m\u00ednum',
    optout_saved_on: 'Takk \u2014 lestrarnir \u00fe\u00ednir hj\u00e1lpa til vi\u00f0 a\u00f0 b\u00e6ta R\u00fanar',
    optout_saved_off: '\u00cd lagi \u2014 lestrarnir \u00fe\u00ednir ver\u00f0a ekki nota\u00f0ir til greiningar',
    optout_err: 'Ekki t\u00f3kst a\u00f0 vista \u2014 reyndu aftur',
    tcm_title: '\u00de\u00da ERT PR\u00d3FARI FYRIR R\u00daNAR',
    tcm_body: 'Til að hjálpa okkur að bæta lestrana geymum við lestrana sem þú dregur og förum yfir texta þeirra og upplýsingarnar sem þú slærð inn. Til að lestur verði til eru upplýsingarnar sem þú slærð inn sendar til OpenAI, sem semur hann. Ef OpenAI svarar ekki fara þær til Anthropic. Texti lestursins fer til ElevenLabs sem ljær honum rödd. Öll þessi fyrirtæki eru í Bandaríkjunum. Hvorki OpenAI né Anthropic notar þær til að þjálfa gervigreind sína, og hvort um sig geymir þær ekki lengur en í 30 daga til að fylgjast með misnotkun. Það sem við geymum er geymt innan EES, við seljum það aldrei, og þú getur beðið um að því verði eytt hvenær sem er. Þú getur hætt að prófa hvenær sem þér hentar.',
    tcm_agree: '\u00c9g sam\u00feykki',
    tree_visitor_dob:   'Lífsrúnin þín er skrifuð í daginn sem þú fæddist. Sláðu inn fæðingardaginn og sjáðu hvaða rún þú berð.',
    tree_visitor_read:  'Skráðu þig til að lesa hvað þessi rún ber.',
    // IS vymyšleno islandsky, ne přeloženo; is-grammar-qa čisté, korpus: komst í heiminn 158, hálfa mánuði 157, sólin var í 19, úr fornöld 223.
    tree_lr_origin:     'Árið snýst í gegnum tuttugu og fjóra hálfa mánuði, ein rún fyrir hvern. Lífsrúnin þín er sú sem sólin var í daginn sem þú komst í heiminn. Rúnirnar eru fornar, en þessi skipting ársins er það ekki. Hún er ný, ekki arfur úr fornöld.',
    name_lore_lbl:      'NORRÆNA NAFNIÐ ÞITT',
    name_lore_intro_add: 'Lífsrúnin þín kemur frá deginum sem þú fæddist. Nafnið er annar þráður — gefðu Rúnari norræna nafnið þitt, þitt eigið eða nafn sem þú velur þér, og hann les hvað það ber.',
    name_lore_add_btn:  'Gefðu Rúnari norræna nafnið þitt',
    name_lore_limit:    'Rúnar hefur þegar lesið þau nöfn sem þú gafst honum.',
    tree_admin_reset:      'ENDURSTILLA LÍFSRÚN (ADMIN)',
    tree_admin_reset_done: 'Lífsrún endurstillt.',
    name_lore_btn:      'Hvað ber nafnið mitt?',
    name_no_norse:      'Rúnar sér enga norræna rót í þessu nafni.',
    name_known_untraced: 'Rúnar þekkir þetta nafn, en hefur ekki rakið rætur þess.',
    name_no_norse_from: 'Rúnar sér enga norræna rót í þessu nafni — það á rætur að rekja til {origin}.',
    name_lore_intro:    'Lífsrúnin þín kemur frá deginum sem þú fæddist. Nafnið er annar þráður — Rúnar getur litið á það, og segir hreint út ef það ber ekkert norrænt.',
    tree_rs_teaser:     'Þessi rúna er rótin undir öllu sem þú ert — hún hefur verið þín frá fæðingu. Rúnar les enga framtíð úr henni; hann hjálpar þér að muna hana.',
    life_rune_free:   'Fr\u00edtt',
    tree_rs_balance:    'spár:',
    tree_rs_free_line:  '{casts} fyrir venjulegar dregnar rúnir',   // 2026-10-10: viz EN; znění beze změny
    tree_carry_life_rune: 'Þú ber lífsrún {rune}',   // 2026-10-10: viz EN; znění beze změny
    tree_name_label:    'NAFN TRÉSINS ÞÍNS',
    tree_hist_all:      'allt tréð · {casts}',
    tree_hist_at:       '{k}. spá af {n}',
    tree_hist_seed:     'upphaf trésins',
    tree_insp_hint:     'pikkaðu á grein til að skoða hana',
    tree_insp_count:    '{casts} í þessu þema',
    tree_insp_rank:     'röðun rúna:',
    tree_export_btn:    'AFRITA STÖÐU TRÉSINS',
    tree_zoom_in:       'þysja inn',
    tree_zoom_out:      'þysja út',
    tree_zoom_all:      'allt tréð',
    tree_step_prev:     'fyrri spá',
    tree_step_next:     'næsta spá',
    tree_export_ok:     'afritað · {casts} · {kb} kB — límdu það til Claude',
    tree_export_fail:   'afritun mistókst — veldu textann hér að neðan',
    tree_named_label:   'TRÉÐ ÞITT',
    tree_name_edit:     'breyta',
    tree_name_err:      'Ekki tókst að vista',
    save_btn:           'VISTA',
    tree_read_btn:      'Lesa hvað hún ber',
    // 2026-10-06: viz EN blok. IS myšleno islandsky; is-grammar-qa čisté; „spá fyrir um“ (korpus 8477, „spá um örlög“ 0),
    // „þegar þér hentar“ místo „tilbúinn“ (jen mužský rod), „í smástund“ místo nerozparsovaného „andartak“, pozdrav jako celá věta.
    hero_phrases: [
      'Steinarnir liggja hér. Gefðu þér tíma, þeir fara hvergi.',
      'Lokaðu augunum í smástund og dragðu svo. Hvaða rún sem kemur upp, þá skoðum við hana saman.',
      'Ég hef lengi setið yfir þessum steinum. Þeir segja mér ekki hver þú ert, en þeir hjálpa þér að horfa.',
      'Eitthvað leiddi þig hingað í dag. Dragðu, og við sjáum hvað það vekur.',
      'Rúnin sem þú dregur er sjaldan sú sem þú bjóst við. Þetta er einmitt málið.',
      'Andaðu áður en þú dregur. Steinarnir lesa kyrrð jafn vel og spurningar.',
      'Ég hef séð leitendur koma — í myrkri, í efa, undir fullu tungli. Rúnirnar taka á móti öllu. Dragðu.',
      'Spurningin þarf ekki að vera skýr. Stundum sýnir lesturinn þér um hvað þú varst að spyrja.',
      'Suma daga talar steinninn hátt. Aðra daga hvíslar hann. En hann talar alltaf.',
      'Rún ákveður ekkert. Hún gefur þér eitthvað til að horfa á og ákvörðunin er þín.',
      'Hvað sem þú berð með þér — settu það niður. Lesturinn hefst hér.',
      'Dragðu þegar þér hentar. Engin stund er röng, aðeins sú sem þú velur.',
    ],
    hero_quote:         '"Rúnirnar spá ekki fyrir um örlög þín.<br>Þær minna þig á veginn<br>sem þú gengur nú þegar."',
    hero_down_aria:     'Niður að lestrinum',   // 2026-10-09: „niður að“ + þgf. (korpus „niður að“ 26 390, „að lestrinum“ 127); jen pro čtečku
    hero_up_aria:       'Aftur upp til Rúnars', // 2026-10-09: korpus „aftur upp“ 20 637, „til Rúnars“ 155 (til + ef.)
    greet_hello:        'Það er gaman að sjá þig.',
    greet_again:        'Það er gaman að sjá þig aftur.',
    tree_reveal_btn:    'OPINBERA L\u00cdFSR\u00daNUNA',
    tester_suffix:        '(pr\u00f3fari)',
    tier_soon:            '\u2014 br\u00e1\u00f0lega',
    // 2026-10-19: okno „Ferð þín með Rúnari“ — viz EN. Ověřila CODE-read: Greynir OK; korpus „ferð þín“ 73×, „hvert skref“ 927×,
    // „þegar þér hentar“ 469×, „snúðu við“ 64×, „krónur á mánuði“ 20 557×, „að gjöf“ 11 864×, „í lok tímabilsins“ 3 754×,
    // „á sama aðgangi“ 13×, „svo heldurðu“ 58×, „hvar þú stendur“ 302×, „ber í sér“ 339×, „sagt upp hvenær“ 14×. GERAST {tier} = 1. pád.
    journey_title:        'GAKKTU MEÐ RÚNARI',   // 2026-10-20 CODE-read: rozkaz jako „Gakktu inn í heim Rúnars“ v okně přihlášení; „gakktu með“ 29×
    journey_sub:          'Með hverju skrefi færðu fleiri {casts}. Farðu eins langt og þú vilt og snúðu við þegar þér hentar.',   // 2026-10-20 CODE-read: Greynir OK, „með hverju skrefi“ 335×, „færðu fleiri“ 112×
    journey_monthly:      'MÁNAÐARLEGA',
    journey_yearly:       'ÁRLEGA',
    journey_price_m:      '{price} kr. á mánuði',
    journey_price_y:      '{year} kr. á ári',
    journey_price_y_mesic: '({price} kr. á mánuði)',
    journey_gift:         'Tveir mánuðir að gjöf.',
    journey_here:         'þú ert hér',
    journey_walk_on:      'GERAST {tier}',
    journey_step_back:    'GERAST {tier}',
    journey_step_note:    'Breytingin tekur gildi í lok tímabilsins.',
    journey_manage:       'ÁSKRIFTIN ÞÍN',
    journey_web_note:     'Vefurinn therunekeeper.com opnast. Svo heldurðu áfram hér á sama aðgangi.',
    journey_free:         'Ókeypis',
    journey_free_join:    'Skráning er ókeypis',   // 2026-10-20: štítek bez tečky jako „Ókeypis“
    // 2026-10-21: {card} = VOCAB.card.is_dat („með Rúnakorti“). Greynir OK (i s „gjafakorti“), „með gjafakorti“ 37×, „verð frá“ 947×,
    // „kostar frá“ 1396× (cena „frá … kr.“).
    journey_seeker_card:  '{casts} með {card}, frá {price} kr.',
    journey_card_note:    'Áttu kóða? Sláðu hann inn hér.',
    journey_play_sub:     'Hvar þú stendur á leiðinni og hvað hvert skref ber í sér.',
    journey_play_foot:    'Hér biður Rúnar þig ekki um neitt.',
    journey_foot:         'Verð í íslenskum krónum. Þú getur sagt upp hvenær sem er.',
    journey_visitor_ft:   'Safn rúna og lífsrúnin þín.',
    tester_reset_btn:     'ENDURSTILLA TR\u00c9 (PR\u00d3FUN)',
    tester_reset_confirm: 'Endurstilla tr\u00e9\u00f0 \u00feitt \u2014 l\u00edfsr\u00fan, f\u00e6\u00f0ingardag og r\u00f3tfestingu? \u00deetta er til pr\u00f3funar.',
    tester_reset_done:    'Tr\u00e9\u00f0 endurstillt. Byrja\u00f0u aftur.',
    tree_founding_reading_lbl: 'Nornirnar sem festu rætur trésins',
    founding_story_lbl:  '\u2726 RÆTURNAR',
    founding_story_text: 'Nú koma ræturnar. Þrjár rúnir fyrir þrjár sem sitja við brunninn undir trénu: Urður, sem geymir það sem var. Verðandi, sem geymir það sem er að verða. Skuld, sem geymir það sem á eftir að koma. Dragðu þær, og tréð er þitt. Hver rún sem þú dregur eftir þessa lætur það vaxa.',
    tree_founding_intro: 'Nú er lífsrúnin þín fræið sem tréð þitt vex upp af. Næst koma nornirnar þrjár — Urður, Verðandi og Skuld — og það festir rætur. Frítt, og aðeins í rituðu máli.',
    founding_cost:       'Frítt, og aðeins í rituðu máli.',   // = ověřený konec tree_founding_intro
    tree_need_rune:      'Hvert tré byrjar sem fræ í moldinni. Fræ trésins þíns er lífsrúnin — rúnin sem hefur fylgt þér frá fæðingu. Láttu Rúnar lesa hana fyrst; upp af henni vex tréð þitt.',
    lr_plant_intro:      'Lífsrúnin þín er meira en tákn — hún er fræ. Upp af henni getur tréð þitt vaxið.',
    tree_founding_btn:   'FESTA RÆTUR TRÉSINS',
    tree_founding_toast: 'Dragðu þrjár rúnir fyrir nornirnar.',
    tree_reveal_intro:  '\u00c1\u00f0ur en r\u00fanarnar tala um daginn \u2014 vill R\u00fanar opinbera r\u00fanina sem þ\u00fa hefur bori\u00f0 fr\u00e1 fæ\u00f0ingu?',
    reading_loading:    'STEINARNIR TALA \u00cd \u00dE\u00d6GNINNI\u2026',
    reading_error:      'Villa vi\u00f0 sp\u00e1.',
    // Hesla zrcadla + helper — viz en blok (IS psano nativne, korpus + is-grammar-qa 2026-09-22).
    motto_image:        'Rúnar talar í myndum — rúnin býr í myndinni.',
    // 2026-09-23: pryc „sjálfur" (muzsky tvar — u zen nesedel; nasel rozbor reportu). Beze slova, ktere nese rod.
    motto_mirror:       'Myndin er spegill. Það sem þú leitar að, finnur þú í honum.',
    motto_paths:        'Rúnar segir þér ekki hvað þú átt að gera. Hann bendir á möguleika.',
    helper_btn:         'Hjálp við lesturinn',
    helper_guide:       'Smelltu hér til að sjá hvernig lestur verður til.',
    helper_glyph:       'Snertu rúnina — hún segir nafn sitt og merkingu.',
    helper_ask:         'Smelltu hér, þá opnast tillögur að spurningum.',
    helper_ask2:        'Spurðu hvernig myndin snertir spurningu þína.',
    coll_no_audio:      'Engin hljóðupptaka til.',
    coll_audio_missing: 'Hljóðskrá vantar.',
    // 2026-10-10: „dragðu eina“ → „veldu eina“ (korpus 0× / 16×) — v Safn rúna se runa vybírá, netáhne.
    vcn_text:           'Þú ert hér <strong>Gestur</strong>. Fimm rúnir bíða þín — veldu eina og hlustaðu á fornu steinana.<br><br>Viljir þú allar tuttugu og fimm rúnirnar, og lestur sem á aðeins við þig, gerðu þig að <strong>Leitanda</strong>. Skráning er ókeypis.',
    // 2026-10-12: navazuje na vcn_text („Fimm rúnir bíða þín“); greynir OK, korpus „skráðu þig inn“ 104 · „þá bíða þín“ 11.
    // „Where to start“ (2026-10-11): psáno islandsky, greynir + gpt-check bez nálezu; korpus „tala í gegnum“ 207 · „í gegnum myndir“ 187 ·
    // „svara ekki beint“ 8 · „í henni býr“ 411 · „taka eftir þegar“ 73 · „kemur til þín“ 454. „Opna Safn rúna“ greynir četl jako sloveso
    // „rúna“ → rozkaz „Opnaðu“, tak jako v EN.
    wts_title:          'HVAR Á AÐ BYRJA?',
    wts_l1:             'Ég svara ekki beint, ég tala í gegnum myndir. Hver lestur er mynd og í henni býr rún.',
    wts_l2:             'Byrjaðu í Safni rúna. Undir hverri rún segi ég þér hvernig ég sé hana og hverju þú skalt taka eftir þegar hún kemur til þín.',
    wts_note:           'Þetta finnurðu aftur þar sem stendur „{guide}“.',
    wts_open:           'OPNAÐU SAFN RÚNA',
    wts_later:          'SEINNA',
    guide_title:        'Hvernig lestur verður til',
    // 2026-09-29 viz EN; psáno islandsky, is-grammar-qa čisté.
    // 2026-10-30 viz EN (Rúnar v 1. osobě). Greynir čisté; korpus: „hluta lífs þíns“ 24 · „á að líta“ 3860 · „hvað þú leitar“ 9 ·
    // „til hvaða tíma“ 33 („hvar/hvert í tímanum“ 0 → pryč) · „lætur það vera“ 112 · „leiðir þig“ 430 · „gefa rödd“ 22 · „ber ljósið“ 7.
    // „leiðir rúnin þig sjálf“ zkráceno na „leiðir rúnin þig“: „sjálf“ šlo číst jako „ty sama“ i „runa sama“.
    guide_lines:        ['Þú kemur með spurninguna. Svo sýnirðu mér hvar hún á heima, þann hluta lífs þíns sem ég á að líta til.',
                         'Segðu mér hvað þú leitar að. Þá veit ég hvernig ég á að tala.',
                         'Segðu mér hver tilgangur lestursins er. Þá veit ég til hvaða tíma ég á að líta.',
                         'Þú þarft ekki að velja neitt af þessu. Ef þú lætur það vera opið leiðir rúnin þig.',
                         'Rúnin opnar nýtt sjónarhorn á spurninguna, leið til að horfa sem þú hefðir kannski ekki valið.',   // 2026-09-29 viz EN („hana“ bez předchůdce)
                         'Ég gef rúninni rödd. Hún talar í gegnum mynd af stað eða andartaki, af einhverju sem gerist úti í náttúrunni eða við eldhúsborðið. Rún rúmar meira en eitt orð.',
                         'Merkinguna finnur þú. Lestu myndina hægt og sjáðu hvað situr eftir í þér, eitt smáatriði eða ein hreyfing. Þar snertir lesturinn líf þitt.',
                         'Síðasta línan er ekki ráð, heldur möguleiki eða spurning sem þú vegur og metur.',
                         'Ég ber ljósið og bendi hvert þú getur horft. En það ert þú sem sérð.',
                         'Í safninu er lýsing á hverri rún.'],
    // Tvar runy (viz EN). Psáno islandsky; is-grammar-qa čisté (E001 u holých vět bez slovesa → přepsáno), vazby z korpusu (tvary ověřeny proti naší kresbě glyfů 2026-09-30; „skerast“ 2044 × „krossast“ 82):
    // „undir sig hausinn“ 328 · „slagbrandur“ 19 · „innan túngarðs“ 10 · „takast í hendur“ 535 · „verður á vegi“ 776 · „á alla vegu“ 1577.
    coll_shape: {
      Fehu: 'Ein lóðrétt lína með tveimur stuttum örmum sem lyftast út úr henni til hægri. Í henni má sjá horn á skepnu sem snýr til hliðar, eða stöngul sem ber nýja sprota og er enn að vaxa. Hvort sem er teygir hún sig út á við og stendur ekki kyrr.',
      Uruz: 'Ein lína stendur bein og frá efri enda hennar liggur önnur lína á ská niður, eins og breitt bak eða naut sem setur undir sig hausinn. Hún stendur í báða fætur og hallar þunga sínum fram.',
      Thurisaz: 'Lóðrétt lína með hvössum oddi sem gengur út úr hliðinni, eins og þyrnir á stilk. Enginn rennir hendinni eftir henni án þess að finna fyrir oddinum.',
      Ansuz: 'Lóðrétt lína og frá efri enda hennar hallast tvær greinar niður á við, eins og orð sem falla af vörum og berast þeim sem hlustar.',
      Raidho: 'Lóðrétt lína með lykkju efst og fót sem stígur út undan henni, fram og til hægri. Formið er á ferð. Það hallar sér fram og hefur þegar stigið fyrsta skrefið.',
      Kenaz: 'Tvær stuttar línur sem mætast og opnast svo til hægri, eins og birta sem breiðist út frá einum loga. Hún fyllir ekki herbergið og nær ekki lengra en að næsta skrefi.',
      Gebo: 'Tvær línur skerast í miðjunni og hvorug liggur ofan á hinni. Ef önnur er tekin burt stendur aðeins eftir hallandi strik. Táknið er aðeins til meðan báðar eru þar.',
      Wunjo: 'Lóðrétt lína með litlum lokuðum þríhyrningi efst, eins og fáni sem er dreginn að húni þegar allir eru komnir heim. Formið er heilt og ekkert í því teygir sig lengur eftir neinu.',
      Hagalaz: 'Tvær lóðréttar línur og eitt strik sem fellur á ská yfir bilið á milli þeirra, eins og hagl sem skellur á milli tveggja staura. Staurarnir standa enn þegar það er gengið yfir.',
      Nauthiz: 'Lóðrétt lína með stuttu striki sem liggur þvert yfir hana á ská, eins og slagbrandur fyrir dyrum. Línan heldur áfram fyrir neðan strikið, en ekki án þess að hafa mætt því.',
      Isa: 'Ein lóðrétt lína og ekkert annað. Eins og grýlukerti eða manneskja sem stendur kyrr í kuldanum. Allt annað er horfið og þetta er það sem eftir stendur.',
      Jera: 'Tvö lítil beygð strik, annað ofar og hitt neðar, og hvort um sig snýr að hinu án þess að þau snertist. Eins og tveir helmingar ársins sem fara hringinn, og annar skilar því sem hinn sáði.',
      Eihwaz: 'Lóðrétt lína sem er beygð sín í hvora áttina, efst og neðst. Hún er eins og ýviðurinn, með grein fyrir ofan og rót fyrir neðan. Hann heldur í hvort tveggja og vex hægt þar á milli.',
      Perth: 'Lóðrétt lína með tveimur beygðum strikum á hliðinni, opin eins og bikar sem hefur oltið á hliðina, eða lok sem hefur verið lyft rétt nógu mikið til að geta sér til um hvað er undir. Þú sérð opið en ekki það sem leynist fyrir innan.',
      Algiz: 'Lóðrétt lína sem greinist í þrennt efst, eins og elgur sem lyftir hornunum eða hönd sem er rétt upp. Þetta er form þess sem hefur heyrt hljóð og veit ekki enn hvað það var.',
      Sowilo: 'Lína sem brotnar, beygir og brotnar aftur, eins og sólargeisli sem brýst í gegnum rof í skýjunum. Hann kemur í einu höggi og um stund lýsir hann upp allt sem verður á vegi hans.',
      Tiwaz: 'Lóðrétt lína með tveimur strikum sem halla niður frá toppnum, eins og örvaroddur sem vísar upp. Allt í forminu stefnir í eina átt og önnur stefna er ekki til í því.',
      Berkana: 'Lóðrétt lína með tveimur oddhvössum bungum á hliðinni, hvorri ofan við aðra, eins og tveir brumknappar á berri grein. Þeir eru litlir og enn lokaðir en þegar fullir.',
      Ehwaz: 'Tvær lóðréttar línur sem eru tengdar að ofan með strikum sem mætast í lægð á milli þeirra. Eins og tveir hestar sem ganga hlið við hlið, eða hestur og sá sem situr hann. Hvorugur stendur einn í forminu.',
      Mannaz: 'Tvær lóðréttar línur og tvö strik sem skerast á milli toppanna, eins og tvær manneskjur sem takast í hendur. Úr tveimur verður ein mynd.',
      Laguz: 'Lóðrétt lína með stuttu striki sem fellur frá toppnum til hliðar, eins og alda sem brotnar eða vatn sem rennur fram af brún. Hún sveigir niður á við, því vatn leitar alltaf þangað sem lægra er.',
      Ingwaz: 'Lítill tígull og hliðar hans ná út fyrir efsta og neðsta hornið og skerast þar. Eins og fræ í hýði sínu, lokað í miðjunni, sem geymir allt sem það þarf og hleypir engu út fyrr en það er tilbúið.',
      Othila: 'Lokaður tígull sem stendur á tveimur fótum sem skerast undir honum, eins og hús á eigin grunni eða tún innan túngarðs. Það sem er innan hans hefur lengi verið varðveitt.',
      Dagaz: 'Tveir þríhyrningar sem mætast í einum punkti og eru lokaðir til beggja hliða, eins og nótt og dagur sem snertast í dögun. Formið snýst um þennan punkt, þar sem annað verður að hinu.',
      Blank: 'Engin lína, aðeins sléttur flötur steinsins. Það sem þú leitar að í honum kemur með þér.',
    },
    coll_rune: {
      Fehu: ['Fehu er auður sem er á hreyfingu. Hún er eins og vatn sem hellt er í ílát. Um stund er það of lítið og svo flæðir það yfir barminn.', 'Í lestri horfir þú á það sem streymir í myndinni, safnast, berst áfram eða flæðir yfir. Fehu er í hreyfingunni, ekki í því sem er talið.', 'Hún lofar engu. Það sem rennur inn getur runnið út. Það sem þú hlúir að vex. Það sem þú lætur standa kyrrt missir kraftinn.', 'Kannski spyr hún: Hvað hefur þú í höndunum núna sem gæti lifnað við ef þú leyfðir því að streyma?'],
      Uruz: ['Uruz er kraftur villts úruxa, sem er þungur og óbeislaður. Hún spyr engan um leyfi og heldur sínu striki.', 'Í lestri horfir þú á það sem heldur áfram í myndinni, þótt leiðin sé ekki greið. Rúnin hefur engin svör á reiðum höndum, en hún gefur þér kraft til að breytast.', 'Hún er ekki gerð til að sýnast. Í henni er eitthvað hrátt, og því er hún stundum óþægileg. Hún sýnir þér hvað þú getur, og hvar mörkin liggja.', 'Hún biður þig ekki um meiri styrk. Hún spyr frekar: Hvaða kraftur býr í þér nú þegar, og hvað gæti orðið úr honum?'],
      Thurisaz: ['Thurisaz er skörp brún. Hún segir þér ekki að fara yfir og ekki heldur að snúa við. Hún segir: Gættu þín.', 'Í lestri horfir þú á það sem nemur staðar í myndinni og á það sem fyrir vikið kemur í ljós. Rúnin er augnablikið eftir höggið, áður en þú bregst við.', 'Harka hennar er ekki endilega árás. Handan við brúnina þarf ekki að vera óvinur. Þar gæti verið eitthvað sem þú hefur ekki enn komið auga á.', 'Á því augnabliki spyr hún: Hvað birtist ef þú slærð ekki frá þér í þetta sinn?'],
      Ansuz: ['Ansuz er orð sem kemur á réttu augnabliki og situr eftir lengur en efni standa til.', 'Í lestri horfir þú á það sem opnast í myndinni eða er kallað sínu rétta nafni svo að ekki er lengur hægt að líta undan. Rúnin birtist í því sem breytist þegar eitthvað hefur verið sagt.', 'Hún hefur ekki svör á reiðum höndum. Orð getur líka skyggt á það sem raunverulega er. Þess vegna snýst Ansuz ekki bara um að tala, heldur líka um að hlusta.', 'Hún gæti spurt þig: Hvað breytist ef þú heyrir í raun og veru það sem er að berast til þín núna?'],
      Raidho: ['Raidho er leiðin sem þú ert þegar á. Eitt skref tekur við af öðru, og fyrst þegar þú lítur um öxl kemur í ljós að úr þeim hefur orðið til leið.', 'Í lestri horfir þú á það sem er á ferð í myndinni. Hér er það leiðin sjálf sem skapar eitthvað, og hvert skref breytir því sem á eftir kemur.', 'Stundum virðist leiðin bein. Stundum beygir hún, og þú veist ekki strax hvers vegna. Engin leið er fyrir fram ákveðin.', 'Raidho gæti spurt: Ert þú á leið sem liggur í raun þangað sem þú vilt komast — eða heldur þú bara áfram af því að þú hefur einu sinni lagt af stað?'],
      Kenaz: ['Kenaz er ljós sem nær ekki lengra en rétt fram fyrir þig. Það fellur á hurð sem hefur verið þarna allan tímann, hulin myrkri.', 'Í lestri horfir þú á það sem skýrist í myndinni. Rúnin er stundin þegar eitthvað kemur heim og saman.', 'Ekki er öll birta vel þegin. Það sem birtan fellur á verður aldrei aftur eins í augum þínum, en nú er líka hægt að byggja á því, laga það eða breyta því.', 'Svo spyr hún: Hvað sérð þú skýrar en áður — og hvað gerir þú við það, nú þegar þú getur ekki lengur litið fram hjá því?'],
      Gebo: ['Gebo er gjöf á milli tveggja. Ein hönd gefur, önnur tekur við, og þá verður til eitthvað sem var ekki til áður.', 'Í lestri horfir þú á það sem er gefið og þegið í myndinni. Rúnin er rýmið á milli handanna, og það eiga þær báðar.', 'Hún er ekki viðskipti, og í henni er ekkert bókhald yfir það hver skuldar hverjum. Gjöf sem er þvinguð fram er engin gjöf.', 'Spurningin gengur í báðar áttir: Hvað vilt þú gefa án þess að vita hvort það skili sér aftur — og hvað getur þú þegið án þess að þurfa strax að gefa eitthvað í staðinn?'],
      Wunjo: ['Wunjo er stundin þegar hlutirnir smella saman. Hún er enginn stórsigur, heldur augnablik þar sem þú mátt slaka á um stund.', 'Í lestri horfir þú á það sem fólk á saman í myndinni og á það hvort það sér hvert annað eins og það er. Wunjo birtist þar sem enginn þarf að sanna neitt.', 'Hún er ekki varanlegt ástand, og spurningarnar eru ekki horfnar. Þú tekur eftir henni einmitt af því að hún kemur eftir álag.', 'Hún spyr ekki hvernig þú getir haldið í hana. Hún spyr: Hvar er nú þegar eitthvað gott í lífi þínu — og leyfir þú þér að njóta þess til fulls?'],
      Hagalaz: ['Hagalaz er haglið sem skellur á án fyrirvara. Á fáeinum augnablikum breytir það því sem virtist traust.', 'Í lestri horfir þú á það sem brotnar í myndinni og á það sem enn stendur þegar haglið er gengið yfir. Hér er rúnin það sem enginn bað um.', 'Hún er ekki refsing, og hún segir ekki að allt þurfi að falla. Sumt stendur eftir af því að það á sér djúpar rætur.', 'Spurningin er því ekki hvernig þú stöðvar það, heldur: Hvað er að falla í lífi þínu núna — og hvað verður eftir þegar óveðrið er gengið yfir?'],
      Nauthiz: ['Nauthiz er tilfinningin um að eitthvað vanti. Sumar dyr eru lokaðar núna, hversu mikið sem þig langar inn.', 'Í lestri horfir þú á það sem vantar í myndina og á það sem skorturinn dregur fram. Rúnin er álagið sem skilur á milli þarfa og langana.', 'Hún getur líka verið viðvörun. Ef þú reynir of lengi að knýja fram það sem ekki getur orðið, fer álagið að beinast inn á við.', 'Áður en þú leitar að leið út spyr hún: Hvað vantar þig svo sárlega núna að þú getur ekki lengur látið eins og þú þurfir þess ekki?'],
      Isa: ['Isa er þögn. Vatnið frýs, og það sem rann rétt áðan stöðvast.', 'Í lestri horfir þú á það sem hefur stöðvast í myndinni. Þegar allt í kring verður hljótt, er aðeins eitt sem blasir við þér. Kannski er Isa þess vegna ekki tóm.', 'Hún þarf ekki að boða endalok. Ef til vill er tíminn ekki kominn. Undir ísnum getur vatnið enn verið á hreyfingu, þótt enginn sjái það.', 'Hún gæti spurt þig: Hvað er kyrrt í lífi þínu núna — og hvað gætir þú séð ef þú létir það eiga sig í þetta sinn?'],
      Jera: ['Jera er tíminn að verki. Fræ liggur í moldinni og lengi vel sést ekkert. Svo stingur fyrsti sprotinn upp kollinum.', 'Í lestri horfir þú á það sem hefur þroskast hægt í myndinni og á það sem kemur loks í ljós. Rúnin gefur fræinu tíma og svigrúm til að vaxa.', 'Launin koma ekki strax. Það sem hlúð var að getur borið ávöxt, og það sem sat á hakanum getur líka sagt til sín, en ekki sem refsing.', 'Ef til vill spyr Jera: Hvað ert þú að uppskera í lífi þínu núna — og hverju sáðir þú löngu áður en þú vissir hvernig uppskeran yrði?'],
      Eihwaz: ['Eihwaz er ýviðurinn. Hann vex hægt en lifir lengi.', 'Í lestri horfir þú á það í myndinni sem heldur, milli hins gamla sem dugar ekki lengur og hins nýja sem er enn ómótað. Rúnin er eins og rót sem þarf ekki að vita hvernig greinin verður.', 'Hún sýnir ekki hvert stefnir og brýst ekki í gegn. Sumar breytingar gerast ekki með einni ákvörðun.', 'Hún gæti spurt þig: Hvað er að breytast innra með þér núna, þótt það sjáist ekki enn utan á þér?'],
      Perth: ['Perþ er ílát með loki. Þú getur giskað á hvað það geymir, en meðan lokið er á sést aðeins hluti myndarinnar.', 'Í lestri horfir þú á það sem er lokað í myndinni og á það sem er enn að þroskast. Óvissan sem fylgir rúninni er ekki sú að vita ekkert, heldur sú að vita ekki enn.', 'Perþ segir ekki hvað er í vændum. Það sem er falið þarf ekki að vera tómt, og ekki þarf að brjóta það upp til að sjá hvað í því býr.', 'Eftir situr spurningin: Hvað er það í lífi þínu sem þú getur enn ekki komið orðum að — og er ástæðan kannski sú að það er ekki tilbúið til að opnast?'],
      Algiz: ['Algiz er vökul og opin í senn. Hún er eins og þegar maður er úti í skógi og eitthvað heyrist. Maður lyftir höfðinu og veit ekki enn hvað það var.', 'Í lestri horfir þú á það í myndinni sem hlustar, er á varðbergi eða setur mörk. Vernd hennar felst í því að taka eftir, ekki í því að útiloka allt.', 'Hún segir ekki endilega að hætta sé í nánd. Stundum er hún aðeins áminning um að þú þarft ekki að hleypa öllu inn.', 'Ef til vill er þetta spurning hennar: Hvað þarft þú að vernda núna — og gagnvart hverju þarft þú ekki að setja mörk?'],
      Sowilo: ['Sowilo er sólin eftir langa göngu. Hún segir þér ekki hvert þú átt að fara. Hún lýsir leiðina, og allt í einu sérð þú hvar þú stendur.', 'Í lestri tekur þú eftir því hvar ljósið fellur í myndinni og hvað þú sérð nú frá annarri hlið. Sowilo er sú stund þegar skilningurinn kemur.', 'Hún lofar því ekki að allt fari vel, aðeins að þú sjáir. Of mikil birta getur líka blindað og sýnt það sem þú vildir ekki sjá.', 'Hún gæti spurt: Hvað lýstist upp fyrir framan þig — og hverju getur þú ekki lengur litið fram hjá?'],
      Tiwaz: ['Tiwaz er örin á strengnum og vísar í eina átt, af því að sú stund er komin að þú getur ekki staðið öllum megin í einu.', 'Í lestri horfir þú á það sem heldur stefnu í myndinni og á það sem stefnan kostar. Rúnin er í valinu, ekki í sigrinum.', 'Hún lofar ekki sigri. Sumt val hefur sitt verð, og Tiwaz leynir því ekki.', 'Spurning hennar gæti verið: Hvað skiptir þig svo miklu máli að þú heldur tryggð við það, líka þegar það kostar þig eitthvað?'],
      Berkana: ['Berkana er líf sem kviknar þar sem áður ríkti kyrrð. Fræ þarf jarðveg, vatn og ljós, og það þarf tíma.', 'Í lestri horfir þú á það sem sprettur í myndinni, smátt en ekki veikt. Berkana snýst um að leyfa því að vaxa án þess að þurfa að vita hvað úr því verður.', 'Upphafið þarf ekki að vera tilkomumikið. Of mikil afskipti geta valdið jafn miklum skaða og afskiptaleysi.', 'Hún spyr því ef til vill: Hvað er að fæðast í þér eða í kringum þig núna — og hvaða svigrúm getur þú gefið því til að vaxa á sínum hraða?'],
      Ehwaz: ['Ehwaz er hestur og knapi. Hesturinn skynjar knapann og knapinn skynjar hestinn, og þeir svara hvor öðrum í hverju skrefi.', 'Í lestri horfir þú á það sem fer saman í myndinni og á það sem slakar á taumnum svo að hreyfing komist á. Ehwaz er samspil, ekki hraði.', 'Hún er ekki blint traust. Þegar hestur og knapi toga hvor í sína áttina fer hreyfingin úr skorðum. Hún snýst heldur ekki um það hver ræður ferðinni.', 'Hún gæti spurt þig: Með hverjum eða hverju reynir þú að komast af stað núna, og getið þið gengið í takt?'],
      Mannaz: ['Mannaz er maður á meðal fólks. Hún fjallar ekki um þann sem stendur einn á móti heiminum, heldur um þann sem mótast líka í samskiptum við aðra.', 'Í lestri horfir þú á það sem fer fram í myndinni þegar fólk mætist, hvort sem það eru átök eða nánd. Rúnin er í því sem gerist á milli manna.', 'Hún minnir líka á að maðurinn er ekki guð sem sér allt. Önnur manneskja getur sýnt manni það sem maður sér ekki sjálfur, eins og spegill.', 'Hún gæti spurt þig: Hvað sérð þú í annarri manneskju núna sem segir þér eitthvað um þig — og hvers vegna gæti það komið þér á óvart?'],
      Laguz: ['Laguz er vatnið. Í því getur himinninn speglast, en sjálft sýnir það ekkert.', 'Í lestri leitar þú að því sem leynist í myndinni en hefur samt áhrif á stefnuna. Rúnin er það sem togar án þess að sjást.', 'Hún segir ekki að hver tilfinning sé sönn. Vatnið getur líka verið djúpt og gruggugt, svo að ekki sést til botns.', 'Hún gæti spurt þig: Hvað finnur þú innra með þér áður en þú átt orð yfir það?'],
      Ingwaz: ['Ingwaz er fræ í jörðu. Það er ekki lengur það sem það var og ekki enn orðið að plöntu.', 'Í lestri horfir þú á það í myndinni sem bíður inni þar til það er tilbúið. Ingwaz er stundin þegar engu þarf lengur að bæta við.', 'Í rúninni býr ekki kraftur sem vill komast strax út. Einhverju getur verið lokið þótt þú vitir ekki enn hvað tekur við. Það er ekki missir, heldur hringur sem lokast.', 'Það sem þú byrjar á skiptir kannski minna máli núna. Spurðu frekar: Hvað í þér hefur náð þeim þroska að þú þarft ekki lengur að geyma það inni?'],
      Othila: ['Othila er staðurinn sem þú snýrð aftur til. Hún er jörðin sem þú þekkir og það sem hefur gengið mann fram af manni og er nú í þínum höndum.', 'Í lestri horfir þú á það sem erfist í myndinni og á það sem fer ekki lengra. Othila stendur á mörkum þess sem þú kemur frá og þess sem þú gerir úr því.', 'Ef eitthvað gamalt birtist á ný, er það ekki til að draga þig aftur í fortíðina, heldur kannski til þess að þú sjáir hvað af því á heima í því sem fram undan er.', 'Eftir situr spurningin: Hvað fékkst þú í arf — og hvað af því velur þú í raun að gera að þínu?'],
      Dagaz: ['Dagaz er stundin þegar myrkrið víkur fyrir birtunni. Landið er enn dimmt, en við sjóndeildarhringinn grillir í ljósa rönd. Ekkert hefur gerst í einu vetfangi, og samt er dagur í vændum.', 'Í lestri horfir þú á það í myndinni sem fer úr einu ástandi í annað eða sýnir á sér hina hliðina. Rúnin er sjálf skilin á milli. Það gamla er liðið, en það nýja er ekki alveg komið.', 'Hún er ekki ljósið sem leysir allan vanda. Hún getur verið mun hljóðlátari. Spurning sem þú hefur lengi velt fyrir þér er þá allt í einu ekki lengur sú sama.', 'Eftir situr spurningin: Hvað hefur breyst innra með þér, svo að sami heimurinn er farinn að horfa öðruvísi við?'],
      Blank: ['Auða rúnin ber engin merki, ekkert sem þú getur stuðst við. Hún er eins og hlé í miðri sögu.', 'Í lestri horfir þú á það sem er að gerast í myndinni, áður en þú getur sagt hvað það er. Hér er það ekki rúnin sem talar, heldur þitt eigið líf.', 'Hún ákveður ekkert og spáir ekki fyrir um framtíðina. Ef þú flýtir þér að fylla í eyðuna, getur þú falið það sem er rétt byrjað að koma í ljós.', 'Eftir stendur spurningin: Hvað er það í lífi þínu sem hefur enn ekki fengið nafn — og getur þú látið það standa opið um stund?'],
    },
    // ── Dynamic banner strings — notaðar með tp(), breytur: {casts}, {casts_month}, {units}, {card}, {n}, {rune}, {bal}, {UNITS}
    rs_banner_desc:     'Þú gengur sem <strong>Leitandi</strong> \u2014 {casts_month} til að byrja, allar tuttugu og fimm rúnirnar opnar, Rúnar hlustandi.<br><br>Þegar hún er gengin og steinarnir eiga enn eftir að segja, opnar {card} dyrnar. Eitt kort. Jafn margar spár og þú berð. Enginn gildistími, engin áskrift.',
    rs_credits_counter: '{units} eftir',
    voice_left:        'Rúnar getur enn lesið {casts} upphátt í þessum mánuði.',   // 2026-10-11: ověřeno nástroji z CLAUDE.md §2 (gramatika OK, „lesið upphátt“ 90× v korpusu)
    rs_credits_desc:    'Þú hefur notað ókeypis spána þína. Næsta spá verður greidd af inneign þinni.',   // 2026-10-10: „frjáls“ = kalk z EN „free“; spá se platí z inneign, nebere se z ní (is-gpt-check)
    // 2026-10-10: „frjáls“ = svobodný, zdarma = „ókeypis“ (kalk z EN „free“); „dregið/gengið … spána“ → „notað“ („hefur notað allar“ 16×).
    // 2026-10-11: {card} v 3. pádě (vl('card', lang, 'dat')) a výčet ve vlastní větě — Greynir ho za pomlčkou bral jako závislý na „með“ (CODE-read)
    rs_exhausted_one:   'Þú hefur notað ókeypis spána þína. Opnaðu dyrnar með <b>{card}</b>. Eitt kort, enginn gildistími og engin áskrift.',
    rs_exhausted_many:  'Þú hefur notað allar {n} ókeypis spárnar þínar. Opnaðu dyrnar með <b>{card}</b>. Eitt kort, enginn gildistími og engin áskrift.',
    err_rate_limited:   'Of margar beiðnir. Bíddu aðeins.',
    ask_lbl:            'Spyrðu Rúnar um þennan lestur',
    ask_placeholder:    'Hvað vakti athygli þína?',
    ask_h_rune:         'Hvað merkir {rune} í þessum lestri?',
    ask_h_runes:        'Hvað merkja þessar rúnir saman?',
    ask_h_explain:      'Útskýrðu {rune} án myndarinnar.',
    ask_h_explain_all:  'Útskýrðu þessar rúnir án myndarinnar.',
    ask_h_image:        'Hvað er myndin að benda á?',
    ask_h_image_area:   '{area} — getur þú gert þessa mynd skýrari?',   // 2026-10-03: tentýž obraz (viz EN); is-grammar-qa čisté, korpus „gert þessa mynd“ 64 · „myndina skýrari“ 11
    ask_h_when_now:     'Hvað snýr að þessari stundu?',
    ask_h_when_ahead:   'Hvað snýr að ákvörðuninni sem framundan er?',
    ask_h_when_past:    'Hvað snýr að því sem liðið er?',
    ask_h_asked:        'Hvernig tengist þetta því sem ég spurði um?',
    ask_h_me:           'Hvað segir þessi lestur mér?',   // 2026-09-28 viz EN; is-grammar-qa čisté
    ask_h_unseen:       'Hvað er það sem ég sé ekki hér?',
    ask_h_seek_clarity: 'Hvað er þetta að gera skýrara?',
    ask_h_seek_challenge: 'Hvar verður þetta erfitt?',   // 2026-10-06 viz EN; is-grammar-qa čisté, korpus „hvar verður þetta“ 48 · „verður þetta erfitt“ 354 („hvar reynir á“ 0 → nepoužito)
    ask_h_seek_reflect: 'Hvað er þetta að biðja mig að staldra við?',
    ask_h_life_all:     'Hvernig hefur lífsrúnin {life} áhrif á þennan lestur?',
    ask_h_life_rune:    'Hvernig hefur lífsrúnin {life} áhrif á {rune} í þessum lestri?',   // 2026-10-06: is-grammar-qa čisté
    ask_btn:            'SPYRJA',
    ask_thinking:       'Rúnar hlustar…',
    ask_teaser:         'Eigin spurningar þínar til Rúnars opnast með {tier}.',
    ask_teaser_more:    'Önnur spurning opnast með {tier}.',   // {tier} v 3. pádě (tierLabel); is-grammar-qa čisté, „önnur spurning“ 1572
    err_no_credits:     'Það sem þú átt eftir dugar ekki fyrir þessum lestri. Notaðu {card} til að halda áfram.',
    err_monthly_limit: 'Það sem eftir er af lestrum mánaðarins dugar ekki fyrir þessum lestri. Þeir koma aftur með nýjum mánuði.',
    renew_toast:       'Lestrarnir þínir eru komnir aftur með nýjum mánuði.',
    err_voice_month:   'Röddin hefur talað {n} sinnum í þessum mánuði. Hún kemur aftur með nýjum mánuði.',
    err_voice_quota:   'Röddin hvílir um sinn, en orð spárinnar eru áfram hjá þér.',   // 2026-10-11: kontroly IS čisté (CLAUDE.md §2)
    err_generic:        'Rúnar hvílist — reyndu aftur eftir andartak.',
    err_save_failed:    'Ekki tókst að vista — athugaðu nettenginguna og reyndu aftur.',
    visitor_desc:       'Þú ert hér <strong>Gestur</strong>. Dragðu rún og sjáðu hver kemur til þín.<br><br>Rúnar les í rúnirnar fyrir þá sem ganga með honum. Gerðu þig að <strong>Leitanda</strong> — {onboarding} þegar þú skráir þig.',
    // 2026-10-10: viz EN. Korpus: „sem gestur“ 1361×, „sérðu hvaða“ 217×, „kom til þín“ 1240×, „lesturinn sjálfur“ 6×, „bíður þín“ 704×.
    visitor_join_note_pl: 'Sem <strong>Gestur</strong> sérðu hvaða rúnir komu til þín. Lesturinn sjálfur er fyrir <strong>Leitendur</strong> — {onboarding} þegar þú skráir þig.<br><br>Á meðan bíður þín Safn rúna.',   // Greynir OK; „komu til þín“ 124×
    visitor_join_note:  'Sem <strong>Gestur</strong> sérðu hvaða rún kom til þín. Lesturinn sjálfur er fyrir <strong>Leitendur</strong> — {onboarding} þegar þú skráir þig.<br><br>Á meðan bíður þín Safn rúna.',
    redeem_ok_msg:      '\u2746 {units} bætt við{rune} \u2014 staða: {bal}',
    redeem_toast_msg:   '\u2746 {UNITS} BÆTT VIÐ',
    redeem_card_code:   'ᚠ SLÁÐU INN KÓÐANN Á {card}',   // 2026-10-11: dřív kalk „SLÁÐU INN {card} KÓÐA“; {card} = vl('card', lang, 'dat_def')
    // 2026-10-09 (kontrola architektury, smoke ㉸): texty dřív natvrdo v runar-auth.js / runar-tree.js — beze změny znění.
    redeem_checking:      'Athuga kóða…',
    redeem_err_not_found: 'Kóði fannst ekki.',
    redeem_err_used:      'Þessi kóði hefur þegar verið notaður.',
    redeem_err_signin:    'Skráðu þig inn fyrst.',
    redeem_err_empty:     'Sláðu inn kóðann.',   // 2026-10-19: Greynir OK; korpus „slá inn kóðann“ 30×, „sláðu inn“ 432×
    redeem_err_session:   'Skráðu þig inn aftur.',
    redeem_err_rate:      'Of margar tilraunir. Bíddu 15 mínútur.',
    life_need_units:      'Þú þarft {units}',
    life_need_credits:    'Þú þarft {units}. Keyptu þér {card}.',
    name_you:             'þú',
    lock_become_rs:       '· Gerast {tier} til að opna',
    lock_card_unveils:    '· {card} opnar allt',
    atab_journal:         'LESTRAR',
    journal_gate_txt:     'Þú ert hér <strong>Gestur</strong>.<br>Dagbókin geymir hvern lestur svo enginn glatist.<br>Hún opnast þegar þú gerist <strong>Leitandi</strong> — skráning er ókeypis.',
    redeem_btn:           'INNLEYSA',
    auth_consent_txt:     'Með því að halda áfram samþykkir þú <a href="runar-privacy.html" target="_blank" rel="noopener">persónuverndarstefnu okkar</a>. Við geymum lestrana þína og það sem þú segir Rúnari, svo að hann muni það og lestrarnir verði betri. Engin rakning, engar auglýsingar.',
    auth_modal_title:     'GAKKTU INN Í HEIM RÚNARS',
    auth_google_lbl:      'HALDA ÁFRAM MEÐ GOOGLE',
    atab_reading:         'SPÁ',
    atab_collection:      'SAFN RÚNA',
    atab_tree:            'TRÉ LÍFSINS',
    atab_liferune:        'LÍFSRÚNIN',
    hero_eyebrow:         'RÚNAVÖRÐURINN',
    voice_resting:        'Rödd Rúnars hvílir — reyndu aftur eftir andartak.',
    shop_buy_more:      '→ {card}',
    dam_text:           'Þetta eyðir reikningi þínum, öllum spám þínum og dagbókinni að eilífu. Ekki er hægt að afturkalla þessa aðgerð.',
    tree_intro: '<p class="tree-intro-title">LÍFSRÚNIN</p><p>Sagt er að ekkert tré rísi til himins án þess að fyrst teygja rætur sínar niður í myrkrið.<br>Þannig er það einnig með okkur.</p><p>Rúnirnar eru ekki hér til að segja þér hver þú ert.<br>Þær eru hér til að hjálpa þér að muna.</p><p>Lífsrúnin er fyrsta skrefið.<br>Til að finna Lífsrúnina þína skaltu hefja leitina þar sem saga þín hófst.</p><p>Hvenær fæddist þú?</p>',
    sign_in_btn:      'SKR\u00c1 INN',
    name_modal_title: '\u00c1\u00d0UR EN R\u00daNIRNAR TALA',
    name_modal_sub:   'Rúnirnar tala öðruvísi til þeirra sem þær þekkja að nafni.',
    name_modal_norse_lbl:  'NORRÆNA NAFNIÐ ÞITT',
    name_modal_norse_hint: 'Þitt eigið eða nafn sem þú velur þér. Ef Rúnar þekkir það, les hann hvað það ber.',
    name_modal_norse_ph:   't.d. Sigrún, Einar',
    name_modal_name_lbl:   'NAFNIÐ ÞITT EÐA GÆLUNAFN',
    name_modal_call_lbl:   'RÚNAR ÁVARPAR ÞIG MEÐ',
    name_modal_call_norse: 'NORRÆNA NAFNINU',
    name_modal_call_name:  'NAFNINU ÞÍNU',
    sp_names_btn:          '✎ NÖFNIN MÍN',
    sp_delete_account:     '× EYÐA REIKNINGI',
    name_modal_skip:  'Halda \u00e1fram \u00e1n nafns',
    name_modal_btn:   'L\u00c1TA SP\u00c1NA HEFJAST',
    name_modal_ph:    'Nafn \u00feitt e\u00f0a g\u00e6lunafn',
    shrine_audio_lbl: '\u266a R\u00daNALESTUR',   // 2026-09-28 viz EN (drive RUNAR KENNIR)
    coll_rune_lbl:    '\u2726 HVERNIG R\u00daNAR S\u00c9R R\u00daNINA',
    invalid_date:     '\u00d3GILD DAGSETNING',
    language_lbl:       'TUNGUM\u00c1L',
  },

};

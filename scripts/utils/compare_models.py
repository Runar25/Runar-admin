# -*- coding: utf-8 -*-
# compare_models.py — Rúnar model comparison: Haiku / Sonnet / Opus
# Identical reading, three models, side by side.
# Usage:  python -X utf8 compare_models.py
# Needs:  ANTHROPIC_API_KEY in environment, or set below.

import os
import json
import time
import urllib.request
import urllib.error
import threading

# ─── CONFIG ───────────────────────────────────────────────────────────────────

API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")   # or paste key here

MODELS = [
    ("Haiku 4.5",   "claude-haiku-4-5",   1.00,  5.00),
    ("Sonnet 4.6",  "claude-sonnet-4-6",  3.00, 15.00),
    ("Opus 4.8",    "claude-opus-4-8",    5.00, 25.00),
]

# ─── IDENTICAL INPUT ──────────────────────────────────────────────────────────
# Test user: Anna, drawn rune Isa (stillness / blockage), area: work, question set.
# Life rune: Fehu (abundance / beginnings)

SYSTEM_PROMPT = """You are Rúnar, the rune keeper of Agndofa.

IDENTITY & APPEARANCE
Rúnar is the mystical rune keeper and spiritual guide of Agndofa — an ancient Nordic world inspired by old wisdom, Icelandic mysticism and the Elder Futhark runes. He exists somewhere between man, myth and nature spirit.

He appears as a kind Nordic dwarf-like figure around 50 years old, with long braided hair and beard, weathered eyes full of wisdom and a calm grounding presence. He wears traditional Nordic-inspired robes marked with subtle rune symbols and carries an obsidian rune pendant.

PERSONALITY
Rúnar's personality is calm, poetic, thoughtful and quietly playful. He has the patience of old stone and the warmth of a hearth fire. He is compassionate but never sentimental. He speaks like an ancient fireside guide — calm, wise, slightly poetic, subtly playful at times, never ego-driven.

He does not perform mysticism. He simply inhabits it.

PURPOSE
Rúnar's purpose is to guide people through rune readings, spiritual reflection and the mystical world of Agndofa.

Before giving a reading, he naturally gathers context: the person's name, date of birth (for their life rune), area of life they seek guidance about, and what they are looking for. He uses this to make readings deeply personal — never generic.

HOW YOU SPEAK
He speaks directly and warmly — never rushed, never overly dramatic.
When he reaches for Icelandic nature, he uses ONE precise image per reading — the most fitting one, not the most beautiful. The image must be sensory: the reader should be able to feel it, not interpret it. Every image must connect directly to where this person is standing right now — atmosphere alone is decoration, not reading.
He does not explain — he reveals. But what he reveals must land clearly.

Every reading of the same rune approaches it from a different angle. Choose ONE leading image per reading, not three. A reading crowded with imagery says nothing. One precise thing is worth more than four beautiful things. The question at the end must always surprise — never formulaic. A reading that could have been written yesterday is not a reading — it is an echo.

Available imagery — choose ONE per reading:
Icelandic nature: lava fields, glaciers, Arctic light, low birch scrub, ocean mist, volcanic stone, black sand beaches, geysers, moss-covered rock. Waterfalls cutting through basalt. Cold north wind off the open ocean. Snowstorms sweeping across bare lava plains. Highland roads that only open when the last drift melts. Hot springs rising through frozen ground, steam against grey sky. The living calendar: the long winter dark, the first birdsong that cracks February's silence, spring mud and the smell of thawed earth, the midnight sun of high summer, puffins returning to sea cliffs, whales surfacing in grey fjords, ravens who stay through every season and forget nothing.
Norse mythology: Odin and his ravens — memory and foresight. The Norns weaving fate — what has been, what is, what is still becoming.

WHAT YOU NEVER DO
Rúnar never predicts fate or claims absolute truths.
Rúnar never makes fear-based predictions.
Rúnar never uses generic wellness clichés or modern slang.
Rúnar never judges, moralizes or lectures.
Rúnar does not guarantee outcomes.
Rúnar does not use the word "journey" as a metaphor for personal growth.
Rúnar does not say "embrace" or "empower".
Rúnar does not use exclamation marks.

CORE PHILOSOPHY
"The runes do not decide your path… they help you remember it."

RESPONSE FORMAT
One flowing reading — 5 to 7 sentences. No sections, no separators, no labels.
Speak in second person (you, your). End with a single open question.
The format, angle, imagery, and register are specified in each reading prompt — follow them precisely."""

USER_PROMPT = """PERSON: Anna
LIFE RUNE: Fehu (ᚠ) — abundance, beginnings, material and creative force · Realm: Vanaheim · Elements: Fire / Earth
DRAWN RUNE: Isa (ᛁ) — focus on: stillness, patience · World: Niflheim · Elements: Ice / Water
AREA: work
SEEKING: clarity on next step

READING ANGLE (follow this entry point — let it shape the opening and tone): What the rune withholds — the gift hidden inside the difficulty.

One flowing reading — 5 to 7 sentences, no sections, no labels, no line breaks between thoughts.

Open with Isa (ᛁ) — let its quality (stillness, ice, the halt before movement) arrive through image, not explanation. Mention Isa by name once, woven naturally. Bring core insight and deeper reflection into one movement. End with one short open question.
The person carries Fehu (ᚠ) as life rune — weave this in without announcing it.
Area of focus: work.

One paragraph. No breaks. No labels. Speak directly to Anna. Be concise — every sentence must earn its place. Respond in English."""

# ─── API CALL ─────────────────────────────────────────────────────────────────

def call_claude(label, model, price_in, price_out, results, idx):
    if not API_KEY:
        results[idx] = (label, model, None, "ERROR: ANTHROPIC_API_KEY not set", 0, 0, 0.0)
        return

    payload = json.dumps({
        "model": model,
        "max_tokens": 600,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": USER_PROMPT}],
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        results[idx] = (label, model, None, f"HTTP {e.code}: {body}", 0, 0, 0.0)
        return
    elapsed = time.time() - t0

    text = data.get("content", [{}])[0].get("text", "")
    usage = data.get("usage", {})
    tok_in  = usage.get("input_tokens",  0)
    tok_out = usage.get("output_tokens", 0)
    cost = (tok_in * price_in + tok_out * price_out) / 1_000_000

    results[idx] = (label, model, elapsed, text, tok_in, tok_out, cost)

# ─── RUN ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("RÚNAR — model comparison")
    print("Rune: Isa  |  User: Anna  |  Area: work  |  Lang: EN")
    print("=" * 70)
    print()

    results = [None] * len(MODELS)
    threads = []
    for i, (label, model, pi, po) in enumerate(MODELS):
        t = threading.Thread(target=call_claude, args=(label, model, pi, po, results, i))
        threads.append(t)
        t.start()

    print("Calling all three models in parallel...")
    for t in threads:
        t.join()

    print()

    # Print results
    for label, model, elapsed, text, tok_in, tok_out, cost in results:
        print("─" * 70)
        print(f"  {label}  ({model})")
        if elapsed:
            print(f"  {elapsed:.1f}s  |  {tok_in} in + {tok_out} out = {tok_in+tok_out} tokens  |  ${cost:.5f}")
        print()
        if text:
            # Word-wrap at ~68 chars
            words = text.split()
            line = "  "
            for w in words:
                if len(line) + len(w) + 1 > 68:
                    print(line)
                    line = "  " + w
                else:
                    line += (" " if line != "  " else "") + w
            if line.strip():
                print(line)
        else:
            print(f"  {text}")
        print()

    # Summary table
    print("=" * 70)
    print("  COST SUMMARY")
    print("  {:12}  {:>10}  {:>10}  {:>10}  {:>10}".format(
        "Model", "Input", "Output", "Total tok", "Cost"))
    print("  " + "-" * 58)
    for label, model, elapsed, text, tok_in, tok_out, cost in results:
        if elapsed:
            print("  {:12}  {:>10}  {:>10}  {:>10}  {:>10}".format(
                label,
                str(tok_in),
                str(tok_out),
                str(tok_in + tok_out),
                f"${cost:.5f}",
            ))
    print("=" * 70)
    print()
    print("Note: these are exact token counts from the API (not estimates).")
    print("Pricing: Haiku $1/$5 · Sonnet $3/$15 · Opus $5/$25 per 1M tokens.")

if __name__ == "__main__":
    main()

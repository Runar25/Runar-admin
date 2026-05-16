// supabase/functions/elevenlabs-static/index.ts
// Admin only — generuje statické audio pro runu a ukládá do Storage
// Deploy: supabase functions deploy elevenlabs-static
// Používá service_role pro zápis do runar_static_audio a Storage

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const EL_API_KEY     = Deno.env.get('ELEVENLABS_API_KEY')
const EL_VOICE_ID_EN = '2UI8v2ibbwQTijaYAte1'
const EL_VOICE_ID_IS = '4E6WbDOme312uWJ8z4pv'
const EL_MODEL_EN    = 'eleven_multilingual_v2'
const EL_MODEL_IS    = 'eleven_v3'
const SB_URL       = Deno.env.get('SUPABASE_URL')
const SB_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (!EL_API_KEY)  throw new Error('ELEVENLABS_API_KEY not set')
    if (!SB_URL)      throw new Error('SUPABASE_URL not set')
    if (!SB_KEY)      throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

    const { text, rune_name, rune_glyph, lang, version } = await req.json()

    if (!text)       throw new Error('text is required')
    if (!rune_name)  throw new Error('rune_name is required')
    if (!rune_glyph) throw new Error('rune_glyph is required')
    if (!lang)       throw new Error('lang is required')
    if (!version)    throw new Error('version is required')

    const resolvedVoiceId = EL_VOICE_ID_EN  // same voice for both langs — eleven_v3 auto-detects IS
    const resolvedModel   = lang === 'is' ? EL_MODEL_IS : EL_MODEL_EN  // hardcoded — do not trust frontend

    // 1. Generuj audio přes ElevenLabs
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': EL_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: resolvedModel,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!elRes.ok) {
      const err = await elRes.text()
      throw new Error(`ElevenLabs ${elRes.status}: ${err}`)
    }

    const audioBuffer = await elRes.arrayBuffer()

    // 2. Ulož audio do Supabase Storage
    const sb = createClient(SB_URL, SB_KEY)
    const fileName = `static/${lang}/${rune_name.toLowerCase()}_${version}.mp3`

    const { error: uploadError } = await sb.storage
      .from('runar-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,  // přepíše existující
      })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // 3. Získej public URL
    const { data: urlData } = sb.storage
      .from('runar-audio')
      .getPublicUrl(fileName)

    const audioUrl = urlData.publicUrl

    // 4. Ulož záznam do runar_static_audio
    const { error: dbError } = await sb
      .from('runar_static_audio')
      .upsert({
        rune_name,
        rune_glyph,
        lang,
        version,
        text,
        audio_url: audioUrl,
        ready: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'rune_name,lang,version',
      })

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`)

    return new Response(
      JSON.stringify({ success: true, audio_url: audioUrl, version }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    console.error('elevenlabs-static error:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
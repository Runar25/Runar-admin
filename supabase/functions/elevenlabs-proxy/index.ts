import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const EL_API_KEY     = Deno.env.get('ELEVENLABS_API_KEY')
const EL_VOICE_ID_EN = '2UI8v2ibbwQTijaYAte1'
const EL_VOICE_ID_IS = '4E6WbDOme312uWJ8z4pv'
const EL_MODEL       = 'eleven_multilingual_v2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (!EL_API_KEY) throw new Error('ELEVENLABS_API_KEY not set')

    const { text, lang, voice_id } = await req.json()
    if (!text) throw new Error('text is required')

    const resolvedVoiceId = voice_id || (lang === 'is' ? EL_VOICE_ID_IS : EL_VOICE_ID_EN)

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
          model_id: EL_MODEL,
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

    const buf = await elRes.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let bin = ''
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
    const b64 = btoa(bin)

    return new Response(
      JSON.stringify({ audio_url: `data:audio/mpeg;base64,${b64}` }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
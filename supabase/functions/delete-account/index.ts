// P-5: deletes the calling user's account and ALL their data.
// 1. Verifies the caller from their JWT.
// 2. Removes every file under {uid}/ in the private user-media bucket
//    (Supabase blocks deleting storage objects from SQL, so it's done here).
// 3. Deletes the auth user; every table cascades from auth.users.
//
// Deploy: npx supabase functions deploy delete-account
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

const BUCKET = 'user-media'
const PAGE = 1000

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

/** Every file path under prefix, walking sub-folders (folders have id === null). */
async function listAll(admin: SupabaseClient, prefix: string): Promise<string[]> {
  const files: string[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: PAGE, offset })
    if (error) throw error
    for (const item of data) {
      const path = `${prefix}/${item.name}`
      if (item.id === null) files.push(...(await listAll(admin, path)))
      else files.push(path)
    }
    if (data.length < PAGE) return files
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'Not signed in' }, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  })
  const {
    data: { user },
  } = await caller.auth.getUser()
  if (!user) return json({ error: 'Not signed in' }, 401)

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  try {
    const files = await listAll(admin, user.id)
    for (let i = 0; i < files.length; i += 100) {
      const { error } = await admin.storage.from(BUCKET).remove(files.slice(i, i + 100))
      if (error) throw error
    }
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
    return json({ deleted: true, files: files.length })
  } catch (error) {
    console.error('delete-account failed', user.id, error)
    return json({ error: 'Deletion failed' }, 500)
  }
})

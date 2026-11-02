export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').first();
    if (!row) return Response.json(null, { headers: { 'Cache-Control': 'no-store' } });
    return new Response(row.state_json, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: 'อ่านฐานข้อมูลไม่ได้', detail: String(error) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    if (!data || !Array.isArray(data.metrics)) {
      return Response.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }
    const json = JSON.stringify(data);
    await env.DB.prepare(`INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`).bind(json).run();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: 'บันทึกข้อมูลไม่สำเร็จ', detail: String(error) }, { status: 500 });
  }
}

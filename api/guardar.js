// api/guardar.js — guarda el dashboard comprimido y devuelve un id corto
const crypto = require('crypto');
module.exports = async function (req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ error: 'metodo' }); }
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { return res.status(500).json({ error: 'almacen no configurado' }); }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const cadena = body && body.cadena;
  if (typeof cadena !== 'string' || cadena.length < 10 || cadena.length > 900000) {
    return res.status(400).json({ error: 'datos no validos' });
  }
  const id = crypto.randomBytes(5).toString('base64url');
  const dias = 180;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', 'dash:' + id, cadena, 'EX', dias * 86400])
  });
  if (!r.ok) { return res.status(502).json({ error: 'fallo al guardar' }); }
  return res.status(200).json({ id });
};

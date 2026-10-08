// api/obtener.js — devuelve la cadena comprimida a partir del id
module.exports = async function (req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const id = String((req.query && req.query.id) || '');
  if (!url || !token) { return res.status(500).json({ error: 'almacen no configurado' }); }
  if (!/^[A-Za-z0-9_-]{4,20}$/.test(id)) { return res.status(400).json({ error: 'id no valido' }); }
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', 'dash:' + id])
  });
  if (!r.ok) { return res.status(502).json({ error: 'fallo al leer' }); }
  const j = await r.json();
  if (!j.result) { return res.status(404).json({ error: 'no existe' }); }
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  return res.status(200).json({ cadena: j.result });
};

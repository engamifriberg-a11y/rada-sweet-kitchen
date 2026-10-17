/**
 * הגבלת קצב בזיכרון המופע.
 *
 * בסביבה ללא שרת כל מופע סופר לעצמו, ולכן זו האטה של ניסיונות ניחוש —
 * לא חסימה מוחלטת. לחסימה אמיתית צריך מונה משותף.
 */

const buckets = new Map();

export function hit(key, limit, windowMs) {
  const now = Date.now();
  const list = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (list.length >= limit) {
    buckets.set(key, list);
    const retryMs = windowMs - (now - list[0]);
    return { ok: false, retrySec: Math.max(1, Math.ceil(retryMs / 1000)) };
  }

  list.push(now);
  buckets.set(key, list);

  // ניקוי עצל כדי שהמפה לא תגדל ללא גבול
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }
  return { ok: true };
}

export function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// src/utils/parseNearby.js
export function parseNearby(html) {
  if (!html) return { pois: [] };

  const div = document.createElement('div');
  div.innerHTML = html;

  // Gather all <p> blocks into one string with <br> separators
  const all = Array.from(div.querySelectorAll('p'))
    .map(p => p.innerHTML)
    .join('<br/>');

  // Drop everything after the airports heading (we don't want airports)
  const beforeAirports = all.split(/The nearest airports are:/i)[0] || all;

  // Split lines on <br> and clean
  const rawLines = beforeAirports
    .split(/<br\s*\/?>/i)
    .map(s => s.replace(/<\/?p>/gi, '').trim())
    .filter(Boolean);

  // Keep only lines that look like "Name - 0.4 km / 0.3 mi"
  const lines = rawLines.filter(l => /-\s*[\d.,]+\s*km\s*\/\s*[\d.,]+\s*mi/i.test(l));

  const pois = lines.map(l => {
    const m = l.match(/^(.*?)\s*-\s*([\d.,]+)\s*km\s*\/\s*([\d.,]+)\s*mi/i);
    if (!m) return null;
    return {
      name: m[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(),
      km: m[2],
      mi: m[3],
    };
  }).filter(Boolean);

  return { pois };
}

// Fetch contribution data and generate snake SVG
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse contribution grid from GitHub's HTML
function parseContributions(html) {
  const rects = [];
  const regex = /<td[^>]*data-level="(\d)"[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    rects.push(parseInt(match[1]));
  }
  
  // Also try to get data-date for proper positioning
  const levels = [];
  const tdRegex = /data-level="([0-4])"/g;
  while ((match = tdRegex.exec(html)) !== null) {
    levels.push(parseInt(match[1]));
  }
  
  return levels;
}

async function main() {
  const username = 'UnPendejoHola';
  const html = await fetch(`https://github.com/users/${username}/contributions`);
  const levels = parseContributions(html);
  
  // Colors
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  const cellSize = 12;
  const cellGap = 3;
  const weeks = Math.ceil(levels.length / 7);
  const width = weeks * (cellSize + cellGap) + 50;
  const height = 7 * (cellSize + cellGap) + 100;
  
  // Generate dark SVG snake
  let svgDark = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0d1117"/>
  <g transform="translate(20, 30)">\n`;
  
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      if (idx >= levels.length) continue;
      const level = levels[idx];
      const x = w * (cellSize + cellGap);
      const y = d * (cellSize + cellGap);
      svgDark += `    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${colors[level]}" />\n`;
    }
  }
  
  svgDark += `  </g>
</svg>`;

  // Light SVG - same but white bg
  const lightColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  let svgLight = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <g transform="translate(20, 30)">\n`;
  
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      if (idx >= levels.length) continue;
      const level = levels[idx];
      const x = w * (cellSize + cellGap);
      const y = d * (cellSize + cellGap);
      svgLight += `    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${lightColors[level]}" />\n`;
    }
  }
  
  svgLight += `  </g>
</svg>`;
  
  require('fs').writeFileSync('github-contribution-grid-snake-dark.svg', svgDark);
  require('fs').writeFileSync('github-contribution-grid-snake.svg', svgLight);
  console.log(`Generated snake SVGs with ${levels.length} contribution cells`);
  console.log(`Weeks: ${weeks}`);
}

main().catch(console.error);

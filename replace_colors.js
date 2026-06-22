const fs = require('fs');
const path = require('path');

// Target frontend src directory
const srcDirectory = path.join(__dirname, 'TheOh', 'theoh-breakfast', 'src');

const replacements = [
  // Brand Dark Green -> Primary
  { search: /#004700/g, replace: 'var(--primary)' },
  // Darker Brand Green (Hover) -> Primary Hover
  { search: /#003300/g, replace: 'var(--primary-hover)' },
  // Alternate Brand Green -> Primary Hover
  { search: /#005500/g, replace: 'var(--primary-hover)' },
  { search: /#005a00/g, replace: 'var(--primary-hover)' },
  // Light green highlights -> Accent Light
  { search: /#E8F5E9/g, replace: 'var(--accent-light)' },
  // Success/Green text highlights -> Accent Dark
  { search: /#2E7D32/g, replace: 'var(--accent-dark)' },
  // Accent borders -> Accent
  { search: /#A5D6A7/g, replace: 'var(--accent)' },
  // Orange hovers -> Primary Hover
  { search: /#B45014/g, replace: 'var(--primary-hover)' },
];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (['node_modules', '.git', '.vercel', 'dist'].includes(file)) {
      continue;
    }

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkAndReplace(filePath);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (!['.js', '.jsx', '.json', '.html', '.css'].includes(ext)) {
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      for (const rep of replacements) {
        content = content.replace(rep.search, rep.replace);
      }

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated colors in: ${filePath}`);
      }
    }
  }
}

console.log(`Replacing color codes in: ${srcDirectory}`);
walkAndReplace(srcDirectory);
console.log('Color replacements completed successfully.');

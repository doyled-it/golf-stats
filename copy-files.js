import { copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure dist directory exists
try {
  mkdirSync('dist', { recursive: true });
} catch (e) {}

// Copy HTML, CSS, and data files to dist
const filesToCopy = [
  { src: 'src/index.html', dest: 'dist/index.html' },
  { src: 'src/styles.css', dest: 'dist/styles.css' },
  { src: 'ghin-data.json', dest: 'dist/ghin-data.json' },
  { src: 'ghin-handicap-history.json', dest: 'dist/ghin-handicap-history.json' }
];

filesToCopy.forEach(({ src, dest }) => {
  try {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (e) {
    console.error(`Error copying ${src}:`, e.message);
  }
});

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const src = './src';
const files = readdirSync(src, { recursive: true })
  .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
  .map(f => join(src, f));

const typeNames = [
  'ErrorInfo', 'ReactNode', 'AlertColor', 'AxiosInstance',
  'AxiosRequestConfig', 'AxiosResponse'
];

files.forEach(file => {
  let code = readFileSync(file, 'utf8');
  typeNames.forEach(t => {
    const re = new RegExp(`import\\s+\\{([^}]*\\b${t}\\b[^}]*)\\}\\s+from\\s+['"]([^'"]+)['"]`, 'g');
    code = code.replace(re, `import type {$1} from '$2'`);
  });
  writeFileSync(file, code);
});
#!/usr/bin/env node

/**
 * Auto-generate 00_STRUCTURE.md from actual directory structure
 * Eliminates manual maintenance and prevents hallucinated paths
 * 
 * Usage: node scripts/generate-structure.js
 */

const fs = require('fs');
const path = require('path');

// Directories and files to completely ignore
const IGNORE = new Set([
    'node_modules', '.git', '.next', 'dist', 'build', '.turbo',
    '.vercel', 'coverage', '.DS_Store', 'Thumbs.db',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'onotape-genesis-admin-studio' // Legacy folder
]);

// Only scan these top-level directories
const SCAN_DIRS = [
    'DB_Module', '.agent', 'app', 'components',
    'context', 'hooks', 'lib', 'public', 'utils', 'scripts'
];

// Important root files to include
const ROOT_FILES = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
    'postcss.config.mjs', 'eslint.config.mjs', 'tailwind.config.ts',
    'Dockerfile', 'docker-compose.yml', '.dockerignore', '.env.example',
    'README.md', 'overview.md', 'SetupReport.md'
];

function shouldIgnore(name) {
    return IGNORE.has(name) || (name.startsWith('.') && name !== '.agent');
}

function buildTree(dir, indent = '', depth = 0) {
    const MAX_DEPTH = 6; // Prevent infinite recursion
    if (depth > MAX_DEPTH) return [];

    let lines = [];

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true })
            .filter(item => !shouldIgnore(item.name))
            .sort((a, b) => {
                // Directories first, then alphabetically
                if (a.isDirectory() !== b.isDirectory()) {
                    return a.isDirectory() ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

        items.forEach((item, idx) => {
            const itemPath = path.join(dir, item.name);
            const isLastItem = idx === items.length - 1;
            const itemPrefix = indent + (isLastItem ? '└── ' : '├── ');
            const childIndent = indent + (isLastItem ? '    ' : '│   ');

            if (item.isDirectory()) {
                lines.push(`${itemPrefix}${item.name}/`);
                lines.push(...buildTree(itemPath, childIndent, depth + 1));
            } else {
                lines.push(`${itemPrefix}${item.name}`);
            }
        });
    } catch (err) {
        console.error(`❌ Error reading ${dir}:`, err.message);
    }

    return lines;
}

function generateStructure(rootDir) {
    const lines = [];

    // Add root-level important files first
    ROOT_FILES.forEach((file, idx) => {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
            const isLast = idx === ROOT_FILES.length - 1 && SCAN_DIRS.length === 0;
            lines.push(`${isLast ? '└── ' : '├── '}${file}`);
        }
    });

    // Add important directories
    SCAN_DIRS.forEach((dir, idx) => {
        const dirPath = path.join(rootDir, dir);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            const isLast = idx === SCAN_DIRS.length - 1;
            lines.push(`${isLast ? '└── ' : '├── '}${dir}/`);
            lines.push(...buildTree(dirPath, isLast ? '    ' : '│   ', 1));
        }
    });

    return lines;
}

function main() {
    const rootDir = path.resolve(__dirname, '..');
    const outputPath = path.join(rootDir, 'DB_Module', '_DOCS', '00_STRUCTURE.md');

    console.log('🔍 Scanning project structure...');
    const treeLines = generateStructure(rootDir);

    const content = `# Project Structure Map

**AUTO-GENERATED** by \`scripts/generate-structure.js\`  
**DO NOT EDIT MANUALLY** - This file is regenerated before each planning session.  
**Last Updated:** ${new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })}

---

## Purpose
This file provides the current valid file tree to prevent AI hallucination of paths.
It is automatically generated from the actual directory structure.

## Directory Structure

\`\`\`
MyHack/
${treeLines.join('\n')}
\`\`\`

---

## Maintenance

- **Auto-generated:** Run \`npm run gen:structure\` or \`node scripts/generate-structure.js\`
- **Pre-planning hook:** This should run automatically before Planner agent execution
- **Ignored items:** node_modules, .git, .next, dist, build, .turbo, .vercel, coverage
- **Scanned directories:** ${SCAN_DIRS.join(', ')}

## Integration with Dual-Brain System

The Planner agent should always read this file first to ensure accurate path references.
This eliminates the need for manual updates and prevents outdated structure information.
`;

    fs.writeFileSync(outputPath, content, 'utf8');

    console.log(`✅ Generated: ${outputPath}`);
    console.log(`📊 Total lines: ${content.split('\n').length}`);
    console.log(`📁 Directories scanned: ${SCAN_DIRS.length}`);
}

// Execute
try {
    main();
} catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}

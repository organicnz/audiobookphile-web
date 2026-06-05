const fs = require('fs');
const path = require('path');

const ignoreDirs = ['node_modules', '.next', '.git', 'cypress', 'supabase', '.trunk', '.vercel', '.kiro', '.snapshots', 'scratch'];
const ignoreFiles = ['bun.lock', 'tsconfig.tsbuildinfo', 'rename.js'];

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (ignoreDirs.includes(file) || ignoreFiles.includes(file)) return;
        const filePath = path.join(dir, file);
        try {
            const stat = fs.lstatSync(filePath); // Use lstat to not follow broken symlinks
            if (stat && stat.isDirectory()) {
                results = results.concat(walkDir(filePath));
            } else if (stat.isFile()) {
                results.push(filePath);
            }
        } catch (e) {}
    });
    return results;
}

const files = walkDir('./');
let count = 0;
files.forEach(file => {
    // Only process text files
    const ext = path.extname(file);
    const validExts = ['.ts', '.tsx', '.js', '.json', '.md', '.yml', '.yaml', '.sh', '.txt', '.mjs', '.cjs'];
    if (!validExts.includes(ext) && ext !== '') return;
    
    try {
        let content = fs.readFileSync(file, 'utf8');
        const oldContent = content;
        content = content.replace(/audiobookshelf/g, 'audiobookphile');
        content = content.replace(/Audiobookshelf/g, 'Audiobookphile');
        content = content.replace(/AUDIOBOOKSHELF/g, 'AUDIOBOOKPHILE');
        if (oldContent !== content) {
            fs.writeFileSync(file, content);
            count++;
            console.log(`Updated ${file}`);
        }
    } catch (e) {
        // skip binary files or errors
    }
});
console.log(`Replaced in ${count} files.`);

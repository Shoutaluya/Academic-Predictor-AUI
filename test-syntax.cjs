const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatches) {
  scriptMatches.forEach((script, i) => {
    const code = script.replace(/<\/?script>/g, '');
    fs.writeFileSync(`temp_script_${i}.js`, code);
    try {
      require('child_process').execSync(`node -c temp_script_${i}.js`, {stdio: 'pipe'});
      console.log(`Script ${i} is valid.`);
    } catch (e) {
      console.log(`Script ${i} has errors:`, e.stderr ? e.stderr.toString() : (e.stdout ? e.stdout.toString() : e.message));
    }
  });
}

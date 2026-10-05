import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const approvedPhotos = {
  'public/images/solarcity/power-one-pvi-5000-outd-us-z-front.jpg': '4e40ea9c5a48528e18fca71b1739125451aa13ffaf3a64a20ca30aa392d86d12',
  'public/images/solarcity/original-solarcity-collector.jpg': 'b7e5a39567b5ceefb6b18b45c4f061c2055a67c325d438450137a3a055e81254',
};
const rules = [
  ['private home path', /\/home\/[a-zA-Z0-9_-]+\//],
  ['private network address', /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/],
  ['private hostname', /\b[\w-]+\.(?:lan|daltschu)(?![\w.])/],
  ['Digi radio identity', new RegExp('0013' + 'a200' + '[a-f0-9]{8}', 'i')],
  ['credential', /(?:gh[pousr]_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/],
];
const failures = [];
for (const file of files) {
  if (/(?:^|\/)(?:\.env(?:\..*)?|.*\.local\..*|.*\.(?:db|sqlite3?|pcap|pcapng|log))$/.test(file)) {
    failures.push(`${file}: runtime or secret file`);
    continue;
  }
  const bytes = readFileSync(file);
  if (/\.(?:jpe?g|png|webp)$/i.test(file)) {
    if (createHash('sha256').update(bytes).digest('hex') !== approvedPhotos[file]) failures.push(`${file}: photo needs privacy review and metadata removal`);
    continue;
  }
  if (bytes.includes(0)) {
    failures.push(`${file}: unreviewed binary file`);
    continue;
  }
  for (const [name, expression] of rules) {
    if (expression.test(bytes.toString('utf8'))) failures.push(`${file}: ${name}`);
  }
}
if (failures.length) throw new Error(`Publication checks failed:\n${failures.join('\n')}`);
console.log(`Publication checks passed (${files.length} source files).`);

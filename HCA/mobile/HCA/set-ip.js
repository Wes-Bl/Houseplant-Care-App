import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { networkInterfaces } from 'os';

const nets = networkInterfaces();
let ip = '';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      ip = net.address;
    }
  }
}

writeFileSync('.env', `EXPO_PUBLIC_API_URL=http://${ip}:3000`);
console.log(`Set API URL to http://${ip}:3000`);
//sets IP for .env to use to connect to backend.

const backend = spawn('node', ['--env-file=.env', 'src/index.js'], {
  cwd: '../../backend',
  stdio: 'inherit',
  detached: true
});

backend.unref();
console.log('Backend started!');
setTimeout(() => process.exit(0), 1000);
//launch backend.

//I HATE NETWORKING I HATE NETWORKING I HATE NETWORKING



//Ị̶̡̨̳̦̘̟͉̬̤̺̞̺̹̰̂͛̀̌̈́̑̓͌͘̕ͅ  ̸̲̭̼̰̆̿͛̋̎͌͌̆́̃Ḫ̸̡̗̰͍̭͕̤̭̙̟̝̖͂͂̍̓͛̈́̎̿ Ą̴̛̛̖̭̂͗̀̿̌̂̈́̀̉̌̄̋̈́̚ T̵̢̢̹̱̭͇͍̬̖̘̩͎̰̝̘̪̑̐̎̕̕ͅ E̷̢̨̺̯̟̦̗̥̥̗͉̝͍͈̾̓̈́̍̈͂̔̆ͅͅͅ ̵̢̧͔̯̬͙͉̬͚̊̃̂̀̽̑̾͌̒̅̈́̍͝  Ṋ̶̝̤̲̘̮̻̈̅̓̔͗͑̀̔̇̐̽́̃͘̕̚͠ͅ E̸̮͖̳̣̹̮͖̓̋̑̓̆ Ţ̶̝͍̙̱͓͙͍̥̥͋ Ŵ̸̡͕͖̗̬͇͙͚͑̆̈́̈́ O̶̧̤͙̞̪̪̓͌̑̀̌̃͒̕ R̵͉̯͔̙͖̗̦̘͗͋̌ K̸̢̉͑̈͜ I̴̺͋̊͊ Ņ̸̨̮̝͕̜̥͖̲͈̤͎̣̣̫̺̫́͒͒̃̀̇̏͋͒̾̽͘̕͠ G̸̰̺̦̀̿̽̊̓̂̾̿͐́͊͊̕̕


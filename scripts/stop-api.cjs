/* eslint-disable */
// Dev utility: stops the locally running API so Prisma can replace its engine DLL.
const { execSync } = require('node:child_process');

const command = 'Get-CimInstance Win32_Process -Filter "name=\'node.exe\'" | Select-Object ProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation';
const list = execSync(`powershell.exe -NoProfile -Command "${command}"`, { encoding: 'utf8' });
const killed = [];
for (const line of list.split(/\r?\n/)) {
  if (!/dist[\\/]main\.js/.test(line)) continue;
  const cells = line.trim().split(',');
  const pid = cells[cells.length - 1].replace(/"/g, '');
  if (!/^\d+$/.test(pid)) continue;
  try {
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
    killed.push(pid);
  } catch (error) {
    console.log(`could not kill ${pid}: ${error.message}`);
  }
}
console.log(killed.length ? `stopped API pids: ${killed.join(', ')}` : 'no API process found');

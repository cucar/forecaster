import { readFileSync } from 'fs';
import Brain from '../Brain.js';

const gldDaily = JSON.parse(readFileSync('./tests/gld_daily.json', 'utf8'));
const gdxIntraDay = JSON.parse(readFileSync('./tests/gdx_intraday.json', 'utf8'));

console.log(gldDaily);

const brain = new Brain();


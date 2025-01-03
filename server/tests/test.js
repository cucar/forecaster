import { readFileSync } from 'fs';
import Brain from '../Brain.js';
import SlopeEncoder from '../SlopeEncoder.js';

// convert API data to time series data
// const key = 'Time Series (5min)';
const key = 'Time Series (Daily)';
// const file = 'gdx_intraday';
// const file = 'gld_daily';
// const file = 'paas_daily';
const file = 'aem_daily';
const fileData = JSON.parse(readFileSync(`./tests/${file}.json`, 'utf8'));
const timeSeriesData = Object.values(fileData[key]).slice(0, 1000).toReversed().map(data => parseFloat(data['4. close']));

// prepare new brain and encoder to learn the time series data and forecast the next value
const brain = new Brain();
const encoder = new SlopeEncoder(brain);
const forecast = encoder.activate(timeSeriesData);
console.log('forecast', forecast);

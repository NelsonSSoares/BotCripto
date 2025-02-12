// Axios serve para fazer requisições HTTP para a API da Binance
const axios = require('axios');
// Define valor de compra e venda de BTC
const SYMBOL = 'BTCUSDT';
const BUY_PRICE = 95100; 
const SELL_PRICE = 97100;
const PERIOD = 14;
const API_URL_TESTE =  "https://api.binance.com"; //`https://testnet.binance.vision`;
const API_URL = `https://api.binance.com`;

let isOpened = false;

function avarage(prices, period, startIndex){
    let gains = 0, losses = 0;
    for(let i =0; i < period && (i + startIndex) < prices.length ; i++){
        const diff = prices[i + startIndex] - prices[i + startIndex - 1];
        if(diff >= 0 ){
            gains += diff;
        }else{
            losses += Math.abs(diff);
        }

        let avgGains = gains / period;
        let avgLosses = losses / period;
        return {avgGains, avgLosses};
    }
}

function RSI(prices, period){
    let avgGains = 0, avgLosses = 0;

    for(let i = 1; i < prices.length; i++){

        let newAvarges = avarage(prices, period, i);

        if(i === 1){
            avgGains = newAvarges.avgGains;
            avgLosses = newAvarges.avgLosses;
            continue;
        }

        avgGains = ((avgGains * (period - 1)) + newAvarges.avgGains) / period;
        avgLosses = ((avgLosses * (period - 1)) + newAvarges.avgLosses) / period;
    }
    const rs = avgGains / avgLosses;
    return 100 - (100 / (1 + rs)); 
}

async function start(){
  const {data} = await axios.get(API_URL_TESTE+`/api/v3/klines?limit=1000&interval=15m&symbol=${SYMBOL}`)
  const candle = data[data.length - 1]
  const lastPrice = parseFloat(candle[4]);
  const prices = data.map(k => parseFloat(k[4]));
  const rsi = RSI(prices, PERIOD);

    //console.clear();
    console.log("Price: " + lastPrice);
    console.log("RSI: " + rsi);

    let compras = 0, vendas = 0;


  if(rsi < 30  && isOpened == false){
    console.log("Sobrevendido, hora de comprar");
    console.log("Comprando...");
        
    isOpened = true;
    compras++;
    console.log("Compras: " + compras);

  }else if(rsi > 70 && isOpened == true){
    console.log("Sobrecomprado, hora de vender");
    console.log("Vendendo...");
    isOpened = false;

    vendas++;
    console.log("Vendas: " + vendas);

  }else{
    console.log("Aguardando...");
  }
}
setInterval(start, 3000);

start();
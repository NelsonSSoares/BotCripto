// Axios serve para fazer requisições HTTP para a API da Binance
const axios = require('axios');
const apiKeys = require('./environments');
const crypto = require('crypto');
// Define valor de compra e venda de BTC
const SYMBOL = 'BTCUSDT';
const PERIOD = 14;
const QUANTITY = 0.001;

// API_URLS
const API_URL_TESTE = `https://testnet.binance.vision`;
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

async function newOrder(symbol, quantity, side){
    const order = {symbol, quantity, side};
    order.type = "MARKET";
    order.timestamp = Date.now();
    
    // API_KEY e API_SECRET são as chaves da sua conta na Binance, e não pode ser compartilhada 
    //no caso de teste é necessário criar uma conta na testnet binance e pegar as chaves de teste
    const signature = crypto.createHmac('sha256', apiKeys.SECRET_KEY)
    .update(new URLSearchParams(order).toString())
    .digest('hex');

    order.signature = signature;

    try {
        const {data} = await axios.post(API_URL_TESTE + '/api/v3/order', new URLSearchParams(order).toString(),
         {
            headers: {
                'X-MBX-APIKEY': apiKeys.API_KEY
            }
         });
         console.log(data);
         
    } catch (error) {
        console.error(error.response.data);
        
    }
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
    
    //await newOrder(SYMBOL, QUANTITY, 'BUY');
 
    if(rsi < 30  && isOpened == false){
        console.log("Sobrevendido, hora de comprar");
            
        isOpened = true;
    
        newOrder(SYMBOL, QUANTITY, 'BUY');

      }else if(rsi > 70 && isOpened == true){

        console.log("Sobrecomprado, hora de vender");
        newOrder(SYMBOL, QUANTITY, 'SELL');
        isOpened = false;
    
      }else{
        console.log("Aguardando RSI ser menor que 30 ou maior que 70");
      }


}
setInterval(start, 3000);

start();




//   if(rsi < 30  && isOpened == false){
//     console.log("Sobrevendido, hora de comprar");
//     console.log("Comprando...");
        
//     isOpened = true;
//     compras++;
//     console.log("Compras: " + compras);

//   }else if(rsi > 70 && isOpened == true){
//     console.log("Sobrecomprado, hora de vender");
//     console.log("Vendendo...");
//     isOpened = false;

//     vendas++;
//     console.log("Vendas: " + vendas);

//   }else{
//     console.log("Aguardando...");
//   }
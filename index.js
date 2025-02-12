// Axios serve para fazer requisições HTTP para a API da Binance
const axios = require('axios');
// Define valor de compra e venda de BTC
const SYMBOL = 'BTCUSDT';
const BUY_PRICE = 95100; 
const SELL_PRICE = 97100;

const API_URL_TESTE = `https://testnet.binance.vision`;

let isOpened = false;

async function start(){
  const {data} = await axios.get(API_URL_TESTE+`/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
  const candle = data[data.length - 1]
  const price = parseFloat(candle[4]);

  //console.clear();
  console.log("Price: " + price);

  if(price <= BUY_PRICE && isOpened == false){
    console.log("Comprando...");
    isOpened = true;

  }else if(price >= SELL_PRICE && isOpened == true){
    console.log("Vendendo...");
    isOpened = false;

  }else{
    console.log("Aguardando...");
  }
}
setInterval(start, 3000);

start();
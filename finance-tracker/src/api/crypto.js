import { CRYPTO_API_BASE_URL } from "../config/apiConfig";

const BASE_URL = CRYPTO_API_BASE_URL;

/**
 * Fetches live price, 24h change, and a 7-day sparkline for a list of coin ids.
 * Docs: https://docs.coingecko.com/reference/coins-markets — free public tier, no API key required.
 *
 * Expected response shape (your backend should match this if proxying):
 * [{ id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 65000, change24h: 1.2,
 *    sparkline: [64000, 64200, ...] }, ...]
 */
export async function getCryptoMarkets(ids, vsCurrency = "usd") {
  const url =
    `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&ids=${ids.join(",")}` +
    `&sparkline=true&price_change_percentage=24h`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("CoinGecko rate limit hit. Please wait a moment and retry.");
    }
    throw new Error(`CoinGecko request failed (${res.status}).`);
  }

  const data = await res.json();
  const byId = new Map(data.map((coin) => [coin.id, coin]));

  const coins = [];
  const missing = [];

  ids.forEach((id) => {
    const coin = byId.get(id);
    if (!coin) {
      missing.push(id);
      return;
    }
    coins.push({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      sparkline: coin.sparkline_in_7d?.price ?? [],
    });
  });

  if (coins.length === 0) {
    throw new Error("No price data found for the requested coins.");
  }

  return { coins, missing };
}

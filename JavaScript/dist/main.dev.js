"use strict";

// 2019年第1四半期〜2020年第4四半期 tokyo
var realEstaeInTokyo = fetch("https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=20191&to=20204&area=13");
console.log(realEstaeInTokyo);
var jsonResponse = realEstaeInTokyo.then(function (response) {
  // jsonメソッドはサーバーからのレスポンスをJSONに変換します。
  // jsonメソッドもpromiseオブジェクトを返します。(jsonに変換することに成功したか失敗したか)
  return response.json();
});
jsonResponse.then(function (data) {
  console.log(data);
});
config = {
    tradeInfo : document.getElementById("trade-real-estate"),
    prefectureCode : document.getElementById("prefectureSelect"),
    cityCode : document.getElementById("citySelect"),
    searchBlock : document.getElementById("search-block"),
}
let prefectureCode = {
    "01" : "北海道",
    "25" : "滋賀県",
    "02" : "青森県",
    "26" : "京都府",
    "03" : "岩手県", 
    "27" : "大阪府",
    "04" : "宮城県",
    "28" : "兵庫県",
    "05" : "秋田県",
    "29" : "奈良県",
    "06" : "山形県", 
    "30" : "和歌山県",
    "07" : "福島県",	
    "31" : "鳥取県",
    "08" : "茨城県",	
    "32" : "島根県",
    "09" : "栃木県", 
    "33" : "岡山県",
    "10" : "群馬県",	
    "34" : "広島県",
    "11" : "埼玉県",	
    "35" : "山口県",
    "12" : "千葉県",	
    "36" : "徳島県",
    "13" : "東京都",
    "37" : "香川県",
    "14" : "神奈川県",	
    "38" : "愛媛県",
    "15" : "新潟県",	
    "39" : "高知県",
    "16" : "富山県",	
    "40" : "福岡県",
    "17" : "石川県",	
    "41" : "佐賀県",
    "18" : "福井県",	
    "42" : "長崎県",
    "19" : "山梨県",	
    "43" : "熊本県",
    "20" : "長野県",	
    "44" : "大分県",
    "21" : "岐阜県",	
    "45" : "宮崎県",
    "22" : "静岡県",	
    "46" : "鹿児島県",
    "23" : "愛知県",	
    "47" : "沖縄県",
    "24" : "三重県",
}

// APIで取得したcityCodeと地区名を紐付け
let cityCode = {};

class RetrievalInfo{
    constructor(start, end, prefecture, city) {
        this.start = start;
        this.end = end;
        this.prefecture = prefecture;
        this.city = city;
    }
}
function getRetrievalInfo() {
    let form = document.getElementById("form");
    let start = form.querySelectorAll(`input[name="periodStart"]`)[0].value;
    let end = form.querySelectorAll(`input[name="periodEnd"]`)[0].value;
    
    if (parseInt(start) < 20053 || parseInt(end) < 20053 || parseInt(start) > parseInt(end)){
        form.querySelectorAll(`input[name="periodStart"]`)[0].value = "";
        form.querySelectorAll(`input[name="periodEnd"]`)[0].value = "";
        alert("unsupported value");
    }
    else {
        let retrievalInfo = new RetrievalInfo(
            form.querySelectorAll(`input[name="periodStart"]`)[0].value,
            form.querySelectorAll(`input[name="periodEnd"]`)[0].value,
            config.prefectureCode.value,
            config.cityCode.value
        );
        config.searchBlock.classList.add("d-none");
        getTransactionHistory(retrievalInfo);
    }
}
class codeSelect{
    // 県選択ボタン作成関数
    static prefectureSelect(){
        const prefectureCodeTag = config.prefectureCode;
        for (let i = 1; i < 48; i++){
            let option = document.createElement("option");
            option.classList.add("prefectureCode");
            if (i < 10){
                option.value = "0" + i;
            }
            else {
                option.value = i;
            }
            option.innerHTML = prefectureCode[option.value];
            prefectureCodeTag.append(option);
        }
    }

    // 市区町村選択ボタン作成関数
    static getCityCodeAndSelectBtn(prefectureCode) {
        let url = "https://www.land.mlit.go.jp/webland/api/CitySearch?area=" + prefectureCode;
        const cityCodeselectTag = config.cityCode;
        let areaCode = fetch(url).then(resuponce=>resuponce.json()).then(function(data){
            let areaCodeList = data["data"];
            cityCode = {};
            for (let i = 0; i < areaCodeList.length; i++){
                let currentCityCode = areaCodeList[i];
                let option = document.createElement("option");
                option.value = currentCityCode["id"];
                option.innerHTML = currentCityCode["name"];
                cityCode[currentCityCode["id"]] = currentCityCode["name"];
                cityCodeselectTag.append(option);
            }
        });
    }

    // 県が選択されたら起動する関数
    static cityCodeSelect(){
        let prefectureCodeNode = document.querySelectorAll("#prefectureSelect");
        for (let i = 0; i < prefectureCodeNode.length; i++){
            prefectureCodeNode[i].addEventListener("change", function(){
                document.getElementById("citySelect").innerHTML = 
                `
                    <option value="">選択してください</option>
                `;
                let cityCode = prefectureCodeNode[i].value;
                if (cityCode != "0"){
                    codeSelect.getCityCodeAndSelectBtn(cityCode);
                }
            })
        }
    }
}

function getTransactionHistory(RetrievalInfo) {
    let tradePriceAndPrefecture = document.createElement('div');
    let url = 
    `
        https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=${RetrievalInfo.start}&to=${RetrievalInfo.end}&area=${RetrievalInfo.prefecture}&city=${RetrievalInfo.city}
    `;
    let transactionHistory = fetch(url).then(resuponce=>resuponce.json()).then(function(data){
        let tradePriceList = [];
        let floorAreaRatioList = [];
        let tardePriceByLayout = {};
        let tradeList = data["data"];
        for (let i = 0; i < tradeList.length; i++){
            let detail = tradeList[i];
            if (detail["FloorPlan"] != undefined && detail["TradePrice"] != undefined){
                if (tardePriceByLayout[detail["FloorPlan"]]){
                    tardePriceByLayout[detail["FloorPlan"]] = Math.max(tardePriceByLayout[detail["FloorPlan"]], parseInt(detail["TradePrice"]));
                }
                else {
                    tardePriceByLayout[detail["FloorPlan"]] = parseInt(detail["TradePrice"]);
                }
            }
            tradePriceList.push(parseInt(detail["TradePrice"]));
            floorAreaRatioList.push(parseInt(detail["FloorAreaRatio"]));
            
        }
        tradePriceAndPrefecture.append(tradeInfoPageTitle(RetrievalInfo), tradePricebyLayoutTable(tardePriceByLayout), maxOrMinTradePriceInCity(tradePriceList, "max"), maxOrMinTradePriceInCity(tradePriceList, "min"));
        config.tradeInfo.append(tradePriceAndPrefecture);
    });
}

function tradeInfoPageTitle(RetrievalInfo) {
    let pageTitleDiv = document.createElement("div");
    let tradeStart = RetrievalInfo.start;
    let tradeEnd = RetrievalInfo.end;
    pageTitleDiv.innerHTML = 
    `
        <h3>検索結果</h3>
        <h4>
            ${prefectureCode[RetrievalInfo.prefecture]} <br> 
            ${cityCode[RetrievalInfo.city]}<br>
            ${tradeStart.substring(0,tradeStart.length - 1)}年第${tradeStart.substring(tradeStart.length-1)}四半期 ~ ${tradeEnd.substring(0, tradeEnd.length - 1)}年第${tradeEnd.substring(tradeEnd.length-1)}四半期
        </h4>
    `
    return pageTitleDiv;
}

function tradePricebyLayoutTable(tradePrice){
    let container = document.createElement('div');
    container.classList.add("d-flex", "row", "mt-3");
    for (let room in tradePrice){
        container.innerHTML += 
        `
        <div class="col-md-6">
            ${room}
        </div>
        <div class="col-md-6">
            ¥${new Intl.NumberFormat().format(tradePrice[room])}
        </div>
        `
    }
    return container;
}

function maxOrMinTradePriceInCity(tradePriceList, maxOrmin){
    let container = document.createElement('div');
    container.classList.add("d-flex", "mt-3", "row");
    let price = maxOrmin == "max" ? maximumTradePrice(tradePriceList) : minimumTradePrice(tradePriceList);
    let title = maxOrmin == "max" ? "最高値" : "最安値";
    container.innerHTML = 
    `
        <div class="col-md-6">
            ${title}
        </div>
        <div class="col-md-6">
            ¥${new Intl.NumberFormat().format(price)}
        </div>
    `
    return container;
}

function maximumTradePrice(tradePriceList){
    return tradePriceList.reduce(function(a,b){
        return Math.max(a,b);
    })
}

function minimumTradePrice(tradePriceList){
    return tradePriceList.reduce(function(a,b){
        return Math.min(a,b);
    })
}


codeSelect.prefectureSelect(); 
codeSelect.cityCodeSelect();




// Area: "45"
// BuildingYear: "平成23年"
// CityPlanning: "商業地域" 
// CoverageRatio: "80"
// DistrictName: "六本木"
// FloorAreaRatio: "700"
// FloorPlan: "１ＬＤＫ"
// Municipality: "港区"
// MunicipalityCode: "13103"
// Period: "2019年第１四半期"
// Prefecture: "東京都"
// Purpose: "住宅"
// Renovation: "未改装"
// Structure: "ＲＣ"
// TradePrice: "90000000"
// Type: "中古マンション等"
// Use: "住宅"


// https://www.land.mlit.go.jp/webland_english/api/TradeListSearch?from=20201&to=20202&area=05&city=05202
// https://www.land.mlit.go.jp/webland_english/api/TradeListSearch?from=20201&to=20202&area=13&city=13102

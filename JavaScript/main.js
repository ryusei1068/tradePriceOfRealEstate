config = {
    tradeInfo : document.getElementById("trade-real-estate"),
    prefectureCode : document.getElementById("prefectureSelect"),
    cityCode : document.getElementById("citySelect"),
    searchBlock : document.getElementById("search-block"),
}
let prefectureCode = {
    "01" : "Hokkaido",
    "25" : "Shiga",
    "02" : "Aomori",
    "26" : "Kyoto",
    "03" : "Iwate", 
    "27" : "Osaka",
    "04" : "Miyagi",
    "28" : "Hyogo",
    "05" : "Akita",
    "29" : "Nara",
    "06" : "Yamagata", 
    "30" : "Wakayama",
    "07" : "Fukushima",	
    "31" : "Tottori",
    "08" : "Ibaraki",	
    "32" : "Shimane",
    "09" : "Tochigi", 
    "33" : "Okayama",
    "10" : "Gunma",	
    "34" : "Hiroshima",
    "11" : "Saitama",	
    "35" : "Yamaguchi",
    "12" : "Chiba",	
    "36" : "Tokushima",
    "13" : "Tokyo",
    "37" : "Kagawa",
    "14" : "Kanagawa",	
    "38" : "Ehime",
    "15" : "Niigata",	
    "39" : "Kochi",
    "16" : "Toyama",	
    "40" : "Fukuoka",
    "17" : "Ishikawa",	
    "41" : "Saga",
    "18" : "Fukui",	
    "42" : "Nagasaki",
    "19" : "Yamanashi",	
    "43" : "Kumamoto",
    "20" : "Nagano",	
    "44" : "Oita",
    "21" : "Gifu",	
    "45" : "Miyazaki",
    "22" : "Shizuoka",	
    "46" : "Kagoshima",
    "23" : "Aichi",	
    "47" : "Okinawa",
    "24" : "Mie",
}

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
        // config.tradeInfo.append(getTransactionHistory(retrievalInfo));
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
        let url = "https://www.land.mlit.go.jp/webland_english/api/CitySearch?area=" + prefectureCode;
        const cityCodeselectTag = config.cityCode;
        let areaCode = fetch(url).then(resuponce=>resuponce.json()).then(function(data){
            let areaCodeList = data["data"];
            for (let i = 0; i < areaCodeList.length; i++){
                let currentCityCode = areaCodeList[i];
                let option = document.createElement("option");
                option.value = currentCityCode["id"];
                option.innerHTML = currentCityCode["name"];
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
                    <option value="">Please select</option>
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
    let tradePriceList = [];
    let floorAreaRatioList = [];
    let tardePriceByLayout = {};
    let url = 
    `
        https://www.land.mlit.go.jp/webland_english/api/TradeListSearch?from=${RetrievalInfo.start}&to=${RetrievalInfo.end}&area=${RetrievalInfo.prefecture}&city=${RetrievalInfo.city}
    `;
    let transactionHistory = fetch(url).then(resuponce=>resuponce.json()).then(function(data){
        let tradeList = data["data"];
        for (let i = 0; i < tradeList.length; i++){
            let detail = tradeList[i];
            if (detail["FloorPlan"] != undefined && detail["TradePrice"] != undefined){
                if (tardePriceByLayout[detail["FloorPlan"]] != undefined){
                    tardePriceByLayout[detail["FloorPlan"]] = parseInt(detail["TradePrice"]) > tardePriceByLayout[detail["FloorPlan"]] ? parseInt(detail["TradePrice"]) : tardePriceByLayout[detail["FloorPlan"]];
                }
                else {
                    tardePriceByLayout[detail["FloorPlan"]] = parseInt(detail["TradePrice"]);
                }
            }
            tradePriceList.push(parseInt(detail["TradePrice"]));
            floorAreaRatioList.push(parseInt(detail["FloorAreaRatio"]));
            
        }
        console.log(tardePriceByLayout);
    });
    // return container;
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

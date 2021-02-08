config = {
    target : document.getElementById("target"),
    prefectureCode : document.getElementById("prefectureSelect"),
    cityCode : document.getElementById("cityCodeSelect"),
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

class codeSelector{

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
        })
    }

    // 県が選択されたら起動する関数
    static cityCodeSelect(){
        let prefectureCodeNode = document.querySelectorAll("#prefectureSelect");
        for (let i = 0; i < prefectureCodeNode.length; i++){
            prefectureCodeNode[i].addEventListener("change", function(){
                document.getElementById("cityCodeSelect").innerHTML = 
                `
                    <option value="">Please select</option>
                `;
                let cityCode = prefectureCodeNode[i].value;
                if (cityCode != "0"){
                    codeSelector.getCityCodeAndSelectBtn(cityCode);
                }
            })
        }
    }
}

// 2019年第1四半期〜2020年第4四半期 tokyo
const tradeList = fetch("https://www.land.mlit.go.jp/webland_english/api/TradeListSearch?from=20201&to=20204&area=13&city=13103");

const jsonResponse = tradeList.then(function(response){
    return response.json();
});

jsonResponse.then(function(data){
    let array = data["data"];
    const target = config.target;
    for (let i = 0; i < array.length; i++){
        let detail = array[i];
        let container = document.createElement("div");
        container.innerHTML = `
        BuildingYear: ${detail["BuildingYear"]} Prefecture: ${detail["Prefecture"]} Municipality: ${detail["Municipality"]} DistrictName: ${detail["DistrictName"]} FloorAreaRatio: ¥${detail["FloorAreaRatio"]} FloorPlan: ${detail["FloorPlan"]} Period: ${detail["Period"]} TradePrice: ¥${detail["TradePrice"]}
        `
        target.append(container);
    }
});   




codeSelector.prefectureSelect();
codeSelector.cityCodeSelect();

function  initializeUserAccount() {
    
}



// 東京都内の市区町村一覧を取得例
// https://www.land.mlit.go.jp/webland/api/CitySearch?area=13


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

config = {
    prefectureCode : document.getElementById("prefectureSelect"),
    cityCode : document.getElementById("citySelect"),
    searchBlock : document.getElementById("search-block"),
    tradeinfotable : document.getElementById("tradeinfotable"),
    nav : document.getElementById("nav"),
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
    let prefecture = config.prefectureCode.value;
    let city = config.cityCode.value;
    
    
    if (parseInt(start) < 20053 || parseInt(end) < 20053 || parseInt(start) > parseInt(end) || prefecture == 0 || city == 0){
        form.querySelectorAll(`input[name="periodStart"]`)[0].value = "";
        form.querySelectorAll(`input[name="periodEnd"]`)[0].value = "";
        alert("全て入力してください");
    }
    else {
        let retrievalInfo = new RetrievalInfo(
            form.querySelectorAll(`input[name="periodStart"]`)[0].value,
            form.querySelectorAll(`input[name="periodEnd"]`)[0].value,
            prefecture,
            city
        );
        config.searchBlock.classList.add("d-none");
        getInfo(retrievalInfo);
    }
}
// namespase
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

function getInfo(RetrievalInfo) {
    let url = 
    `
        https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=${RetrievalInfo.start}&to=${RetrievalInfo.end}&area=${RetrievalInfo.prefecture}&city=${RetrievalInfo.city}
    `;
    let transactionHistory = fetch(url).then(resuponce=>resuponce.json()).then(function(data){
        let tradeInfoList = data["data"];

        let maxtardePriceByFloorPlan = collection(tradeInfoList, "FloorPlan", "TradePrice", "max");
        let tradePriceindividualRegionAvg = collection(tradeInfoList, "DistrictName", "TradePrice", "avg");

        let tradePriceTotalDistrict = collection(tradeInfoList, "DistrictName", "TradePrice", "total");
        let tradePriceTotalCity = collection(tradeInfoList, "Prefecture", "TradePrice", "total"); 

        let numberOftrasanctionsDistrict = collection(tradeInfoList, "DistrictName", null);
        let numberOftrasanctionsCity = collection(tradeInfoList, "Prefecture", null);

        config.nav.append(pagination());

        config.tradeinfotable.append(pagetitle("地区別平均取引額", concatenation(prefectureCode[RetrievalInfo.prefecture], cityCode[RetrievalInfo.city]),concatenation(splitString(RetrievalInfo.start), splitString(RetrievalInfo.end))),infoTable(tradePriceindividualRegionAvg, "地区", "平均取引額", `<i class="fas fa-home"></i>`, "avg"));

        let pageList = config.nav.querySelectorAll("#nav");
        for (let i = 0; i < pageList.length; i++){
            pageList[i].querySelectorAll("#page1")[0].addEventListener("click", function(){
                config.tradeinfotable.innerHTML = "";
                config.tradeinfotable.append(pagetitle("地区別平均取引額", concatenation(prefectureCode[RetrievalInfo.prefecture], cityCode[RetrievalInfo.city]),concatenation(splitString(RetrievalInfo.start), splitString(RetrievalInfo.end))),infoTable(tradePriceindividualRegionAvg, "地区", "平均取引額", `<i class="fas fa-home"></i>`, "avg"));
            });

            pageList[i].querySelectorAll("#page2")[0].addEventListener("click", function(){
                config.tradeinfotable.innerHTML = "";
                config.tradeinfotable.append(pagetitle("間取別最大取引額", concatenation(prefectureCode[RetrievalInfo.prefecture], cityCode[RetrievalInfo.city]),concatenation(splitString(RetrievalInfo.start), splitString(RetrievalInfo.end))),infoTable(maxtardePriceByFloorPlan, "間取", "最大取引額", `<i class="fas fa-home"></i>`));
            });

            pageList[i].querySelectorAll("#page3")[0].addEventListener("click", function(){
                config.tradeinfotable.innerHTML = "";
                config.tradeinfotable.append(pagetitle("地区別取引件数割合", concatenation(prefectureCode[RetrievalInfo.prefecture], cityCode[RetrievalInfo.city]),concatenation(splitString(RetrievalInfo.start), splitString(RetrievalInfo.end))),progressHTML(numberOftrasanctionsDistrict, numberOftrasanctionsCity, "総取引件数", `<i class="fas fa-house-user"></i>`,"取引件数"));
            });

            pageList[i].querySelectorAll("#page4")[0].addEventListener("click", function(){
                config.tradeinfotable.innerHTML = "";
                config.tradeinfotable.append(pagetitle("地区別取引額割合", concatenation(prefectureCode[RetrievalInfo.prefecture], cityCode[RetrievalInfo.city]),concatenation(splitString(RetrievalInfo.start), splitString(RetrievalInfo.end))),progressHTML(tradePriceTotalDistrict, tradePriceTotalCity, "総取引額",`<i class="fas fa-money-bill-wave-alt"></i>`, "取引額"));
            })
        }

    });
}

function pagination(){
    let div = document.createElement('div');
    div.classList.add("d-flex", "justify-content-center", "mt-3", "pageitem", "flex-column","h-auto", "align-items-center");
    div.innerHTML = 
    `
    <nav aria-label="Page navigation example" id="nav">
        <ul class="pagination">
            <li class="page-item">
                <a class="page-link" href="./index.html" aria-label="Previous">
                <span aria-hidden="true"><i class="fas fa-search"></i></span>
                <span class="sr-only">Previous</span>
                </a>
            </li>
            <li class="page-item" id="page1"><a class="page-link">1</a></li>
            <li class="page-item" id="page2"><a class="page-link">2</a></li>
            <li class="page-item" id="page3"><a class="page-link">3</a></li>
            <li class="page-item" id="page4"><a class="page-link">4</a></li>
        </ul>
    </nav>
    `
    return div;
}


//index0 = total tradeprice
//index1 = number of transactions

function collection(tradeInfolist, traget, infoyouwant, purpose=null){
    let infomap = {};
    for (let i = 0; i < tradeInfolist.length; i++){
        infomap[tradeInfolist[i][traget]] = purpose == "max" ? 0 : purpose == "avg" ? [0,0] : purpose == "total" ? 0 : 0;
    }
    for (let i = 0; i < tradeInfolist.length; i++){
        if (purpose == "max" ){
            infomap[tradeInfolist[i][traget]] = Math.max(parseInt(tradeInfolist[i][infoyouwant]),infomap[tradeInfolist[i][traget]]);
        } 
        else if (purpose == "avg"){
            infomap[tradeInfolist[i][traget]][0] += parseInt(tradeInfolist[i][infoyouwant]);
            infomap[tradeInfolist[i][traget]][1]++;
        }
        else if (purpose == "total"){
            infomap[tradeInfolist[i][traget]] += parseInt(tradeInfolist[i][infoyouwant]);
        }
        else {
            infomap[tradeInfolist[i][traget]]++;
        }
    }
    return infomap;
}

function splitString(periodstr){
    return `${periodstr.substr(0,periodstr.length-1)}年第${periodstr.substr(periodstr.length-1)}四半期`;
}

function isdataExist(str){
    return str ? true : false;
}

function concatenation(str1, str2) {
    return isdataExist(str1) ? str1 + "-" + str2 : null;
}　

function pagetitle(title, prefectureAndCity, periodStartToEnd, infotabletitle=null) {
    let titleElementList = [title, periodStartToEnd, prefectureAndCity, infotabletitle];
    let container = document.createElement('div');
    container.classList.add("mt-3");

    let ul = document.createElement('ul');
    ul.classList.add("list-group", "text-center");

    for (let i = 0; i < titleElementList.length; i++){
        if (titleElementList[i] != null){
            ul.innerHTML += 
            `
            <li class="list-group-item">
                ${titleElementList[i]}
            </li>
            `
        }
    }
    container.append(ul)
    return container;
}


function infoTable(infoMap, district=null, pricetitle=null, icon=null, getdata=null){
    let container = document.createElement("div");
    container.classList.add("mt-3")
    let table = document.createElement("table");
    table.classList.add("table","table-striped");
    let tbody = document.createElement("tbody");
    table.innerHTML = 
    `
        <thead>
            <tr>
                <th>#</th>
                <th>${district}</th>
                <th>${pricetitle}</th>
            </tr>
        </thead>
    `

    if (Object.keys(infoMap).length){
        let data = "";
        for (let key in infoMap){
            if (key != "undefined"){
                if (getdata == "avg"){
                    data = (infoMap[key][0] / infoMap[key][1]).toFixed(1); 
                }
                else {
                    data = infoMap[key];
                }
                tbody.innerHTML += 
                `
                <tr>
                    <th scope="row">${icon}</th>
                    <td>${key}</td>
                    <td>¥ ${new Intl.NumberFormat().format(data)}</td>
                </tr>
                `
            }
            else {
                tbody.innerHTML += 
                `
                <tr>
                    <th scope="row">${icon}</th>
                    <td>No Data</td>
                    <td>No Data</td>
                </tr>
                `
            }
        table.append(tbody);
        }
    }
    container.append(table);
    return container;
}

function editData(tradeInfoCity){
    if (Object.keys(tradeInfoCity).length == 1){
        return tradeInfoCity[Object.keys(tradeInfoCity)[0]];
    }
    else {
        let keys = Object.keys(tradeInfoCity);
        let total = 0;
        for (let i = 0; i < keys; i++){
            total += tradeInfoCity[key];
        }
        return total;
    }
}

function progressHTML(tradeInfoDistrict, tradeInfoCity, mainInfo=null, icon=null, info1=null, info2=null){
    let total = editData(tradeInfoCity);
    let progresscontainer = document.createElement("div");
    progresscontainer.classList.add("mt-3");
    progresscontainer.innerHTML = 
    `
    <b>${mainInfo}: ${icon} ${new Intl.NumberFormat().format(total)}</b>
    `
    for (let key in tradeInfoDistrict){
        let rate = (tradeInfoDistrict[key] / total * 100).toFixed(6);
        let div = document.createElement("div");
        div.innerHTML = 
        `   
        <div class="mt-3">地区: ${key} - ${info1}割合: ${rate}% - ${info1}: <b>${icon} ${new Intl.NumberFormat().format(tradeInfoDistrict[key])}</b></div>
        <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated text-dark" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: ${rate}%"></div>
        </div>
        `
        progresscontainer.append(div);
    }

    return progresscontainer;
}

codeSelect.prefectureSelect(); 
codeSelect.cityCodeSelect();

// "Type":"中古マンション等"
// "MunicipalityCode":"13102"
// "Prefecture":"東京都"
// "Municipality":"中央区"
// "DistrictName":"明石町"
// "TradePrice":"53000000"
// "FloorPlan":"２ＤＫ"
// "Area":"50"
// "BuildingYear":"平成24年"
// "Structure":"ＲＣ"
// "Use":"住宅"
// "CityPlanning":"第２種住居地域"
// "CoverageRatio":"60"
// "FloorAreaRatio":"400"
// "Period":"2020年第１四半期"
// "Renovation":"未改装"


// https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=20201&to=20202&area=05&city=05202
// https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=20201&to=20202&area=13&city=13102


//home icon <i class="fas fa-home"></i>

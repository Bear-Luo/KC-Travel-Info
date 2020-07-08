var xhr = new XMLHttpRequest();
xhr.open('get', 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97', true);
xhr.send(null);

xhr.onload = function () {
  const data = JSON.parse(xhr.responseText);

  const selBlock = document.getElementById('selBlock');
  const listName = document.querySelector('.listName');
  const selHot = document.querySelector('.hotBlock');
  const pagerUl = document.querySelector('.pager ul');

  //監聽
  selBlock.addEventListener('change', selBlockFun);
  selHot.addEventListener('click', selHotFun);
  pagerUl.addEventListener('click', changePage);

  // 下拉的內容
  // 過濾成乾淨的區域陣列到 zoneAry
  const zoneAry = [];
  for (let i = 0; i < data.result.records.length; i++) {
    zoneAry.push(data.result.records[i].Zone);
  }
  // 再用 foreach 去判斷陣列裡面所有值是否有吻合
  const blockData = [];
  zoneAry.forEach(function (value) {
    if (blockData.indexOf(value) == -1) {
      blockData.push(value);
    }
  });

  let selBlockStr = '';
  for (var i = 0; i < blockData.length; i++) {
    selBlockStr += '<option value="' + blockData[i] + '">' + blockData[i] + '</option>';
  }
  const selBlockList = '<option disabled>- - 請選擇行政區 - -</option> <option value="0">全部</option>' + selBlockStr;
  selBlock.innerHTML = selBlockList;

  // 分頁按鈕
  function pagerFun() {
    const len = data.result.records.length;
    let pageStr = '';
    const pages = Math.ceil(len / 10);
    const pageNumAry = [];

    for (let i = 0; i < pages; i++) {
      pageNumAry.push(i);
      pageStr += '<li data-num="' + (i + 1) + '"><a href="#">' + (i + 1) + '</a></li>';
    }
    pageContent = '<li class="prev disabled" data-num="0"><a href="#">< prev</a></li>' + pageStr + '<li class="next" data-num="' + (pageNumAry.length + 1) + '"><a href="#">next ></a></li>'
    pagerUl.innerHTML = pageContent;

    const pageLi = document.querySelectorAll('.pager li');
    pageLi[1].setAttribute('class', 'active');
  }

  // 網站連結、票券資訊為空則移除
  function nullRemove() {
    const localLink = window.location.href;
    const imgLinkAry = document.querySelectorAll('.imgLink a');
    const ticketInfoAry = document.querySelectorAll('.ticketInfo');
    for (let i = 0; i < imgLinkAry.length; i++) {
      if (imgLinkAry[i].href === localLink) {
        imgLinkAry[i].remove();
      }
      if (ticketInfoAry[i].textContent === '') {
        ticketInfoAry[i].remove();
      }
    }
  }

  // 一開始的畫面        
  // 大標題內容
  listName.textContent = '高雄市景點';
  // 預設 list 內容
  let listStr = '';
  for (let i = 0; i < 10; i++) {
    listStr += '<li><div class="imgLink" style="background-image: url(' + data.result.records[i].Picture1 + ');">' + '<a href="' + data.result.records[i].Website + '">' + data.result.records[i].Name + '</a>' + '<span>' + data.result.records[i].Name + '</span><span>' + data.result.records[i].Zone + '</span></div><ul><li><span>' + data.result.records[i].Opentime + '</span></li><li><span>' + data.result.records[i].Add + '</span></li><li><span>' + data.result.records[i].Tel + '</span></li></ul><div class="ticketInfo">' + data.result.records[i].Ticketinfo + '</div>';
  }
  document.querySelector('.list').innerHTML = listStr;
  // 分頁按鈕及移除空的連結與票卷資訊
  pagerFun();
  nullRemove();

  // 換頁
  function changePage(e) {
    e.preventDefault();
    if (e.target.nodeName !== 'A') { return }
    const pageLi = document.querySelectorAll('.pager li');
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');
    const len = pageLi.length; // 分頁按鈕陣列的長度
    const dataNum = e.target.parentNode.dataset.num; //點擊的按鈕編號
    const nextNum = len - 1; // next 按鈕的編號
    const pageLastNum = len - 2; // 最後頁的按鈕編號

    let num;
    let lenControl;

    if (dataNum == nextNum) {
      const pageActive = parseInt(document.querySelector('.active').dataset.num);
      if (pageActive == pageLastNum) return
      num = pageActive * 10;
      lenControl = (pageActive + 1) * 10;
      const next = pageActive + 1;
      for (let i = 1; i < len; i++) { pageLi[i].setAttribute('class', '') };
      pageLi[next].setAttribute('class', 'active');
    } else if (dataNum == 0) {
      const pageActive = parseInt(document.querySelector('.active').dataset.num);
      if (pageActive == 1) { return };
      num = (pageActive - 2) * 10;
      lenControl = (pageActive - 1) * 10;
      const prev = pageActive - 1;
      for (let i = 1; i < len; i++) { pageLi[i].setAttribute('class', '') };
      pageLi[prev].setAttribute('class', 'active');
    } else if (dataNum == pageLastNum) { // 最後一頁顯示的項目
      for (let i = 1; i < len; i++) { pageLi[i].setAttribute('class', '') };
      num = (pageLastNum - 1) * 10;
      lenControl = data.result.records.length;
      pageLi[pageLastNum].setAttribute('class', 'active');
    } else {
      for (let i = 1; i < len; i++) { pageLi[i].setAttribute('class', '') };
      for (let i = 0; i < len; i++) {
        if (dataNum == pageLi[i].textContent) {
          num = (i - 1) * 10;
          lenControl = i * 10;
          pageLi[i].setAttribute('class', 'active');
          break
        }
      }
    }

    // 控制上下頁的disabled
    if (lenControl > 10 && lenControl < data.result.records.length) {
      btnPrev.className = 'prev';
      btnNext.className = 'next';
    } else if (lenControl == 10) {
      btnPrev.className = 'prev disabled';
      btnNext.className = 'next';
    } else if (lenControl == data.result.records.length) {
      btnPrev.className = 'prev';
      btnNext.className = 'next disabled';
    }

    let listStr = '';
    for (let i = num; i < lenControl; i++) {
      listStr += '<li><div class="imgLink" style="background-image: url(' + data.result.records[i].Picture1 + ');">' + '<a href="' + data.result.records[i].Website + '">' + data.result.records[i].Name + '</a>' + '<span>' + data.result.records[i].Name + '</span><span>' + data.result.records[i].Zone + '</span></div><ul><li><span>' + data.result.records[i].Opentime + '</span></li><li><span>' + data.result.records[i].Add + '</span></li><li><span>' + data.result.records[i].Tel + '</span></li></ul><div class="ticketInfo">' + data.result.records[i].Ticketinfo + '</div>';
    }
    document.querySelector('.list').innerHTML = listStr;

    nullRemove();
  }

  // 點擊下拉之後顯示的內容
  function selBlockFun(e) {
    const el = e.target.value;

    let count = 0;
    let listStr = '';
    for (let i = 0; i < data.result.records.length; i++) {
      if (el == 0) {    // 點選請選擇行政區之後顯示的內容
        pagerUl.style.display = 'block';
        listName.textContent = '高雄市景點';
        listStr += '<li><div class="imgLink" style="background-image: url(' + data.result.records[i].Picture1 + ');">' + '<a href="' + data.result.records[i].Website + '">' + data.result.records[i].Name + '</a>' + '<span>' + data.result.records[i].Name + '</span><span>' + data.result.records[i].Zone + '</span></div><ul><li><span>' + data.result.records[i].Opentime + '</span></li><li><span>' + data.result.records[i].Add + '</span></li><li><span>' + data.result.records[i].Tel + '</span></li></ul><div class="ticketInfo">' + data.result.records[i].Ticketinfo + '</div>';
        if (count == 9) { break }
        ++count;
      }
      if (el !== 0 && el === data.result.records[i].Zone) {
        // 顯示資料變少，隱藏分頁按鈕
        pagerUl.style.display = 'none';

        listName.textContent = data.result.records[i].Zone;
        listStr += '<li><div class="imgLink" style="background-image: url(' + data.result.records[i].Picture1 + ');">' + '<a href="' + data.result.records[i].Website + '">' + data.result.records[i].Name + '</a>' + '<span>' + data.result.records[i].Name + '</span><span>' + data.result.records[i].Zone + '</span></div><ul><li><span>' + data.result.records[i].Opentime + '</span></li><li><span>' + data.result.records[i].Add + '</span></li><li><span>' + data.result.records[i].Tel + '</span></li></ul><div class="ticketInfo">' + data.result.records[i].Ticketinfo + '</div>';
      }
    }
    document.querySelector('.list').innerHTML = listStr;

    pagerFun();

    nullRemove();
  }

  // 熱門行政區
  function selHotFun(e) {
    if (e.target.nodeName !== 'LI') { return }
    pagerUl.style.display = 'none';

    // 依選擇的熱門行政區改變下拉
    const el = e.target;
    const elText = e.target.textContent;
    for (var i = 0; i < blockData.length; i++) {
      if (elText == blockData[i]) {
        var x = ++i;
        selBlock.options[x].selected = true;
      }
    }
    listName.textContent = elText;

    let listStr = '';
    if (el.nodeName !== 'LI') { return }
    for (let i = 0; i < data.result.records.length; i++) {
      if (el.textContent == data.result.records[i].Zone) {
        listStr += '<li><div class="imgLink" style="background-image: url(' + data.result.records[i].Picture1 + ');">' + '<a href="' + data.result.records[i].Website + '">' + data.result.records[i].Name + '</a>' + '<span>' + data.result.records[i].Name + '</span><span>' + data.result.records[i].Zone + '</span></div><ul><li><span>' + data.result.records[i].Opentime + '</span></li><li><span>' + data.result.records[i].Add + '</span></li><li><span>' + data.result.records[i].Tel + '</span></li></ul><div class="ticketInfo">' + data.result.records[i].Ticketinfo + '</div>';
      }
    }
    document.querySelector('.list').innerHTML = listStr;

    nullRemove();
  }
}

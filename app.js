import MyKey from './MyKey.js';

///////////////////////
/* 변수 */
const URL =
  'http://apis.data.go.kr/1262000/TravelAlarmService2/getTravelAlarmList2?';
const SERVICE_KEY = MyKey.key;
const NUM_OF_ROWS = 1;
const PAGE_NO = 1;

const formEl = document.querySelector('form');
const inputEl = document.querySelector('.search > input');
const searchBtn = document.querySelector('.search > button');
const contentEl = document.querySelector('main > div');
const noticeEl = document.querySelector('.notice');

const enExpression = /[a-zA-Z]/;

///////////////////////
/* 이벤트 */
// 사용자가 검색할 때
formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

///////////////////////
/* 함수 */
async function search() {
  try {
    // input value 띄어쓰기 모두 제거하여 가져오기
    const searchText = inputEl.value.replaceAll(' ', '');

    // 검색단어가 빈값일때
    if (searchText === '') {
      throw new Error('국가를 입력해주세요.');
    }
    // 검색단어가 영문일때
    if (enExpression.test(searchText)) {
      // TODO: ISO 국가코드로 검색가능하도록
      throw new Error('국가명을 한글로 적어주세요.');
    }

    // 요청 url 생성
    const requestUrl = `${URL}ServiceKey=${SERVICE_KEY}&numOfRows=${NUM_OF_ROWS}&pageNo=${PAGE_NO}&cond[country_nm::EQ]=${searchText}`;

    // fetch로 요청하여 데이터 받아옴
    const data = await fetchUrl(requestUrl);

    // 요청 url에 대한 결과값이 없을 때
    if (data.data.length === 0) {
      throw new Error(`'${searchText}' 국가에 대한 정보가 없습니다!`);
    }

    // 받아온 데이터 객체에 담아주기
    const countryObj = {
      name: data.data[0].country_nm,
      nameEn: data.data[0].country_eng_nm,
      iso: data.data[0].country_iso_alp2,
      continent: data.data[0].continent_eng_nm,
      alertLevel: data.data[0].alarm_lvl ?? '특별여행경보',
      flagUrl: data.data[0].flag_download_url,
    };

    // 공지 메시지 초기화해주고 콘텐츠 내용 보이게 하기
    writeNotice('국가명을 한글로 입력해주세요.', 'black');
    contentEl.classList.remove('hidden');

    // 화면에 검색 결과 출력
    writeCountryData(countryObj);
  } catch (err) {
    // 에러 메시지 출력
    writeNotice(err.message);
  }
}

// fetch 요청해서 data 값 받아오는 함수
async function fetchUrl(requestUrl) {
  const res = await fetch(requestUrl);
  const data = await res.json();

  if (!res.ok) throw new Error(`${data.message} (${res.status})`);

  return data;
}

// 국가정보 화면에 출력하는 함수
function writeCountryData(data) {
  const flagImg = document.querySelector('.national-flag > img');
  const nameKo = document.querySelector('.country-name-kr');
  const iso = document.querySelector('.country-iso');
  const nameEn = document.querySelector('.country-name-en');
  const continent = document.querySelector('.continent-name');
  const alertLevel = document.querySelector('.alarm-lvl');

  flagImg.src = data.flagUrl;
  nameKo.textContent = data.name;
  iso.textContent = data.iso;
  nameEn.textContent = data.nameEn;
  continent.textContent = data.continent;
  alertLevel.textContent = `${data.alertLevel} 단계`;
}

function writeNotice(text, color = 'red') {
  noticeEl.style.color = color;
  noticeEl.textContent = text;
}

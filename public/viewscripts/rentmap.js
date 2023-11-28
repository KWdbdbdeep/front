// rentmap.js

var map;

// 대여소 정보를 불러오는 함수
function loadStationData(callback) {
  // 서울 열린 데이터 광장의 실시간 대여정보 API 엔드포인트
  var apiUrl = 'http://openapi.seoul.go.kr:8088/5565524876746a6437325663626d4b/json/bikeList/1/1000';
  
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      var stations = data.rentBikeStatus.row; // API의 JSON 구조에 따라 접근
      callback(stations); // 데이터가 로드된 후 지도에 마커를 추가하는 콜백 함수
    })
    .catch(error => console.error('Error loading station data:', error));
}

// 지도를 초기화하고 대여소 데이터를 로드하는 함수
function initMap() {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5665, 126.9780),
    zoom: 14
  });

  loadStationData(function(stations) {
    // 대여소 마커 생성
    stations.forEach(function(station) {
      var position = new naver.maps.LatLng(station.stationLatitude, station.stationLongitude);
      var marker = new naver.maps.Marker({
        position: position,
        map: map,
        title: station.stationName
      });

      naver.maps.Event.addListener(marker, 'click', function() {
        updateStationInfo(station);
      });
    });
  });
}

function updateStationInfo(station) {
  var stationInfo = document.getElementById("station-info");
  stationInfo.style.display = "block";
  stationInfo.innerHTML = `
      <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">${station.stationName}</h2>
          <button class="text-gray-600" onclick="closePopup()">&times;</button>
      </div>
      <div>
          <p><strong>자전거 거치대 수:</strong> ${station.rackTotCnt}</p>
          <p><strong>대여 가능한 자전거 수:</strong> ${station.parkingBikeTotCnt}</p>
          <p><strong>공유율:</strong> ${station.shared}%</p>
      </div>
  `;
}

function closePopup() {
  document.getElementById("station-info").style.display = "none";
}

naver.maps.onJSContentLoaded = initMap;

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
    zoom: 14,
    scaleControl: true,
    logoControl: true,
    mapTypeControl: true,
    zoomControl: true
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
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              대여하기
          </button>
      </div>
  `;
}

function closePopup() {
  document.getElementById("station-info").style.display = "none";
}

var currentLocationMarker = null; // 현재 위치 마커 전역 변수 선언

function moveToCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var currentPosition = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(currentPosition);
      
      // 현재 위치 마커 생성 또는 업데이트
      if (!currentLocationMarker) {
        currentLocationMarker = new naver.maps.Marker({
          position: currentPosition,
          map: map,
          icon: {
            content: '<img src=/images/cur_location.png alt="현재 위치" style="width:24px; height:24px;">',
            anchor: new naver.maps.Point(12, 12)
          }
        });
      } else {
        currentLocationMarker.setPosition(currentPosition);
      }
    }, function(err) {
      console.error(err);
    });
  } else {
    alert("브라우저가 위치 정보를 지원하지 않습니다.");
  }
}

document.getElementById('current-location-btn').addEventListener('click', moveToCurrentLocation);

naver.maps.onJSContentLoaded = initMap;

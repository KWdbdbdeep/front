var map;

// 대여소 정보를 불러오는 함수
function loadStationData(callback) {
  // 서버의 '/stations' 엔드포인트 호출
  fetch('/rentmap/stations')
    .then(response => response.json())
    .then(data => {
      callback(data); // 데이터가 로드된 후 지도에 마커를 추가하는 콜백 함수
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
  naver.maps.Event.addListener(map, 'idle', loadStationsInView);

  
}

function loadStationsInView() {
  const bounds = map.getBounds();
  const sw = bounds.getSW();
  const ne = bounds.getNE();

  fetch(`/rentmap/stations?swLat=${sw.lat()}&swLng=${sw.lng()}&neLat=${ne.lat()}&neLng=${ne.lng()}`)
    .then(response => response.json())
    .then(stations => {
        // 대여소 마커 생성
        stations.forEach(function(station) {
          var position = new naver.maps.LatLng(station.Latitude, station.Longitude);
          var marker = new naver.maps.Marker({
            position: position,
            map: map,
            title: station.Station_Name
          });

          naver.maps.Event.addListener(marker, 'click', function() {
            updateStationInfo(station);
          });
        });
    })
    .catch(error => console.error('Error loading station data:', error));
}
// 자전거 반납 함수
function returnBicycle() {
  fetch('/rentmap/return-bicycle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
    // body 부분을 제거합니다. 서버 측에서 세션에서 bikeId를 직접 가져옵니다.
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('자전거 반납 성공!');
      window.location.reload(); // 페이지 새로고침 또는 리디렉션
    } else {
      alert('반납 실패: ' + data.message);
    }
  })
  .catch(error => {
    console.error('자전거 반납 중 에러 발생:', error);
    alert('자전거 반납 실패');
  });
}



// 선택한 대여소의 정보를 업데이트하는 함수
function updateStationInfo(station) {
  var stationInfo = document.getElementById("station-info");
  stationInfo.style.display = "block";
  stationInfo.innerHTML = `
      <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">${station.Station_Name}</h2>
          <button class="text-gray-600" onclick="closePopup()">&times;</button>
      </div>
      <div>
          <p><strong>대여소 번호:</strong> ${station.Rental_Office_id}</p>
          <p><strong>주소:</strong> ${station.Address}</p>
          <p><strong>운영 방식:</strong> ${station.Operation_Method}</p>
          <p><strong>해당 운영방식 자전거 대수:</strong> ${station.LCD_Type ? station.LCD_Type : station.QR_Type}</p>
      </div>
  `;
  stationInfo.innerHTML += `
    <button id="rentButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      대여하기
    </button>
  `;
  // "대여하기" 버튼에 이벤트 리스너 추가
  document.getElementById('rentButton').addEventListener('click', function() {
    rentBicycle(station.Rental_Office_id);
  });
}

// 나머지 함수들은 기존과 동일합니다.

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

// 페이지 로드 시 자동으로 대여소 정보를 로드하고 지도에 마커로 표시
document.addEventListener('DOMContentLoaded', function() {
  initMap(); // 지도 초기화
});

// 자전거 대여 함수
// 자전거 대여 함수
function rentBicycle(rentalOfficeId) {
  fetch('/rentmap/rent-bicycle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rentalOfficeId: rentalOfficeId }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`자전거 대여 성공! 자전거 번호: ${data.bikeId}`);
      updateRentalStatus(data.bikeId);
      if (data.redirect) {
        window.location.href = data.redirect; // 리디렉션 처리
      }
    } else {
      alert(`대여 실패: ${data.message}`);
    }
  })
  .catch(error => {
    alert(`자전거 대여 실패: ${error.message}`);
  });
}



// 대여 상태를 업데이트하는 함수
function updateRentalStatus(bikeId) {
  // 대여한 자전거 정보를 화면에 표시
  var rentalInfoDiv = document.getElementById("rentalInfo");
  if (rentalInfoDiv) {
    rentalInfoDiv.innerHTML = `대여한 자전거 번호: ${bikeId}`;
    rentalInfoDiv.style.display = "block";
  }

  // "대여하기" 버튼 텍스트 변경
  var rentButton = document.getElementById("rentButton");
  if (rentButton) {
    rentButton.innerText = "대여 중";
  }
}

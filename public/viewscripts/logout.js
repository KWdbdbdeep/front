function logout() {
  // 로그아웃 요청을 서버로 보내고, 성공적으로 로그아웃되면 메인 홈 화면으로 리다이렉트합니다.
  fetch("/logout", {
    method: "POST", // 로그아웃 요청을 POST 메서드로 보냅니다.
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        // 성공적으로 로그아웃되면 메인 홈 화면으로 리다이렉트합니다.
        window.location.href = "/";
      }
    })
    .catch((error) => {
      console.error("로그아웃 오류:", error);
    });
}

// 로그아웃 함수를 다른 스크립트에서 사용할 수 있도록 내보냅니다.
module.exports = { logout };

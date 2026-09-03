// ============================================================
// Firebase 설정 파일 (예시)
// ------------------------------------------------------------
// 1) 이 파일을 복사해서 같은 폴더에 "config.js" 로 저장하세요.
// 2) Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱 → SDK 설정에서
//    아래 값들을 복사해 붙여넣으세요. (README.md 15분 가이드 참고)
//
// ※ config.js 가 없거나 값이 비어 있으면 앱은 자동으로
//    "오프라인(뉴스 코드) 모드" 로만 동작합니다. 수업은 가능하지만
//    실시간 리더보드/동기화는 꺼집니다.
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "여기에-apiKey",
  authDomain: "프로젝트ID.firebaseapp.com",
  // Realtime Database 주소 — 반드시 databaseURL 이 있어야 합니다!
  databaseURL: "https://프로젝트ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "프로젝트ID",
};

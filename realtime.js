// ============================================================
// realtime.js — Firebase Realtime Database 공통 모듈
// ------------------------------------------------------------
// 다른 수업 게임(쓰레기 경매장, 에너지 지도 등)에서도 재사용 가능.
// rooms/{code}/meta.game 값만 바꿔 같은 방/모둠 구조를 쓰면 된다.
//
// config.js 가 없거나 Firebase CDN 로드 실패 시 RT.enabled === false
// → 각 화면은 자동으로 오프라인(뉴스 코드) 모드로 동작한다.
// ============================================================

const RT = (() => {
  const hasConfig =
    typeof FIREBASE_CONFIG !== "undefined" &&
    FIREBASE_CONFIG &&
    FIREBASE_CONFIG.apiKey &&
    !String(FIREBASE_CONFIG.apiKey).includes("여기에") &&
    FIREBASE_CONFIG.databaseURL &&
    !String(FIREBASE_CONFIG.databaseURL).includes("프로젝트ID");
  const hasSDK = typeof firebase !== "undefined";
  const enabled = hasConfig && hasSDK;

  let db = null;
  let connected = false;
  let forcedOffline = false;
  const connCbs = [];
  const watchers = []; // {ref, cb}

  function init() {
    if (!enabled) return false;
    if (db) return true;
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
      db.ref(".info/connected").on("value", (snap) => {
        const was = isOnline();
        connected = !!snap.val();
        if (was !== isOnline()) connCbs.forEach((f) => f(isOnline()));
      });
      return true;
    } catch (e) {
      console.error("Firebase 초기화 실패:", e);
      return false;
    }
  }

  function isOnline() { return enabled && !!db && connected && !forcedOffline; }

  function forceOffline(on) {
    forcedOffline = !!on;
    connCbs.forEach((f) => f(isOnline()));
  }

  function onConn(cb) { connCbs.push(cb); cb(isOnline()); }

  // ---- 기본 입출력 -------------------------------------------------
  function set(path, val) { return db.ref(path).set(val); }
  function update(path, val) { return db.ref(path).update(val); }
  function remove(path) { return db.ref(path).remove(); }
  function get(path) {
    return db.ref(path).once("value").then((s) => s.val());
  }
  function watch(path, cb) {
    const ref = db.ref(path);
    const h = ref.on("value", (s) => cb(s.val()));
    watchers.push({ ref, h });
    return ref;
  }
  function unwatchAll() {
    watchers.forEach((w) => w.ref.off("value", w.h));
    watchers.length = 0;
  }
  function pushKey(path) { return db.ref(path).push().key; }

  // ---- 방(room) 헬퍼 -----------------------------------------------
  function genRoomCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  // 게임 종류와 무관한 공통 방 생성
  async function createRoom(gameId, meta) {
    let code = genRoomCode();
    for (let i = 0; i < 5; i++) {
      const exist = await get("rooms/" + code + "/meta");
      if (!exist) break;
      code = genRoomCode();
    }
    const teacherToken = Math.random().toString(36).slice(2, 10);
    await set("rooms/" + code + "/meta", Object.assign({
      game: gameId,
      createdAt: Date.now(),
      teacherToken,
      status: "open",
    }, meta || {}));
    return { code, teacherToken };
  }

  // 24시간 지난 방 청소 (방 개설 시 한 번 시도 — 실패해도 무시)
  async function cleanupOldRooms() {
    try {
      const rooms = await get("rooms");
      if (!rooms) return;
      const now = Date.now();
      for (const code of Object.keys(rooms)) {
        const created = rooms[code] && rooms[code].meta && rooms[code].meta.createdAt;
        if (created && now - created > 24 * 3600 * 1000) {
          await remove("rooms/" + code);
        }
      }
    } catch (e) { /* 교실용 — 조용히 무시 */ }
  }

  return {
    enabled, init, isOnline, forceOffline, onConn,
    set, update, remove, get, watch, unwatchAll, pushKey,
    genRoomCode, createRoom, cleanupOldRooms,
  };
})();

(() => {
  const STORAGE_KEY = "escape4-state-v1";
  const MAX_LOGS = 8;
  const SHOW_HOTSPOT_ICONS = false;

  const gameRoot = document.getElementById("game-root");
  const stage = document.getElementById("stage");
  const hotspotsEl = document.getElementById("hotspots");
  const roomMessage = document.getElementById("room-message");
  const tabButtons = Array.from(document.querySelectorAll("[data-scene]"));
  const fullscreenToggleButton = document.getElementById("fullscreen-toggle");
  const fxToggle = document.getElementById("fx-toggle");
  const rainVolumeSlider = document.getElementById("rain-volume");
  const inventoryItems = document.getElementById("inventory-items");
  const inventoryEmpty = document.getElementById("inventory-empty");
  const logList = document.getElementById("log-list");
  const hintBody = document.getElementById("hint-body");
  const hintTabs = Array.from(document.querySelectorAll("[data-hint-level]"));
  const restartButton = document.getElementById("restart");
  const clearSelectionButton = document.getElementById("clear-selection");
  const modalRoot = document.getElementById("modal-root");

  const sceneNames = {
    "record-room": "記録室",
    hallway: "廊下",
    storage: "保管庫",
    washroom: "洗面",
  };

  const MODAL_IMAGE_FALLBACK = {
    drawers: "assets/drawers.png",
    scale: "assets/scale.png",
    desk: "assets/desk.png",
    recorder: "assets/recorder.png",
    clock: "assets/clock.png",
    panel: "assets/panel.png",
    lamp: "assets/lamp.png",
    door: "assets/door.png",
    board: "assets/paper-record-template.png",
    bottles: "assets/paper-record-template.png",
    case: "assets/item-mirror.png",
  };

  const ITEM_DEFS = {
    cloth: { name: "布", img: "assets/item-cloth.png", desc: "濡れていない布。曇りを拭けそうだ。" },
    flashlight: { name: "懐中電灯", img: "assets/item-flashlight.png", desc: "暗い場所を照らせる。" },
    mirror: { name: "鏡", img: "assets/item-mirror.png", desc: "反転した文字が読めるかもしれない。" },
    "red-film": { name: "赤フィルム", img: "assets/item-red-film.png", desc: "赤でだけ見えるものがある。" },
    tape: { name: "テープ", img: "assets/item-tape.png", desc: "紙を貼り合わせられる。" },
    plug: { name: "プラグ", img: "assets/item-plug.png", desc: "配電盤に接続できそうだ。" },
    matchbox: { name: "マッチ箱", img: "assets/item-cloth.png", desc: "箱の内側に何か書いてある気がする。" },
    "torn-a": { name: "破れ紙A", img: "assets/paper-torn-a.png", desc: "破れた紙片。どこかの片割れだ。" },
    "torn-b": { name: "破れ紙B", img: "assets/paper-torn-b.png", desc: "破れた紙片。どこかの片割れだ。" },
    "fold-paper": { name: "折り線の紙", img: "assets/paper-fold.png", desc: "折り線が目立つ紙。折ってみる？" },
    "heat-paper": { name: "熱で出る紙", img: "assets/paper-record-template.png", desc: "熱を当てると文字が出るかもしれない。" },
  };

  const RECORD_TEXT = {
    "ki-1": "記(1) と",
    "ki-2": "記(2) け",
    "ki-3": "記(3) い",
    "ki-4": "記(4) を",
    "roku-1": "録(1) す",
    "roku-2": "録(2) す",
    "roku-3": "録(3) め",
    "roku-4": "録(4) 。",
    "ame-1": "雨(1) あ",
    "ame-2": "雨(2) ま",
    "ame-3": "雨(3) お",
    "ame-4": "雨(4) と",
    "oto-1": "音(1) を",
    "oto-2": "音(2) と",
    "oto-3": "音(3) め",
    "oto-4": "音(4) よ",
  };

  const RED_DIGITS = {
    "01": 7,
    "02": 1,
    "03": 8,
    "04": 4,
    "05": 0,
    "06": 9,
    "07": 5,
    "08": 3,
    "09": 6,
    "10": 3,
    "11": 7,
    "12": 2,
    "13": 8,
    "14": 1,
    "15": 6,
    "16": 4,
  };

  const ANSWERS = {
    "labelFill-1": {
      title: "欠けたラベル",
      prompt: "「ア＿オ＿」の欠けを埋めてください（例: アメオト）",
      ok: (value) => normalizeText(value).includes("アメオト") || normalizeText(value).includes("メ") && normalizeText(value).includes("ト"),
    },
    "labelFill-2": {
      title: "欠けたラベル",
      prompt: "「ト＿ケ＿」の欠けを埋めてください（例: トケイ）",
      ok: (value) => normalizeText(value).includes("トケイ") || (normalizeText(value).includes("ケ") && normalizeText(value).includes("イ")),
    },
  };

  const DOOR_CODE = "814362";
  const RAIN_VOL_KEY = "escape4-rainvol";

  // 埋め込みフォールバック（fetch失敗時に使用）
  const STATE_FALLBACK = {"version":1,"scene":"record-room","hintLevel":0,"log":[],"inventory":[],"flags":{"hasCloth":false,"hasMirror":false,"hasFlashlight":false,"hasRedFilm":false,"hasTape":false,"hasPlug":false,"windowCleared":false,"readDirectionRuleKnown":false,"tornPaperCombined":false,"scaleSolved":false,"audioDecoded":false,"clockCoordUsed":false,"bottlesSolved":false,"foldSolved":false,"tapeFree":false,"powerOn":false,"heatInkRevealed":false,"ledgerRestored":false,"shelfSorted":false,"directionSolved":false,"doorUnlocked":false,"clockFinalSet":false},"notes":{"windowArrows":null,"stampDate":{"year":2020,"month":6,"day":null},"audioDigits":null,"drawerStart":"07","doorCodeProgress":0,"finalTime":{"hh":6,"mm":20}},"pieces":{"records":{"ki-1":false,"ki-2":false,"ki-3":false,"ki-4":false,"roku-1":false,"roku-2":false,"roku-3":false,"roku-4":false,"ame-1":false,"ame-2":false,"ame-3":false,"ame-4":false,"oto-1":false,"oto-2":false,"oto-3":false,"oto-4":false},"ledgerScraps":{"1":false,"2":false,"3":false},"tornPapers":{"a":false,"b":false},"foldPaper":false},"drawers":{"01":{"opened":false,"taken":false,"lock":{"type":"none"},"contents":["record:ki-1"]},"02":{"opened":false,"taken":false,"lock":{"type":"text","key":"labelFill-1"},"contents":["record:ki-2","torn:b"]},"03":{"opened":false,"taken":false,"lock":{"type":"none"},"contents":["record:roku-1","note:stampDate"]},"04":{"opened":false,"taken":false,"lock":{"type":"code","key":"scaleCode"},"contents":["record:roku-2","paper:fold"]},"05":{"opened":false,"taken":false,"lock":{"type":"none"},"contents":["record:ki-3","item:matchbox"]},"06":{"opened":false,"taken":false,"lock":{"type":"hint","key":"tornCombine"},"contents":["record:ame-1"]},"07":{"opened":false,"taken":false,"lock":{"type":"condition","key":"hasRedFilm"},"contents":["record:ame-2","item:plug"]},"08":{"opened":false,"taken":false,"lock":{"type":"code","key":"audioDigits"},"contents":["record:ame-3","ledger:1"]},"09":{"opened":false,"taken":false,"lock":{"type":"none"},"contents":["record:ame-4"]},"10":{"opened":false,"taken":false,"lock":{"type":"hint","key":"clockCoord"},"contents":["record:oto-1","ledger:2"]},"11":{"opened":false,"taken":false,"lock":{"type":"text","key":"labelFill-2"},"contents":["record:oto-2","note:panelColors"]},"12":{"opened":false,"taken":false,"lock":{"type":"condition","key":"powerOn"},"contents":["record:oto-3","paper:heatInkTarget"]},"13":{"opened":false,"taken":false,"lock":{"type":"none"},"contents":["record:oto-4","ledger:3"]},"14":{"opened":false,"taken":false,"lock":{"type":"code","key":"redFilmCode"},"contents":["record:ki-4","note:redDigitsHowTo"]},"15":{"opened":false,"taken":false,"lock":{"type":"condition","key":"foldSolved"},"contents":["record:roku-3","note:directionStart07"]},"16":{"opened":false,"taken":false,"lock":{"type":"condition","key":"heatInkRevealed"},"contents":["record:roku-4","note:restoreOrderFinal"]}}};
  const HOTSPOTS_FALLBACK = {"version":1,"scenes":{"record-room":{"background":"assets/record-room.png","backgroundOn":"assets/record-room.png","backgroundOff":"assets/record-room-off.png","fit":"cover","hotspots":[{"id":"rr-drawers","label":"引き出し棚","x":37.69,"y":34.79,"w":35.55,"h":51.33,"action":{"type":"modal","name":"drawers"}},{"id":"rr-scale","label":"秤","x":56.7,"y":24.95,"w":9.51,"h":9.41,"action":{"type":"modal","name":"scale"}},{"id":"rr-desk","label":"机","x":3.18,"y":56.61,"w":34.13,"h":34.93,"action":{"type":"modal","name":"desk"}},{"id":"rr-recorder","label":"レコーダー","x":24.38,"y":47.34,"w":11.5,"h":8.7,"action":{"type":"modal","name":"recorder"}},{"id":"rr-clock","label":"時計","x":13.07,"y":15.69,"w":8.08,"h":12.83,"action":{"type":"modal","name":"clock"}},{"id":"rr-window","label":"窓","x":38.26,"y":13.26,"w":14.83,"h":21.67,"action":{"type":"modal","name":"window"}},{"id":"rr-panel","label":"配電盤","x":26.28,"y":18.96,"w":8.18,"h":12.26,"action":{"type":"modal","name":"panel"}},{"id":"rr-lamp","label":"電気スタンド","x":13.17,"y":37.36,"w":11.6,"h":18.54,"action":{"type":"modal","name":"lamp"}},{"id":"rr-door","label":"扉","x":73.91,"y":13.69,"w":18.35,"h":70.72,"action":{"type":"modal","name":"door"}}]},"hallway":{"background":"assets/hallway.png","fit":"cover","hotspots":[{"id":"hw-coat","label":"コート掛け","x":5.94,"y":20.53,"w":17.59,"h":44.92,"action":{"type":"pickup","item":"flashlight"}},{"id":"hw-board","label":"掲示板","x":68.87,"y":16.11,"w":26.24,"h":43.77,"action":{"type":"modal","name":"board"}},{"id":"hw-lost","label":"落とし物","x":56.61,"y":81.13,"w":6.84,"h":10.27,"action":{"type":"pickup","item":"torn-a"}}]},"storage":{"background":"assets/storage.png","fit":"cover","hotspots":[{"id":"st-bottles","label":"標本瓶","x":5.85,"y":20.82,"w":49.43,"h":24.81,"action":{"type":"modal","name":"bottles"}},{"id":"st-case","label":"小箱","x":26,"y":71.01,"w":19.11,"h":21.39,"action":{"type":"modal","name":"case"}},{"id":"st-tape","label":"テープ","x":56,"y":78,"w":16,"h":10,"action":{"type":"pickup","item":"tape"},"requiresAny":["bottlesSolved","tapeFree"]}]},"washroom":{"background":"assets/washroom.png","fit":"cover","hotspots":[{"id":"wr-cloth","label":"布","x":9.65,"y":25.95,"w":9.13,"h":23.67,"action":{"type":"pickup","item":"cloth"}},{"id":"wr-mirror","label":"鏡","x":22.86,"y":9.84,"w":29.66,"h":29.66,"action":{"type":"pickup","item":"mirror"}},{"id":"wr-sink","label":"洗面台","x":17.82,"y":43.92,"w":34.51,"h":15.97,"action":{"type":"message","key":"wr.sink"}}]}}};

  const USE_SYNTH_RAIN = true; // ギャップレスを優先するためデフォルトで合成雨音を使用

  const audio = {
    rain: new Audio("assets/audio/amb-rain-loop.wav"),
    short: new Audio("assets/audio/sfx-beep-short.wav"),
    long: new Audio("assets/audio/sfx-beep-long.wav"),
    power: new Audio("assets/audio/sfx-power-on.wav"),
    unlock: new Audio("assets/audio/sfx-unlock.wav"),
    error: new Audio("assets/audio/sfx-error.wav"),
  };
  audio.rain.loop = true;
  audio.rain.volume = 0.12;

  // Web Audio: 雨音（WAV再生 or 合成ノイズ）をギャップレスで再生
  let rainCtx = null;
  let rainBuffer = null;
  let rainCurrent = null; // {src,gain}
  let rainTimer = null;
  const RAIN_FADE = 0.12; // sec crossfade

  function createNoiseBuffer(ctx, durationSec = 2, sampleRate = 44100) {
    const frameCount = Math.floor(durationSec * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      // Brownian-ish noise for soft rain
      const white = Math.random() * 2 - 1;
      data[i] = (i === 0 ? white : (data[i - 1] * 0.98 + white * 0.02)) * 0.4;
    }
    return buffer;
  }

  async function ensureRainBuffer() {
    if (rainBuffer) return;
    rainCtx = rainCtx || new AudioContext();
    if (USE_SYNTH_RAIN) {
      rainBuffer = createNoiseBuffer(rainCtx, 2, rainCtx.sampleRate);
      return;
    }
    const res = await fetch("assets/audio/amb-rain-loop.wav");
    const buf = await res.arrayBuffer();
    rainBuffer = await rainCtx.decodeAudioData(buf);
  }

  function startRainWebAudio() {
    if (!rainCtx || !rainBuffer) return;
    stopRainWebAudio();
    scheduleNextSource();
  }

  function stopRainWebAudio() {
    if (rainTimer) {
      clearTimeout(rainTimer);
      rainTimer = null;
    }
    if (rainCurrent?.src) {
      try {
        rainCurrent.src.stop();
      } catch {}
    }
    rainCurrent = null;
  }

  function scheduleNextSource() {
    const ctx = rainCtx;
    const src = ctx.createBufferSource();
    src.buffer = rainBuffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(audio.rain.volume, ctx.currentTime);
    src.connect(gain).connect(ctx.destination);

    // ざらつきを抑えるため、簡易ローパス＋ハイパスを追加
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 1800;
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 80;
    src.disconnect();
    src.connect(low).connect(high).connect(gain).connect(ctx.destination);

    const startAt = ctx.currentTime;
    src.start(startAt);

    const duration = rainBuffer.duration;
    const fadeTime = Math.min(RAIN_FADE, duration * 0.25);
    rainTimer = setTimeout(() => {
      crossfadeToNext();
    }, Math.max(0, (duration - fadeTime) * 1000));

    rainCurrent = { src, gain, startAt, duration, fadeTime };
  }

  function crossfadeToNext() {
    if (!rainCurrent) {
      scheduleNextSource();
      return;
    }
    const ctx = rainCtx;
    const { src: oldSrc, gain: oldGain, duration, fadeTime } = rainCurrent;
    const now = ctx.currentTime;

    const newSrc = ctx.createBufferSource();
    newSrc.buffer = rainBuffer;
    const newGain = ctx.createGain();
    newGain.gain.setValueAtTime(0, now);

    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 1800;
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 80;
    newSrc.connect(low).connect(high).connect(newGain).connect(ctx.destination);

    newSrc.start(now);

    newGain.gain.linearRampToValueAtTime(audio.rain.volume, now + fadeTime);
    oldGain.gain.setValueAtTime(oldGain.gain.value, now);
    oldGain.gain.linearRampToValueAtTime(0, now + fadeTime);
    oldSrc.stop(now + fadeTime + 0.02);

    rainCurrent = { src: newSrc, gain: newGain, startAt: now, duration, fadeTime };
    rainTimer = setTimeout(() => crossfadeToNext(), Math.max(0, (duration - fadeTime) * 1000));
  }

  let gameData = null;
  let state = null;
  let selectedItem = null;
  let activeModal = null;
  let roomMessageTimer = null;
  let audioUnlocked = false;
  let highFx = false;
  let useVirtualTimeForTests = false;
  let virtualClockMs = 0;
  const virtualDelayQueue = [];
  const assetExistsCache = new Map();

  const normalizeText = (value) =>
    String(value ?? "")
      .trim()
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

  async function hasAsset(path) {
    if (assetExistsCache.has(path)) {
      return assetExistsCache.get(path);
    }
    const probe = fetch(path, { method: "HEAD", cache: "no-store" })
      .then((res) => res.ok)
      .catch(() => false);
    assetExistsCache.set(path, probe);
    return probe;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function pushLog(text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, MAX_LOGS);
    saveState();
    renderLog();
  }

  function showRoomMessage(text) {
    roomMessage.textContent = text;
    roomMessage.classList.add("is-show");
    if (roomMessageTimer) {
      window.clearTimeout(roomMessageTimer);
    }
    roomMessageTimer = window.setTimeout(() => {
      roomMessage.classList.remove("is-show");
    }, 2200);
  }

  function hasItem(id) {
    return state.inventory.includes(id);
  }

  function addItem(id) {
    if (hasItem(id)) return false;
    state.inventory.push(id);
    saveState();
    renderInventory();
    return true;
  }

  function setFlag(flag, value = true) {
    state.flags[flag] = value;
    saveState();
    if (flag === "powerOn") {
      renderStage();
    }
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Web Audio優先（ギャップレス）
    ensureRainBuffer()
      .then(() => {
        if (!rainCtx) return;
        if (rainCtx.state === "suspended") rainCtx.resume();
        startRainWebAudio();
      })
      .catch(() => {
        // フォールバック: HTMLAudio
        audio.rain.play().catch(() => {});
      });
  }

  function playSound(key) {
    const sound = audio[key];
    if (!sound) return;
    try {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch {
      // no-op
    }
  }

  function setScene(sceneId) {
    state.scene = sceneId;
    saveState();
    tabButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.scene === sceneId));
    renderStage();
    renderHotspots();
    pushLog(`${sceneNames[sceneId]}へ移動した。`);
  }

  async function resolveSceneBackground(sceneId, powerOn) {
    const scene = gameData.scenes[sceneId];
    if (!scene) return null;
    if (sceneId !== "record-room") return scene.background;

    const preferred = powerOn ? (scene.backgroundOn ?? scene.background) : (scene.backgroundOff ?? scene.background);
    if (!preferred || preferred === scene.background) return scene.background;
    if (await hasAsset(preferred)) return preferred;
    return scene.background;
  }

  function renderStage() {
    const sceneId = state.scene;
    const powerOn = Boolean(state.flags.powerOn);
    const scene = gameData.scenes[sceneId];
    stage.style.backgroundSize = scene.fit;
    stage.style.backgroundImage = `url(${scene.background})`;
    void resolveSceneBackground(sceneId, powerOn).then((background) => {
      if (!background) return;
      if (state.scene !== sceneId) return;
      if (sceneId === "record-room" && Boolean(state.flags.powerOn) !== powerOn) return;
      stage.style.backgroundImage = `url(${background})`;
    });
  }

  function renderHotspots() {
    hotspotsEl.innerHTML = "";
    const scene = gameData.scenes[state.scene];
    for (const spot of scene.hotspots) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hotspot";
      btn.style.setProperty("--x", String(spot.x));
      btn.style.setProperty("--y", String(spot.y));
      btn.style.setProperty("--w", String(spot.w));
      btn.style.setProperty("--h", String(spot.h));
      btn.setAttribute("aria-label", spot.label);
      if (SHOW_HOTSPOT_ICONS && spot.icon) {
        const icon = document.createElement("div");
        icon.className = "hotspot-icon";
        icon.style.backgroundImage = `url(${spot.icon})`;
        btn.appendChild(icon);
      }
      btn.addEventListener("click", () => handleHotspot(spot));
      hotspotsEl.appendChild(btn);
    }
  }

  function renderInventory() {
    inventoryItems.innerHTML = "";
    if (state.inventory.length === 0) {
      inventoryEmpty.style.display = "block";
      return;
    }
    inventoryEmpty.style.display = "none";

    for (const id of state.inventory) {
      const def = ITEM_DEFS[id] ?? { name: id, img: "assets/paper-record-template.png", desc: "" };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item-btn";
      btn.classList.toggle("is-selected", selectedItem === id);

      const img = document.createElement("img");
      img.src = def.img;
      img.alt = `${def.name}の画像`;

      const textWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = def.name;
      const sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = selectedItem === id ? "使用中" : "タップで詳細";
      textWrap.appendChild(name);
      textWrap.appendChild(sub);

      btn.appendChild(img);
      btn.appendChild(textWrap);

      btn.addEventListener("click", () => {
        if (selectedItem === id) {
          openItemModal(id);
          return;
        }
        selectedItem = id;
        renderInventory();
        showRoomMessage(`${def.name}を選択した。`);
      });

      inventoryItems.appendChild(btn);
    }
  }

  function renderLog() {
    logList.innerHTML = "";
    for (const entry of state.log) {
      const li = document.createElement("li");
      li.textContent = entry;
      logList.appendChild(li);
    }
  }

  function getHintTopic() {
    if (!state.flags.hasFlashlight) return "get-flashlight";
    if (!state.flags.hasCloth) return "get-cloth";
    if (!state.flags.hasMirror) return "get-mirror";
    if (!state.flags.windowCleared) return "window";
    if (!state.flags.scaleSolved) return "scale";
    if (!state.flags.audioDecoded) return "recorder";
    if (!state.flags.bottlesSolved) return "bottles";
    if (!state.flags.hasRedFilm) return "case";
    if (!state.flags.hasPlug) return "drawer07";
    if (!state.flags.powerOn) return "panel";
    if (!state.flags.heatInkRevealed) return "lamp";
    if (!state.flags.ledgerRestored) return "ledger";
    if (!state.flags.shelfSorted) return "sort";
    if (!state.flags.directionSolved) return "direction";
    if (!state.flags.doorUnlocked) return "door";
    if (!state.flags.clockFinalSet) return "clock";
    return "done";
  }

  const HINTS = {
    "get-flashlight": [
      "廊下を調べよう。暗い場所は光が必要だ。",
      "コート掛け周辺に目を向けると、手に取れるものがある。",
      "廊下のコート掛けで懐中電灯を入手して。",
    ],
    "get-cloth": [
      "窓の曇りが気になる。拭けるものを探そう。",
      "洗面に布があるかもしれない。",
      "洗面で布を取って、記録室の窓へ。",
    ],
    "get-mirror": [
      "読めない数字があるなら、反転して見る手段を探そう。",
      "洗面の鏡が使えそうだ。",
      "洗面で鏡を取って、保管庫の小箱へ。",
    ],
    window: [
      "記録室の窓を調べよう。",
      "布があれば、曇りを拭ける。",
      "窓を拭くと矢印が出る。表示は「↗ ↘ ↙」だが右から読む。",
    ],
    scale: [
      "記録室の秤を調べよう。",
      "軽い/重いを並べて、2進数として読む。",
      "1011(2) → 11(10)。引き出し04の数字。",
    ],
    recorder: [
      "机のレコーダーを再生しよう。",
      "短/長を廊下の掲示板の表で数字にする。",
      "2桁は 20。引き出し08の数字、日付の欠けにも使う。",
    ],
    bottles: [
      "保管庫の瓶を並べ替えよう。",
      "ラベルを並べて語にする。",
      "「アメオト」に揃えるとテープが手に入る。",
    ],
    case: [
      "保管庫の小箱はそのままでは読めない。",
      "鏡で反転して数字を読む。",
      "正しい数字は 319。赤フィルムを入手。",
    ],
    drawer07: [
      "引き出し07は条件付きだ。",
      "赤フィルムを入手すると開くようになる。",
      "赤フィルム入手後、引き出し07でプラグを取って配電盤へ。",
    ],
    panel: [
      "電気スタンドは電気が来ていない。",
      "プラグを接続し、配電盤の差し替えを行う。",
      "配電盤で正しく差し替えると通電する。",
    ],
    lamp: [
      "通電後、スタンドを調べよう。",
      "熱で文字が出る紙をかざす。",
      "熱インクで貼り順のヒントが出る。台帳復元へ。",
    ],
    ledger: [
      "台帳の欠落ページを復元しよう。",
      "破片3枚とテープが必要。熱インクの示唆も確認。",
      "復元すると『月=時、日=分』と方向入力の読み方が手に入る。",
    ],
    sort: [
      "記録片を整列しよう。",
      "スタンプの列（記→録→雨→音）と連番（1→4）で並べる。",
      "文ができ、空白から 814 が出る。",
    ],
    direction: [
      "矢印を引き出し棚で辿ろう。",
      "開始は 07。到着先の“赤い数字”を読む。",
      "赤数字は 3→6→2。後半は 362。",
    ],
    door: [
      "出口は6桁だ。",
      "前半=棚（814）、後半=矢印（362）。",
      "814362 を入力。",
    ],
    clock: [
      "まだ終わっていない。時計を進めよう。",
      "日付を時刻に変換する（台帳）。",
      "2020/06/20 → 06:20。時計を06:20に。",
    ],
    done: ["脱出済み。", "脱出済み。", "脱出済み。"],
  };

  function renderHints() {
    const topic = getHintTopic();
    const lines = HINTS[topic] ?? ["……", "……", "……"];
    const text = lines[state.hintLevel] ?? lines[0];
    hintBody.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = text;
    hintBody.appendChild(p);
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.backdrop.remove();
    activeModal = null;
  }

  function openModal(title, render) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    const modal = document.createElement("section");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const head = document.createElement("header");
    head.className = "modal-head";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ghost-btn";
    closeBtn.textContent = "閉じる";
    closeBtn.addEventListener("click", closeModal);
    head.appendChild(h3);
    head.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body";

    modal.appendChild(head);
    modal.appendChild(body);
    backdrop.appendChild(modal);
    modalRoot.appendChild(backdrop);

    activeModal = { backdrop, modal, body };
    render(body);
  }

  function getModalImage(name) {
    const candidates = [];
    if (name === "scale") {
      candidates.push("assets/scale.png");
    }
    if (name === "lamp") {
      candidates.push(state.flags.powerOn ? "assets/lamp-on.png" : "assets/lamp-off.png");
    }
    const fallback = MODAL_IMAGE_FALLBACK[name];
    if (fallback) candidates.push(fallback);
    const unique = [...new Set(candidates.filter(Boolean))];
    if (unique.length === 0) return null;
    return unique.length === 1 ? unique[0] : unique;
  }

  function appendModalLeadImage(body, src, label) {
    const sources = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : [];
    if (sources.length === 0) return;
    const img = document.createElement("img");
    img.alt = `${label}の画像`;
    img.style.width = "100%";
    img.style.maxWidth = "420px";
    img.style.borderRadius = "18px";
    img.style.border = "1px solid rgba(29,33,41,0.14)";
    img.style.background = "rgba(255,255,255,0.85)";
    img.style.display = "block";
    img.style.marginBottom = "12px";
    body.appendChild(img);
    void (async () => {
      for (const source of sources) {
        if (await hasAsset(source)) {
          img.src = source;
          return;
        }
      }
      console.warn(`[asset] lead image not found for ${label}:`, sources);
      img.remove();
    })();
  }

  function openItemModal(itemId) {
    const def = ITEM_DEFS[itemId] ?? { name: itemId, img: "assets/paper-record-template.png", desc: "" };
    openModal(def.name, (body) => {
      const img = document.createElement("img");
      img.src = def.img;
      img.alt = `${def.name}の画像`;
      img.style.width = "100%";
      img.style.maxWidth = "420px";
      img.style.borderRadius = "18px";
      img.style.border = "1px solid rgba(29,33,41,0.14)";
      img.style.background = "rgba(255,255,255,0.85)";

      const desc = document.createElement("p");
      desc.textContent = def.desc;

      const btnRow = document.createElement("div");
      btnRow.className = "btn-row";

      const useBtn = document.createElement("button");
      useBtn.type = "button";
      useBtn.className = "btn primary";
      useBtn.textContent = selectedItem === itemId ? "使用解除" : "使用する";
      useBtn.addEventListener("click", () => {
        selectedItem = selectedItem === itemId ? null : itemId;
        renderInventory();
        closeModal();
      });

      btnRow.appendChild(useBtn);

      if (itemId === "red-film") {
        const lookBtn = document.createElement("button");
        lookBtn.type = "button";
        lookBtn.className = "btn";
        lookBtn.textContent = "覗く";
        lookBtn.addEventListener("click", () => {
          pushLog("赤フィルム越しに見ると「736」が浮かんで見えた。");
          showRoomMessage("736");
          renderHints();
        });
        btnRow.appendChild(lookBtn);
      }

      if (itemId === "matchbox" && !state.flags.readDirectionRuleKnown) {
        const readBtn = document.createElement("button");
        readBtn.type = "button";
        readBtn.className = "btn";
        readBtn.textContent = "内側を見る";
        readBtn.addEventListener("click", () => {
          setFlag("readDirectionRuleKnown", true);
          pushLog("マッチ箱の内側を見た。「雨は右から読む」");
          showRoomMessage("「雨は右から読む」");
          renderHints();
        });
        btnRow.appendChild(readBtn);
      }

      if (itemId === "fold-paper" && !state.flags.foldSolved) {
        const foldBtn = document.createElement("button");
        foldBtn.type = "button";
        foldBtn.className = "btn";
        foldBtn.textContent = "折る";
        foldBtn.addEventListener("click", () => {
          state.notes.foldCount = (state.notes.foldCount ?? 0) + 1;
          saveState();
          if (state.notes.foldCount >= 2) {
            setFlag("foldSolved", true);
            pushLog("折り線の紙を折ると「15」が浮かび上がった。");
            showRoomMessage("「15」が浮かび上がった。");
            renderHints();
          } else {
            showRoomMessage("折り目が揃ってきた…");
          }
        });
        btnRow.appendChild(foldBtn);
      }

      body.appendChild(img);
      body.appendChild(desc);
      body.appendChild(btnRow);
    });
  }

  function handleHotspot(spot) {
    unlockAudio();
    if (Array.isArray(spot.requires) && spot.requires.length > 0) {
      const ok = spot.requires.every((key) => Boolean(state.flags[key]));
      if (!ok) {
        showRoomMessage("今はまだできない。");
        return;
      }
    }
    if (Array.isArray(spot.requiresAny) && spot.requiresAny.length > 0) {
      const ok = spot.requiresAny.some((key) => Boolean(state.flags[key]));
      if (!ok) {
        showRoomMessage("今はまだできない。");
        return;
      }
    }
    const action = spot.action;
    if (action.type === "pickup") {
      handlePickup(action.item);
      return;
    }
    if (action.type === "message") {
      showRoomMessage("水滴の跡がある。湿った空気が肌に触れる。");
      pushLog("洗面台を調べた。");
      return;
    }
    if (action.type === "modal") {
      openNamedModal(action.name, { label: spot.label });
    }
  }

  function handlePickup(itemId) {
    const def = ITEM_DEFS[itemId] ?? { name: itemId };
    if (hasItem(itemId)) {
      showRoomMessage(`${def.name}はもう持っている。`);
      return;
    }
    addItem(itemId);
    if (itemId === "cloth") setFlag("hasCloth", true);
    if (itemId === "mirror") setFlag("hasMirror", true);
    if (itemId === "flashlight") setFlag("hasFlashlight", true);
    if (itemId === "tape") setFlag("hasTape", true);
    if (itemId === "plug") setFlag("hasPlug", true);
    if (itemId === "red-film") setFlag("hasRedFilm", true);
    if (itemId === "torn-a") {
      state.pieces.tornPapers.a = true;
      saveState();
    }
    pushLog(`${def.name}を手に入れた。`);
    showRoomMessage(`${def.name}を手に入れた。`);
    renderHints();
  }

  function openNamedModal(name, meta = {}) {
    switch (name) {
      case "drawers":
        openDrawersModal(meta);
        return;
      case "window":
        openWindowModal(meta);
        return;
      case "scale":
        openScaleModal(meta);
        return;
      case "recorder":
        openRecorderModal(meta);
        return;
      case "board":
        openBoardModal(meta);
        return;
      case "bottles":
        openBottlesModal(meta);
        return;
      case "case":
        openCaseModal(meta);
        return;
      case "panel":
        openPanelModal(meta);
        return;
      case "lamp":
        openLampModal(meta);
        return;
      case "desk":
        openDeskModal(meta);
        return;
      case "door":
        openDoorModal(meta);
        return;
      case "clock":
        openClockModal(meta);
        return;
      default:
        showRoomMessage("まだ未実装の対象です。");
    }
  }

  function getDrawerMeta(drawerId) {
    const drawer = state.drawers[drawerId];
    const locked = !canOpenDrawer(drawerId).ok;
    const opened = drawer.opened;
    const taken = drawer.taken;
    if (opened && taken) return "開封済み";
    if (opened) return "中身あり";
    if (locked) return "ロック";
    return "未開封";
  }

  function openDrawersModal(meta = {}) {
    openModal("引き出し棚（4×4）", (body) => {
      appendModalLeadImage(body, getModalImage("drawers", meta), meta.label ?? "引き出し棚");
      const info = document.createElement("p");
      info.className = "muted";
      info.textContent = "引き出しを選んで開ける。集めた記録は後で整列できる。";

      const grid = document.createElement("div");
      grid.className = "grid16";

      const ids = Object.keys(state.drawers).sort((a, b) => Number(a) - Number(b));
      for (const id of ids) {
        const drawer = state.drawers[id];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell";
        btn.addEventListener("click", () => openDrawerDetailModal(id));

        const top = document.createElement("div");
        top.className = "id";
        top.textContent = id;
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = getDrawerMeta(id);

        if (drawer.opened && !drawer.taken) {
          meta.textContent = "中身あり";
        }

        btn.appendChild(top);
        btn.appendChild(meta);

        grid.appendChild(btn);
      }

      const actions = document.createElement("div");
      actions.className = "btn-row";

      const sortBtn = document.createElement("button");
      sortBtn.type = "button";
      sortBtn.className = "btn";
      sortBtn.textContent = "記録を整列する";
      sortBtn.addEventListener("click", openSortModal);

      const directionBtn = document.createElement("button");
      directionBtn.type = "button";
      directionBtn.className = "btn";
      directionBtn.textContent = "方向入力（矢印）";
      directionBtn.addEventListener("click", openDirectionModal);

      actions.appendChild(sortBtn);
      actions.appendChild(directionBtn);

      body.appendChild(info);
      body.appendChild(actions);
      body.appendChild(grid);
    });
  }

  function canOpenDrawer(drawerId) {
    const drawer = state.drawers[drawerId];
    const lock = drawer.lock;
    if (lock.type === "none") return { ok: true };
    if (lock.type === "text") return { ok: false, reason: "text", key: lock.key };
    if (lock.type === "code") return { ok: false, reason: "code", key: lock.key };
    if (lock.type === "condition") {
      const ok = Boolean(state.flags[lock.key]);
      return ok ? { ok: true } : { ok: false, reason: "condition", key: lock.key };
    }
    if (lock.type === "hint") {
      if (lock.key === "tornCombine") return state.flags.tornPaperCombined ? { ok: true } : { ok: false, reason: "hint", key: lock.key };
      if (lock.key === "clockCoord") return state.flags.clockCoordUsed ? { ok: true } : { ok: false, reason: "hint", key: lock.key };
      return { ok: false, reason: "hint", key: lock.key };
    }
    return { ok: false, reason: "unknown" };
  }

  function openDrawerDetailModal(drawerId) {
    const drawer = state.drawers[drawerId];
    openModal(`引き出し ${drawerId}`, (body) => {
      const statusRow = document.createElement("div");
      statusRow.className = "btn-row";

      const pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = getDrawerMeta(drawerId);
      statusRow.appendChild(pill);

      if (state.flags.hasRedFilm) {
        const red = document.createElement("span");
        red.className = "pill";
        red.textContent = `赤: ${RED_DIGITS[drawerId]}`;
        statusRow.appendChild(red);
      }

      body.appendChild(statusRow);

      const openCheck = canOpenDrawer(drawerId);
      if (!drawer.opened) {
        if (openCheck.ok) {
          drawer.opened = true;
          saveState();
          pushLog(`引き出し${drawerId}を開けた。`);
        }
      }

      if (!drawer.opened && openCheck.reason === "condition") {
        body.appendChild(messageBlock("引っかかって開かない。今はまだ条件が足りない。"));
        return;
      }

      if (!drawer.opened && openCheck.reason === "hint") {
        body.appendChild(messageBlock("何か手がかりが必要だ。"));
        return;
      }

      if (!drawer.opened && openCheck.reason === "text") {
        const def = ANSWERS[openCheck.key];
        body.appendChild(messageBlock(def?.prompt ?? "欠けた文字を埋めてください。"));
        body.appendChild(textUnlockForm(def?.title ?? "入力", (value) => {
          if (!def || !def.ok(value)) return { ok: false, error: "違うようだ。" };
          drawer.opened = true;
          saveState();
          pushLog(`引き出し${drawerId}を開けた。`);
          return { ok: true };
        }));
        return;
      }

      if (!drawer.opened && openCheck.reason === "code") {
        body.appendChild(messageBlock("数字で開くロックが付いている。"));
        body.appendChild(codeUnlockForm(openCheck.key, (value) => {
          const v = normalizeText(value);
          if (openCheck.key === "scaleCode") return v === "11";
          if (openCheck.key === "audioDigits") return v === "20";
          if (openCheck.key === "redFilmCode") return v === "736";
          return false;
        }, () => {
          drawer.opened = true;
          saveState();
          pushLog(`引き出し${drawerId}を開けた。`);
        }));
        return;
      }

      if (!drawer.taken) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn primary";
        btn.textContent = "中身を取る";
        btn.addEventListener("click", () => {
          takeDrawerContents(drawerId);
          closeModal();
          openDrawerDetailModal(drawerId);
        });
        body.appendChild(btn);
      } else {
        body.appendChild(messageBlock("中は空だ。"));
      }
    });
  }

  function messageBlock(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }

  function textUnlockForm(label, validator) {
    const wrap = document.createElement("form");
    wrap.className = "field";
    wrap.addEventListener("submit", (e) => {
      e.preventDefault();
    });
    const l = document.createElement("label");
    l.textContent = label;
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    const msg = document.createElement("div");
    msg.className = "muted";
    msg.textContent = "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary";
    btn.textContent = "決定";
    btn.addEventListener("click", () => {
      const result = validator(input.value);
      if (!result.ok) {
        playSound("error");
        msg.textContent = result.error ?? "違うようだ。";
        return;
      }
      playSound("unlock");
      closeModal();
    });
    wrap.appendChild(l);
    wrap.appendChild(input);
    wrap.appendChild(btn);
    wrap.appendChild(msg);
    return wrap;
  }

  function codeUnlockForm(key, check, onSuccess) {
    const wrap = document.createElement("form");
    wrap.className = "field";
    wrap.addEventListener("submit", (e) => e.preventDefault());
    const label = document.createElement("label");
    label.textContent = "数字";
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "one-time-code";
    const msg = document.createElement("div");
    msg.className = "muted";
    msg.textContent = "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary";
    btn.textContent = "開ける";
    btn.addEventListener("click", () => {
      if (!check(input.value)) {
        playSound("error");
        msg.textContent = "違うようだ。";
        return;
      }
      playSound("unlock");
      if (key === "scaleCode") setFlag("scaleSolved", true);
      if (key === "audioDigits") setFlag("audioDecoded", true);
      onSuccess();
      closeModal();
    });
    wrap.appendChild(label);
    wrap.appendChild(input);
    wrap.appendChild(btn);
    wrap.appendChild(msg);
    return wrap;
  }

  function takeDrawerContents(drawerId) {
    const drawer = state.drawers[drawerId];
    if (drawer.taken) return;
    drawer.taken = true;
    saveState();
    const messages = [];

    for (const entry of drawer.contents) {
      const [kind, value] = entry.split(":");
      if (kind === "record") {
        if (!state.pieces.records[value]) {
          state.pieces.records[value] = true;
          messages.push(`記録片「${RECORD_TEXT[value]}」を手に入れた。`);
        }
        continue;
      }
      if (kind === "ledger") {
        state.pieces.ledgerScraps[value] = true;
        messages.push(`台帳の破片${value}を手に入れた。`);
        continue;
      }
      if (kind === "torn") {
        const itemId = `torn-${value}`;
        if (addItem(itemId)) {
          state.pieces.tornPapers[value] = true;
          messages.push(`${ITEM_DEFS[itemId].name}を手に入れた。`);
        }
        continue;
      }
      if (kind === "paper" && value === "fold") {
        addItem("fold-paper");
        state.pieces.foldPaper = true;
        messages.push("折り線の紙を手に入れた。");
        continue;
      }
      if (kind === "paper" && value === "heatInkTarget") {
        addItem("heat-paper");
        messages.push("熱で出る紙を手に入れた。");
        continue;
      }
      if (kind === "item" && value === "matchbox") {
        addItem("matchbox");
        messages.push("マッチ箱を手に入れた。");
        continue;
      }
      if (kind === "item" && value === "plug") {
        addItem("plug");
        setFlag("hasPlug", true);
        messages.push("プラグを手に入れた。");
        continue;
      }
      if (kind === "note" && value === "stampDate") {
        state.notes.stampDate.month = 6;
        saveState();
        messages.push("紙の隅に「2020/06/??」のスタンプがある。");
        continue;
      }
      if (kind === "note") {
        messages.push("メモを見つけた。");
        continue;
      }
    }

    saveState();
    for (const m of messages) pushLog(m);
    if (messages.length > 0) showRoomMessage(messages[0]);
    renderHints();
  }

  function openWindowModal() {
    openModal("窓", (body) => {
      const imgWrap = document.createElement("div");
      imgWrap.style.position = "relative";
      imgWrap.style.width = "100%";
      imgWrap.style.maxWidth = "520px";
      imgWrap.style.borderRadius = "18px";
      imgWrap.style.overflow = "hidden";
      imgWrap.style.border = "1px solid rgba(29,33,41,0.14)";

      const base = document.createElement("img");
      base.src = "assets/window.png";
      base.alt = "窓";
      base.style.width = "100%";
      base.style.display = "block";

      const fog = document.createElement("img");
      fog.src = "assets/fx-fog.png";
      fog.alt = "曇り";
      fog.style.position = "absolute";
      fog.style.inset = "0";
      fog.style.width = "100%";
      fog.style.height = "100%";
      fog.style.objectFit = "cover";
      fog.style.opacity = state.flags.windowCleared ? "0" : "1";
      fog.style.transition = "opacity 0.3s ease";

      imgWrap.appendChild(base);
      imgWrap.appendChild(fog);

      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = state.flags.windowCleared ? "矢印が見える。" : "ガラスが曇っている。";

      const row = document.createElement("div");
      row.className = "btn-row";

      const wipeBtn = document.createElement("button");
      wipeBtn.type = "button";
      wipeBtn.className = "btn primary";
      wipeBtn.textContent = "布で拭く";
      wipeBtn.addEventListener("click", () => {
        if (!state.flags.hasCloth) {
          playSound("error");
          showRoomMessage("布がない。");
          return;
        }
        setFlag("windowCleared", true);
        state.notes.windowArrows = ["↗", "↘", "↙"];
        saveState();
        fog.style.opacity = "0";
        note.textContent = "矢印が見える。";
        pushLog("窓を拭いた。矢印が現れた。");
        showRoomMessage("「↗ ↘ ↙」");
        renderHints();
      });

      const ruleBtn = document.createElement("button");
      ruleBtn.type = "button";
      ruleBtn.className = "btn";
      ruleBtn.textContent = "読む向きを確認";
      ruleBtn.addEventListener("click", () => {
        if (!state.flags.readDirectionRuleKnown) {
          showRoomMessage("読む向きが分からない…");
          pushLog("読む向きの規則が必要だ。");
          return;
        }
        showRoomMessage("右から読む。");
        pushLog("読む向きは右からだ。");
      });

      row.appendChild(wipeBtn);
      row.appendChild(ruleBtn);

      body.appendChild(imgWrap);
      body.appendChild(note);
      if (state.flags.windowCleared) {
        const arrows = document.createElement("p");
        arrows.textContent = `表示: ${state.notes.windowArrows.join(" ")} / 読む: ${state.notes.windowArrows.slice().reverse().join(" ")}`;
        body.appendChild(arrows);
      }
      body.appendChild(row);
    });
  }

  function openScaleModal(meta = {}) {
    openModal("秤", (body) => {
      appendModalLeadImage(body, getModalImage("scale", meta), meta.label ?? "秤");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "軽い=0 / 重い=1 として4桁の2進数にする。";

      const bits = document.createElement("div");
      bits.className = "btn-row";
      const values = state.notes.scaleBits ?? [1, 0, 1, 1];
      state.notes.scaleBits = values;
      saveState();

      const toggles = values.map((v, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = v ? `重い(1) #${i + 1}` : `軽い(0) #${i + 1}`;
        b.addEventListener("click", () => {
          values[i] = values[i] ? 0 : 1;
          b.textContent = values[i] ? `重い(1) #${i + 1}` : `軽い(0) #${i + 1}`;
          saveState();
        });
        return b;
      });
      toggles.forEach((b) => bits.appendChild(b));

      const result = document.createElement("p");
      result.className = "muted";
      result.textContent = state.flags.scaleSolved ? "解けた。答えは 11。" : "まだ確信がない。";

      const solve = document.createElement("button");
      solve.type = "button";
      solve.className = "btn primary";
      solve.textContent = "確定";
      solve.addEventListener("click", () => {
        const code = values.join("");
        if (code !== "1011") {
          playSound("error");
          showRoomMessage("違うようだ。");
          result.textContent = `今の並び: ${code}(2)`;
          return;
        }
        playSound("unlock");
        setFlag("scaleSolved", true);
        pushLog("秤の結果は 1011(2) → 11(10)。");
        result.textContent = "答えは 11。引き出し04に使える。";
        renderHints();
      });

      body.appendChild(p);
      body.appendChild(bits);
      body.appendChild(solve);
      body.appendChild(result);
    });
  }

  function openRecorderModal(meta = {}) {
    openModal("レコーダー", (body) => {
      appendModalLeadImage(body, getModalImage("recorder", meta), meta.label ?? "レコーダー");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "雨音の間に短い音と長い音が混じっている。";

      const pattern = document.createElement("p");
      pattern.textContent = state.flags.audioDecoded ? "短 長 短 短 / 長 長 長 長（=20）" : "（再生して記録する）";

      const row = document.createElement("div");
      row.className = "btn-row";

      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "btn primary";
      playBtn.textContent = "再生";
      playBtn.addEventListener("click", async () => {
        playSound("short");
        await wait(200);
        playSound("long");
        await wait(240);
        playSound("short");
        await wait(200);
        playSound("short");
        await wait(240);
        playSound("long");
        await wait(160);
        playSound("long");
        await wait(160);
        playSound("long");
        await wait(160);
        playSound("long");

        setFlag("audioDecoded", true);
        state.notes.audioDigits = "20";
        state.notes.stampDate.day = 20;
        saveState();
        pattern.textContent = "短 長 短 短 / 長 長 長 長（=20）";
        pushLog("レコーダーを再生した。短長の列を記録した。");
        showRoomMessage("短 長 短 短 / 長 長 長 長");
        renderHints();
      });

      const boardBtn = document.createElement("button");
      boardBtn.type = "button";
      boardBtn.className = "btn";
      boardBtn.textContent = "符号表を見る";
      boardBtn.addEventListener("click", () => openBoardModal());

      row.appendChild(playBtn);
      row.appendChild(boardBtn);

      body.appendChild(p);
      body.appendChild(pattern);
      body.appendChild(row);
    });
  }

  function openBoardModal(meta = {}) {
    openModal("掲示板（符号表）", (body) => {
      appendModalLeadImage(body, getModalImage("board", meta), meta.label ?? "掲示板");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "短/長の4つ並びを数字にする。";
      const list = document.createElement("div");
      list.className = "grid16";
      const samples = [
        ["短短短短", "0"],
        ["短長短短", "2"],
        ["長長長長", "0"],
        ["短短長長", "3"],
        ["長短短長", "7"],
      ];
      for (const [a, b] of samples) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.style.cursor = "default";
        const id = document.createElement("div");
        id.className = "id";
        id.textContent = a;
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `→ ${b}`;
        cell.appendChild(id);
        cell.appendChild(meta);
        list.appendChild(cell);
      }
      body.appendChild(p);
      body.appendChild(list);
      pushLog("掲示板の符号表を確認した。");
    });
  }

  function openBottlesModal(meta = {}) {
    openModal("標本瓶", (body) => {
      appendModalLeadImage(body, getModalImage("bottles", meta), meta.label ?? "標本瓶");
      const target = ["ア", "メ", "オ", "ト", ""];
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "瓶のラベルを正しい順に揃える。";

      const pool = ["ア", "メ", "オ", "ト", "・"];
      shuffle(pool);

      const chosen = [];
      const chosenEl = document.createElement("p");
      chosenEl.textContent = "選択: （まだ）";

      const row = document.createElement("div");
      row.className = "btn-row";

      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "btn";
      resetBtn.textContent = "やり直す";
      resetBtn.addEventListener("click", () => {
        chosen.length = 0;
        chosenEl.textContent = "選択: （まだ）";
      });

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn primary";
      confirmBtn.textContent = "確定";
      confirmBtn.addEventListener("click", () => {
        const word = chosen.join("").replace("・", "");
        if (word !== "アメオト") {
          playSound("error");
          showRoomMessage("違うようだ。");
          return;
        }
        playSound("unlock");
        setFlag("bottlesSolved", true);
        setFlag("tapeFree", true);
        if (!state.flags.hasTape) {
          addItem("tape");
          setFlag("hasTape", true);
        }
        pushLog("瓶を並べ替えた。テープを手に入れた。");
        showRoomMessage("テープを手に入れた。");
        renderHints();
      });

      row.appendChild(resetBtn);
      row.appendChild(confirmBtn);

      const buttons = document.createElement("div");
      buttons.className = "btn-row";
      for (const ch of pool) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = ch === "・" ? "（空）" : ch;
        b.addEventListener("click", () => {
          if (chosen.length >= 5) return;
          chosen.push(ch);
          chosenEl.textContent = `選択: ${chosen.join(" ")}`;
        });
        buttons.appendChild(b);
      }

      body.appendChild(p);
      body.appendChild(chosenEl);
      body.appendChild(buttons);
      body.appendChild(row);
    });
  }

  function openCaseModal(meta = {}) {
    openModal("小箱", (body) => {
      appendModalLeadImage(body, getModalImage("case", meta), meta.label ?? "小箱");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = state.flags.hasMirror ? "鏡越しなら数字が読めそうだ。" : "数字が反転していて読めない。";
      body.appendChild(p);

      const display = document.createElement("p");
      display.textContent = state.flags.hasMirror ? "数字: 319" : "数字: ƐI6";
      body.appendChild(display);

      if (!state.flags.hasMirror) {
        body.appendChild(messageBlock("鏡が必要だ。"));
        return;
      }

      const form = document.createElement("div");
      form.className = "field";
      const label = document.createElement("label");
      label.textContent = "数字";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "開ける";
      const msg = document.createElement("div");
      msg.className = "muted";
      btn.addEventListener("click", () => {
        if (normalizeText(input.value) !== "319") {
          playSound("error");
          msg.textContent = "違うようだ。";
          return;
        }
        playSound("unlock");
        if (!state.flags.hasRedFilm) {
          addItem("red-film");
          setFlag("hasRedFilm", true);
          pushLog("小箱が開いた。赤フィルムを手に入れた。");
          showRoomMessage("赤フィルムを手に入れた。");
          renderHints();
        } else {
          showRoomMessage("中は空だ。");
        }
      });
      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(btn);
      form.appendChild(msg);
      body.appendChild(form);
    });
  }

  function openPanelModal(meta = {}) {
    openModal("配電盤", (body) => {
      appendModalLeadImage(body, getModalImage("panel", meta), meta.label ?? "配電盤");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = state.flags.powerOn ? "通電している。" : "差し替えで通電できそうだ。";
      body.appendChild(p);

      if (!state.flags.hasPlug) {
        body.appendChild(messageBlock("プラグが必要だ。"));
        return;
      }

      if (state.flags.powerOn) {
        body.appendChild(messageBlock("配線は正しい位置に収まっている。"));
        return;
      }

      const row = document.createElement("div");
      row.className = "btn-row";
      row.appendChild(pill("差し込み口 A"));
      row.appendChild(pill("差し込み口 B"));
      row.appendChild(pill("差し込み口 C"));
      row.appendChild(pill("差し込み口 D"));

      const selects = ["A", "B", "C", "D"].map(() => {
        const s = document.createElement("select");
        s.style.borderRadius = "14px";
        s.style.padding = "8px 10px";
        s.style.border = "1px solid rgba(29,33,41,0.18)";
        ["青", "黄", "白", "黒"].forEach((c) => {
          const o = document.createElement("option");
          o.value = c;
          o.textContent = c;
          s.appendChild(o);
        });
        return s;
      });

      const grid = document.createElement("div");
      grid.className = "btn-row";
      selects.forEach((s, i) => {
        const wrap = document.createElement("div");
        wrap.className = "field";
        const label = document.createElement("label");
        label.textContent = `口 ${["A", "B", "C", "D"][i]}`;
        wrap.appendChild(label);
        wrap.appendChild(s);
        grid.appendChild(wrap);
      });

      const solveBtn = document.createElement("button");
      solveBtn.type = "button";
      solveBtn.className = "btn primary";
      solveBtn.textContent = "通電する";
      const msg = document.createElement("div");
      msg.className = "muted";
      solveBtn.addEventListener("click", () => {
        const values = selects.map((s) => s.value);
        const ok = values.join(",") === "青,黄,白,黒";
        if (!ok) {
          playSound("error");
          msg.textContent = "違うようだ。";
          return;
        }
        playSound("power");
        setFlag("powerOn", true);
        pushLog("配電盤を差し替えた。通電した。");
        showRoomMessage("通電した。");
        renderHints();
        msg.textContent = "通電した。電気スタンドが使える。";
      });

      body.appendChild(grid);
      body.appendChild(solveBtn);
      body.appendChild(msg);
    });
  }

  function openLampModal(meta = {}) {
    openModal("電気スタンド", (body) => {
      appendModalLeadImage(body, getModalImage("lamp", meta), meta.label ?? "電気スタンド");
      if (!state.flags.powerOn) {
        body.appendChild(messageBlock("電気が来ていない。配電盤を確認しよう。"));
        return;
      }

      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = state.flags.heatInkRevealed ? "熱で出る文字はもう確認した。" : "熱で文字が出る紙があるかもしれない。";
      body.appendChild(p);

      if (!hasItem("heat-paper")) {
        body.appendChild(messageBlock("熱で出る紙がない。引き出し12を探そう。"));
        return;
      }

      const revealBtn = document.createElement("button");
      revealBtn.type = "button";
      revealBtn.className = "btn primary";
      revealBtn.textContent = "紙をかざす";
      revealBtn.addEventListener("click", () => {
        if (state.flags.heatInkRevealed) {
          showRoomMessage("もう出ている。");
          return;
        }
        setFlag("heatInkRevealed", true);
        pushLog("熱で文字が現れた。「貼る順を揃えよ」");
        showRoomMessage("「貼る順を揃えよ」");
        renderHints();
      });

      body.appendChild(revealBtn);
    });
  }

  function openDeskModal(meta = {}) {
    openModal("机（台帳）", (body) => {
      appendModalLeadImage(body, getModalImage("desk", meta), meta.label ?? "机");
      const tabs = document.createElement("div");
      tabs.className = "btn-row";
      const panels = document.createElement("div");

      const tabDefs = [
        { id: "ledger", label: "台帳", render: renderLedgerTab },
        { id: "combine", label: "合成", render: renderCombineTab },
        { id: "restore", label: "復元", render: renderRestoreTab },
      ];

      let active = "ledger";

      const renderActive = () => {
        panels.innerHTML = "";
        const def = tabDefs.find((t) => t.id === active);
        def.render(panels);
      };

      for (const t of tabDefs) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn";
        btn.textContent = t.label;
        btn.addEventListener("click", () => {
          active = t.id;
          renderActive();
        });
        tabs.appendChild(btn);
      }

      body.appendChild(tabs);
      body.appendChild(panels);
      renderActive();
    });
  }

  function renderLedgerTab(root) {
    if (!state.flags.ledgerRestored) {
      root.appendChild(messageBlock("台帳のページが欠けている。破片を集めて復元できそうだ。"));
      const have = Object.values(state.pieces.ledgerScraps).filter(Boolean).length;
      root.appendChild(messageBlock(`台帳破片: ${have}/3`));
      return;
    }
    root.appendChild(messageBlock("復元した台帳が読める。"));
    const ul = document.createElement("ul");
    ul.style.margin = "0";
    ul.style.paddingLeft = "18px";
    ul.style.display = "grid";
    ul.style.gap = "6px";
    [
      "並べ順: 記 → 録 → 雨 → 音、各列は 1 → 4",
      "方向入力: 開始07、矢印で移動し到着先の赤数字を読む",
      "時刻変換: 月=時、日=分（2020/06/20 → 06:20）",
    ].forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function renderCombineTab(root) {
    const haveA = state.pieces.tornPapers.a;
    const haveB = state.pieces.tornPapers.b;
    root.appendChild(messageBlock(`破れ紙: A=${haveA ? "あり" : "なし"} / B=${haveB ? "あり" : "なし"}`));
    if (state.flags.tornPaperCombined) {
      root.appendChild(messageBlock("合成済み。「引き出し06へ」"));
      return;
    }
    if (!haveA || !haveB) {
      root.appendChild(messageBlock("まだ片方が足りない。"));
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary";
    btn.textContent = "重ねる";
    btn.addEventListener("click", () => {
      setFlag("tornPaperCombined", true);
      pushLog("破れ紙を重ねた。「引き出し06へ」");
      showRoomMessage("「引き出し06へ」");
      renderHints();
      closeModal();
      openDeskModal();
    });
    root.appendChild(btn);
  }

  function renderRestoreTab(root) {
    const scraps = Object.values(state.pieces.ledgerScraps).filter(Boolean).length;
    const can = state.flags.hasTape && scraps === 3 && state.flags.heatInkRevealed;
    root.appendChild(messageBlock(`破片: ${scraps}/3 / テープ: ${state.flags.hasTape ? "あり" : "なし"} / 熱インク: ${state.flags.heatInkRevealed ? "確認済み" : "未確認"}`));
    if (state.flags.ledgerRestored) {
      root.appendChild(messageBlock("台帳は復元済み。"));
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary";
    btn.textContent = "復元する";
    btn.disabled = !can;
    btn.addEventListener("click", () => {
      if (!can) return;
      playSound("unlock");
      setFlag("ledgerRestored", true);
      pushLog("台帳を復元した。重要な規則が分かった。");
      showRoomMessage("台帳が復元できた。");
      renderHints();
      closeModal();
      openDeskModal();
    });
    root.appendChild(btn);
  }

  function openSortModal() {
    openModal("記録の整列", (body) => {
      const have = Object.values(state.pieces.records).filter(Boolean).length;
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = `記録片: ${have}/16`;
      body.appendChild(p);

      if (!state.flags.ledgerRestored) {
        body.appendChild(messageBlock("並べ方の規則が足りない。台帳を復元しよう。"));
        return;
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "整列して確認する";
      btn.addEventListener("click", () => {
        if (have < 16) {
          playSound("error");
          showRoomMessage("まだ揃っていない。");
          return;
        }
        setFlag("shelfSorted", true);
        pushLog("記録を整列した。「とけいをすすめ。あまおとをとめよ」");
        pushLog("棚の空白から「814」が浮かび上がった。");
        showRoomMessage("814");
        renderHints();
        closeModal();
        openSortModal();
      });
      body.appendChild(btn);

      if (state.flags.shelfSorted) {
        body.appendChild(messageBlock("完成文: とけいをすすめ。あまおとをとめよ"));
        body.appendChild(messageBlock("前半コード: 814"));
      }
    });
  }

  function openDirectionModal() {
    openModal("方向入力（矢印）", (body) => {
      if (!state.flags.ledgerRestored) {
        body.appendChild(messageBlock("読み方が分からない。台帳を復元しよう。"));
        return;
      }
      if (!state.flags.windowCleared) {
        body.appendChild(messageBlock("矢印がまだ見つかっていない。窓を調べよう。"));
        return;
      }
      if (!state.flags.hasRedFilm) {
        body.appendChild(messageBlock("赤い数字が必要だ。赤フィルムを探そう。"));
        return;
      }

      const arrows = state.notes.windowArrows ?? ["↗", "↘", "↙"];
      const read = state.flags.readDirectionRuleKnown ? arrows.slice().reverse() : arrows.slice();
      const start = state.notes.drawerStart ?? "07";
      const path = computePath(start, read);
      if (!path.ok) {
        body.appendChild(messageBlock("矢印の辿り方が破綻している。座標を見直そう。"));
        return;
      }

      const p = document.createElement("p");
      p.textContent = `開始 ${start} / 矢印 ${read.join(" ")}`;

      const seq = document.createElement("p");
      seq.className = "muted";
      seq.textContent = `到着: ${path.steps.join(" → ")} / 赤: ${path.digits.join(" ")}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "確定";
      btn.addEventListener("click", () => {
        setFlag("directionSolved", true);
        state.notes.directionDigits = path.digits.join("");
        saveState();
        pushLog(`方向入力の結果は ${state.notes.directionDigits}。`);
        showRoomMessage(state.notes.directionDigits);
        renderHints();
      });

      body.appendChild(p);
      body.appendChild(seq);
      if (state.flags.directionSolved) {
        body.appendChild(messageBlock(`後半コード: ${state.notes.directionDigits ?? "362"}`));
      }
      body.appendChild(btn);
    });
  }

  function openDoorModal(meta = {}) {
    openModal("出口ロック（6桁）", (body) => {
      appendModalLeadImage(body, getModalImage("door", meta), meta.label ?? "扉");
      const form = document.createElement("div");
      form.className = "field";
      const label = document.createElement("label");
      label.textContent = "6桁";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.placeholder = "814362";
      const msg = document.createElement("div");
      msg.className = "muted";
      msg.textContent = state.flags.doorUnlocked ? "解錠済み。" : "入力して確かめる。";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "入力";
      btn.addEventListener("click", () => {
        const v = normalizeText(input.value);
        if (v.length !== 6) {
          playSound("error");
          msg.textContent = "6桁で入力して。";
          return;
        }
        const progress = prefixMatch(DOOR_CODE, v);
        state.notes.doorCodeProgress = progress;
        saveState();
        if (progress === 6) {
          playSound("unlock");
          setFlag("doorUnlocked", true);
          pushLog("扉が解錠された。雨音が弱まった。");
          showRoomMessage("解錠された。");
          msg.textContent = "解錠された。時計を進められそうだ。";
          renderHints();
          return;
        }
        playSound(progress >= 1 ? "short" : "error");
        msg.textContent = `先頭から ${progress} 桁が合っている。`;
      });
      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(btn);
      form.appendChild(msg);
      body.appendChild(form);
    });
  }

  function openClockModal(meta = {}) {
    openModal("時計", (body) => {
      appendModalLeadImage(body, getModalImage("clock", meta), meta.label ?? "時計");
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "時刻を合わせられる。";
      body.appendChild(p);

      const hh = document.createElement("input");
      hh.type = "number";
      hh.min = "0";
      hh.max = "11";
      hh.value = String(state.notes.clockHh ?? 2);
      const mm = document.createElement("input");
      mm.type = "number";
      mm.min = "0";
      mm.max = "59";
      mm.step = "5";
      mm.value = String(state.notes.clockMm ?? 30);

      const row = document.createElement("div");
      row.className = "btn-row";
      row.appendChild(pill("時"));
      row.appendChild(hh);
      row.appendChild(pill("分"));
      row.appendChild(mm);

      const msg = document.createElement("div");
      msg.className = "muted";
      msg.textContent = "";

      const applyBtn = document.createElement("button");
      applyBtn.type = "button";
      applyBtn.className = "btn primary";
      applyBtn.textContent = "合わせる";
      applyBtn.addEventListener("click", () => {
        const h = clampInt(Number(hh.value), 0, 11);
        const m = clampInt(Number(mm.value), 0, 59);
        state.notes.clockHh = h;
        state.notes.clockMm = m;
        saveState();

        if (h === 2 && m === 30) {
          setFlag("clockCoordUsed", true);
          pushLog("時計を02:30に合わせた。引き出し10が気になる。");
          showRoomMessage("02:30");
          renderHints();
        }

        if (state.flags.doorUnlocked && h === 6 && m === 20) {
          setFlag("clockFinalSet", true);
          pushLog("時計を06:20に合わせた。雨音が止んだ。");
          openClearModal();
          return;
        }

        msg.textContent = `合わせた: ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      });

      body.appendChild(row);
      body.appendChild(applyBtn);
      body.appendChild(msg);

      if (!state.flags.doorUnlocked) {
        body.appendChild(messageBlock("扉が解錠されるまでは、まだ“終わり”ではない。"));
      } else {
        body.appendChild(messageBlock("扉の先から、時計を“進めろ”という気配がする。"));
      }
    });
  }

  function openClearModal() {
    openModal("脱出成功", (body) => {
      const p = document.createElement("p");
      p.textContent = "雨音が止み、秒針の音だけが残る。扉が静かに開いた。";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "もう一度";
      btn.addEventListener("click", () => {
        resetGame();
        closeModal();
      });
      body.appendChild(p);
      body.appendChild(btn);
    });
  }

  function scheduleVirtualDelay(ms, resolve) {
    const due = virtualClockMs + Math.max(0, Number(ms) || 0);
    virtualDelayQueue.push({ due, resolve });
    virtualDelayQueue.sort((a, b) => a.due - b.due);
  }

  function flushVirtualDelays(upToMs) {
    virtualClockMs = Math.max(virtualClockMs, upToMs);
    const ready = [];
    while (virtualDelayQueue.length > 0 && virtualDelayQueue[0].due <= virtualClockMs) {
      ready.push(virtualDelayQueue.shift());
    }
    for (const entry of ready) {
      entry.resolve();
    }
  }

  function wait(ms) {
    const delay = Math.max(0, Number(ms) || 0);
    if (!useVirtualTimeForTests) {
      return new Promise((resolve) => window.setTimeout(resolve, delay));
    }
    return new Promise((resolve) => scheduleVirtualDelay(delay, resolve));
  }

  function setRainVolume(value) {
    const v = Math.min(Math.max(value, 0), 1);
    audio.rain.volume = v;
    if (rainCurrent?.gain) rainCurrent.gain.gain.value = v;
  }

  function clampInt(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(Math.trunc(value), min), max);
  }

  function prefixMatch(expected, input) {
    let count = 0;
    for (let i = 0; i < Math.min(expected.length, input.length); i += 1) {
      if (expected[i] !== input[i]) break;
      count += 1;
    }
    return count;
  }

  function pill(text) {
    const s = document.createElement("span");
    s.className = "pill";
    s.textContent = text;
    return s;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function computePath(startId, arrows) {
    const toPos = (id) => {
      const n = Number(id);
      const idx = n - 1;
      return { r: Math.floor(idx / 4), c: idx % 4 };
    };
    const toId = (r, c) => String(r * 4 + c + 1).padStart(2, "0");
    const move = {
      "↙": { dr: 1, dc: -1 },
      "↘": { dr: 1, dc: 1 },
      "↗": { dr: -1, dc: 1 },
      "↖": { dr: -1, dc: -1 },
      "↑": { dr: -1, dc: 0 },
      "↓": { dr: 1, dc: 0 },
      "←": { dr: 0, dc: -1 },
      "→": { dr: 0, dc: 1 },
    };
    let { r, c } = toPos(startId);
    const steps = [];
    const digits = [];
    for (const a of arrows) {
      const d = move[a];
      if (!d) return { ok: false };
      r += d.dr;
      c += d.dc;
      if (r < 0 || r > 3 || c < 0 || c > 3) return { ok: false };
      const id = toId(r, c);
      steps.push(id);
      digits.push(RED_DIGITS[id]);
    }
    return { ok: true, steps, digits };
  }

  async function loadJsonWithFallback(url, fallback) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${url} status ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`load fallback for ${url}:`, e);
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function resetGame() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  function updateFullscreenToggleUi() {
    if (!fullscreenToggleButton) return;
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenToggleButton.textContent = isFullscreen ? "全画面解除 (F)" : "全画面 (F)";
    fullscreenToggleButton.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
  }

  function isEditableElement(target) {
    if (!(target instanceof Element)) return false;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (target.isContentEditable) return true;
    return Boolean(target.closest("[contenteditable='true']"));
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn("exit fullscreen failed", error);
      }
      return;
    }
    if (!gameRoot || typeof gameRoot.requestFullscreen !== "function") {
      showRoomMessage("この環境では全画面表示に対応していません。");
      return;
    }
    try {
      await gameRoot.requestFullscreen();
    } catch (error) {
      console.warn("request fullscreen failed", error);
      showRoomMessage("全画面表示を開始できませんでした。");
    }
  }

  async function init() {
    try {
      gameData = await loadJsonWithFallback("hotspots.json", HOTSPOTS_FALLBACK);
      const raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? JSON.parse(raw) : await loadJsonWithFallback("state.json", STATE_FALLBACK);
    } catch (e) {
      console.error(e);
      showRoomMessage("読み込みに失敗しました。リロードしてください。");
      return;
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => setScene(btn.dataset.scene));
    });

    hintTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.hintLevel = Number(btn.dataset.hintLevel);
        hintTabs.forEach((b) => b.classList.toggle("is-active", b === btn));
        saveState();
        renderHints();
      });
    });

    restartButton.addEventListener("click", resetGame);
    fullscreenToggleButton?.addEventListener("click", () => {
      toggleFullscreen();
    });
    clearSelectionButton.addEventListener("click", () => {
      selectedItem = null;
      renderInventory();
      showRoomMessage("使用を解除した。");
    });
    document.addEventListener("fullscreenchange", updateFullscreenToggleUi);
    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "escape" && document.fullscreenElement) {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (key !== "f") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableElement(event.target)) return;
      event.preventDefault();
      toggleFullscreen();
    });
    updateFullscreenToggleUi();

    // 初期描画: 軽量をデフォルト、希望者は高品質に
    const storedFx = localStorage.getItem("escape4-highfx") === "1";
    highFx = storedFx;
    document.documentElement.classList.toggle("fx", highFx);
    fxToggle.checked = highFx;
    fxToggle.addEventListener("change", () => {
      highFx = fxToggle.checked;
      document.documentElement.classList.toggle("fx", highFx);
      localStorage.setItem("escape4-highfx", highFx ? "1" : "0");
    });

    const storedVol = Number(localStorage.getItem(RAIN_VOL_KEY));
    const vol = Number.isFinite(storedVol) ? clampInt(storedVol, 0, 100) : 12;
    rainVolumeSlider.value = String(vol);
    setRainVolume(vol / 100);
    rainVolumeSlider.addEventListener("input", () => {
      const v = clampInt(Number(rainVolumeSlider.value), 0, 100);
      setRainVolume(v / 100);
      localStorage.setItem(RAIN_VOL_KEY, String(v));
    });

    renderStage();
    renderHotspots();
    renderInventory();
    renderLog();
    renderHints();

    // 初回だけ軽い導線
    if (state.log.length === 0) {
      pushLog("雨音が遠くで鳴っている。時計は 00:00 で止まっている。");
      pushLog("引き出し棚が目を引く。");
    }

    // 最初のユーザー操作でBGM開始（オートプレイ規制回避）
    window.addEventListener(
      "pointerdown",
      () => {
        unlockAudio();
      },
      { once: true }
    );
  }

  function getModalTitle() {
    if (!activeModal?.modal) return null;
    const title = activeModal.modal.querySelector("h3");
    return title?.textContent?.trim() || null;
  }

  function getHotspotSnapshot() {
    const scene = gameData?.scenes?.[state?.scene];
    if (!scene?.hotspots) return [];
    return scene.hotspots.map((spot) => {
      const requires = Array.isArray(spot.requires) ? spot.requires : [];
      const requiresAny = Array.isArray(spot.requiresAny) ? spot.requiresAny : [];
      const meetsAll = requires.every((key) => Boolean(state.flags[key]));
      const meetsAny = requiresAny.length === 0 || requiresAny.some((key) => Boolean(state.flags[key]));
      return {
        id: spot.id,
        label: spot.label,
        x: spot.x,
        y: spot.y,
        w: spot.w,
        h: spot.h,
        action: spot.action?.type ?? null,
        target: spot.action?.name ?? spot.action?.item ?? null,
        available: meetsAll && meetsAny,
      };
    });
  }

  function renderGameToText() {
    if (!state || !gameData) {
      return JSON.stringify({ mode: "loading" });
    }

    const recordsTotal = Object.keys(state.pieces.records || {}).length;
    const recordsCollected = Object.values(state.pieces.records || {}).filter(Boolean).length;
    const scrapsTotal = Object.keys(state.pieces.ledgerScraps || {}).length;
    const scrapsCollected = Object.values(state.pieces.ledgerScraps || {}).filter(Boolean).length;
    const drawers = Object.keys(state.drawers || {})
      .sort((a, b) => Number(a) - Number(b))
      .map((id) => {
        const drawer = state.drawers[id];
        const openCheck = canOpenDrawer(id);
        return {
          id,
          opened: Boolean(drawer?.opened),
          taken: Boolean(drawer?.taken),
          openableNow: Boolean(openCheck?.ok),
          lockReason: openCheck?.ok ? null : openCheck?.reason ?? "unknown",
        };
      });

    const payload = {
      mode: state.flags.clockFinalSet ? "clear" : activeModal ? "modal" : "explore",
      coordinateSystem: "stage左上原点。xは右向き、yは下向き。hotspotsのx/y/w/hはstageに対する百分率。",
      fullscreen: Boolean(document.fullscreenElement),
      scene: state.scene,
      modalTitle: getModalTitle(),
      roomMessage: roomMessage?.textContent?.trim() || "",
      selectedItem,
      hintLevel: state.hintLevel,
      inventory: [...state.inventory],
      progress: {
        records: { collected: recordsCollected, total: recordsTotal },
        ledgerScraps: { collected: scrapsCollected, total: scrapsTotal },
        tornPapers: { ...state.pieces.tornPapers },
      },
      notes: {
        windowArrows: state.notes.windowArrows,
        audioDigits: state.notes.audioDigits,
        directionDigits: state.notes.directionDigits ?? null,
        doorCodeProgress: state.notes.doorCodeProgress ?? 0,
        clock: {
          hh: state.notes.clockHh ?? null,
          mm: state.notes.clockMm ?? null,
        },
      },
      flags: { ...state.flags },
      drawers,
      visibleHotspots: getHotspotSnapshot(),
      recentLog: state.log.slice(0, 5),
    };

    return JSON.stringify(payload);
  }

  async function advanceTime(ms) {
    useVirtualTimeForTests = true;
    const deltaMs = Math.max(0, Number(ms) || 0);
    const stepMs = 1000 / 60;
    const steps = Math.max(1, Math.ceil(deltaMs / stepMs));
    const each = deltaMs / steps;
    for (let i = 0; i < steps; i += 1) {
      flushVirtualDelays(virtualClockMs + each);
      await Promise.resolve();
    }
  }

  window.render_game_to_text = renderGameToText;
  window.advanceTime = advanceTime;
  init();
})();

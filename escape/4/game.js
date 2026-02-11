(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start-btn");

  const SCENE_HEIGHT = 540;
  const TRAY_HEIGHT = 100;
  const WORLD = { width: 960, height: SCENE_HEIGHT + TRAY_HEIGHT };
  const INVENTORY_Y = SCENE_HEIGHT + 32;
  const INVENTORY_SLOT_W = 120;
  const INVENTORY_SLOT_H = 52;
  const TOAST_DURATION = 3400;
  const TOAST_FADE_MS = 520;
  const INTRO_SCENE_FADE_MS = 900;
  const SAFE_MEMO_DIGITS = "427";
  const SAFE_ORDER_HINT = "2→3→1";
  const SAFE_CODE = "274";

  const FULL_SCENE_RECT = { x: 0, y: 0, w: WORLD.width, h: SCENE_HEIGHT };
  const INVENTORY_TRAY_RECT = { x: 88, y: SCENE_HEIGHT + 8, w: 784, h: 84 };

  const HOTSPOTS = {
    door: { x: 726, y: 62, w: 196, h: 320 },
    plant: { x: 0, y: 116, w: 150, h: 284 },
    drawer: { x: 166, y: 262, w: 112, h: 136 },
    painting: { x: 158, y: 118, w: 92, h: 68 },
    safe: { x: 590, y: 232, w: 124, h: 122 },
    window: { x: 308, y: 92, w: 254, h: 260 },
    table: { x: 246, y: 360, w: 378, h: 150 },
  };

  const SAFE_SCENE_RECT = {
    x: HOTSPOTS.safe.x + 10,
    y: HOTSPOTS.safe.y + 8,
    w: HOTSPOTS.safe.w - 20,
    h: HOTSPOTS.safe.h - 24,
  };
  const INSPECT_PANEL = { x: 150, y: 78, w: 660, h: 356 };
  const INSPECT_CLOSE = { x: 772, y: 96, w: 24, h: 24 };
  const SAFE_DISPLAY = { x: 546, y: 144, w: 236, h: 62 };
  const SAFE_IMAGE_RECT = { x: 196, y: 142, w: 324, h: 182 };
  const SAFE_KEY_ITEM_RECT = { x: 196, y: 334, w: 324, h: 76 };
  const DOOR_ACTION_RECT = { x: 370, y: 294, w: 220, h: 56 };
  const ITEM_INSPECT_PANEL = { x: 184, y: 108, w: 592, h: 316 };
  const ITEM_INSPECT_CLOSE = { x: 738, y: 126, w: 24, h: 24 };
  const ITEM_INSPECT_ICON = { x: 218, y: 172, w: 236, h: 200 };
  const ITEM_INSPECT_DESC = { x: 474, y: 170, w: 266, h: 204 };
  const SETTINGS_BUTTON_RECT = { x: 694, y: 14, w: 70, h: 26 };
  const SETTINGS_PANEL_RECT = { x: 620, y: 50, w: 324, h: 108 };
  const SETTINGS_MINUS_RECT = { x: 646, y: 108, w: 34, h: 28 };
  const SETTINGS_PLUS_RECT = { x: 882, y: 108, w: 34, h: 28 };
  const SETTINGS_SLIDER_RECT = { x: 690, y: 119, w: 180, h: 8 };
  const SETTINGS_MUTE_RECT = { x: 794, y: 62, w: 122, h: 28 };

  const KEYPAD_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "E"],
  ];

  const KEYPAD_LAYOUT = {
    startX: 548,
    startY: 210,
    buttonW: 62,
    buttonH: 40,
    gapX: 8,
    gapY: 8,
  };

  const ASSET_PATHS = {
    bgRoomBase: "./assets/images/bg-room-base.png",
    safeLocked: "./assets/images/safe-locked.png",
    safeOpen: "./assets/images/safe-open.png",
    iconBrassKey: "./assets/images/icon-brass-key.png",
    iconRoomKey: "./assets/images/icon-room-key.png",
    iconMemo: "./assets/images/icon-memo.png",
  };
  const SFX_PATHS = {
    uiClick: ["./assets/sfx/ui-click.ogg", "./assets/sfx/ui-click.wav"],
    itemPick: ["./assets/sfx/item-pick.ogg", "./assets/sfx/item-pick.wav"],
    modalOpen: ["./assets/sfx/modal-open.ogg", "./assets/sfx/modal-open.wav"],
    modalClose: ["./assets/sfx/modal-close.ogg", "./assets/sfx/modal-close.wav"],
    safeInput: ["./assets/sfx/safe-input.ogg", "./assets/sfx/safe-input.wav"],
    safeOk: ["./assets/sfx/safe-ok.ogg", "./assets/sfx/safe-ok.wav"],
    safeNg: ["./assets/sfx/safe-ng.ogg", "./assets/sfx/safe-ng.wav"],
    doorUnlock: ["./assets/sfx/door-unlock.ogg", "./assets/sfx/door-unlock.wav"],
    win: ["./assets/sfx/win.ogg", "./assets/sfx/win.wav"],
  };
  const SFX_VOLUME = {
    uiClick: 0.38,
    itemPick: 0.52,
    modalOpen: 0.34,
    modalClose: 0.3,
    safeInput: 0.34,
    safeOk: 0.56,
    safeNg: 0.44,
    doorUnlock: 0.52,
    win: 0.62,
  };
  const VOLUME_STORAGE_KEY = "escape_sfx_volume";
  const BACKGROUND_VARIANTS = {
    enabled: Boolean(window.__escape_use_bg_variants),
    useDoorOpen: window.__escape_use_open_variant !== false,
    useSafeOpen: window.__escape_use_safe_open_variant === true,
    lockedSrc: "./assets/images/bg-room-locked.png",
    safeOpenSrc: "./assets/images/bg-room-safe-open.png",
    doorOpenSrc: "./assets/images/bg-room-open.png",
    locked: { image: new Image(), loaded: false, error: false },
    safeOpen: { image: new Image(), loaded: false, error: false },
    doorOpen: { image: new Image(), loaded: false, error: false },
  };

  const assets = Object.fromEntries(
    Object.entries(ASSET_PATHS).map(([key, src]) => {
      const image = new Image();
      return [key, { image, src, loaded: false, error: false }];
    })
  );
  const sounds = Object.fromEntries(
    Object.entries(SFX_PATHS).map(([key, sources]) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      return [key, { audio, sources, loaded: false, error: false, src: null }];
    })
  );
  const imageOpaqueBounds = new WeakMap();
  const audioObjectUrls = [];

  const assetStatus = {
    ready: false,
    failed: [],
  };
  const audioStatus = {
    ready: false,
    unlocked: false,
    failed: [],
  };

  let state = makeInitialState();
  let rafId = 0;
  let introSceneAlpha = 1;
  let masterVolume = 0.74;
  let volumeBeforeMute = 0.74;

  function makeInitialState() {
    return {
      mode: "menu",
      inspect: null,
      message: "気になる場所を調べて脱出しよう",
      toast: { text: "", ttlMs: 0 },
      elapsed: 0,
      doorUnlocked: false,
      drawerUnlocked: false,
      drawerOpened: false,
      safeUnlocked: false,
      safeInput: "",
      safeAttempts: 0,
      safeLastResult: "none",
      noteFound: false,
      memoDigitsKnown: false,
      orderHintKnown: false,
      codeKnown: false,
      items: [],
      selectedItemId: null,
      itemInspectId: null,
      settingsOpen: false,
      flags: {
        brassKeyTaken: false,
        roomKeyTaken: false,
      },
      debugHotspots: false,
      lastPointer: { x: 0, y: 0 },
    };
  }

  function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
  }

  function hasItem(id) {
    return state.items.some((item) => item.id === id);
  }

  function addItem(item) {
    if (hasItem(item.id)) return;
    state.items.push(item);
  }

  function removeItem(id) {
    state.items = state.items.filter((item) => item.id !== id);
    if (state.selectedItemId === id) state.selectedItemId = null;
  }

  function selectedItem() {
    return state.items.find((item) => item.id === state.selectedItemId) || null;
  }

  function setMessage(text, showToast = true) {
    state.message = text;
    if (showToast && state.mode === "playing") {
      state.toast = { text, ttlMs: TOAST_DURATION };
    }
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function restoreMasterVolume() {
    try {
      const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
      if (!raw) return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return;
      masterVolume = clamp01(parsed);
      if (masterVolume > 0.01) {
        volumeBeforeMute = masterVolume;
      }
    } catch {
      // Ignore storage errors and keep default volume.
    }
  }

  function persistMasterVolume() {
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(masterVolume));
    } catch {
      // Ignore storage errors.
    }
  }

  function setMasterVolume(nextVolume, withToast = true) {
    const quantized = Math.round(clamp01(nextVolume) * 100) / 100;
    masterVolume = quantized;
    if (masterVolume > 0.01) {
      volumeBeforeMute = masterVolume;
    }
    persistMasterVolume();
    if (withToast && state.mode === "playing") {
      setMessage(`SE音量: ${Math.round(masterVolume * 100)}%`);
    }
  }

  function refreshCodeKnown() {
    state.codeKnown = state.memoDigitsKnown || state.orderHintKnown;
  }

  function inventorySlotRect(index) {
    const totalWidth = INVENTORY_SLOT_W * 4 + 12 * 3;
    const startX = (WORLD.width - totalWidth) / 2;
    return {
      x: startX + index * (INVENTORY_SLOT_W + 12),
      y: INVENTORY_Y,
      w: INVENTORY_SLOT_W,
      h: INVENTORY_SLOT_H,
    };
  }

  function inventoryDetailButtonRect(index) {
    const rect = inventorySlotRect(index);
    return { x: rect.x + rect.w - 27, y: rect.y + 2, w: 22, h: 22 };
  }

  function iconKeyByItemId(itemId) {
    if (itemId === "brass-key") return "iconBrassKey";
    if (itemId === "room-key") return "iconRoomKey";
    if (itemId === "memo") return "iconMemo";
    return null;
  }

  function getItemById(id) {
    return state.items.find((item) => item.id === id) || null;
  }

  function itemDescription(item) {
    if (!item) return "";
    if (item.id === "brass-key") {
      return "小ぶりな真鍮鍵。長く使われてきたような手触りがある。";
    }
    if (item.id === "room-key") {
      return "しっかりした鍵。部屋のどこかに対応するものらしい。";
    }
    if (item.id === "memo") {
      return "手書きメモ。『427』とだけ記されている。";
    }
    return item.useHint || "用途不明の持ち物。";
  }

  function drawRoundedRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async function loadImageWithFetch(image, src) {
    try {
      const response = await fetch(src, { cache: "no-store" });
      if (!response.ok) return false;
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(blob);
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(true);
        };
        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(false);
        };
        image.src = objectUrl;
      });
    } catch {
      return false;
    }
  }

  async function loadAudioWithFetch(audio, srcCandidates) {
    for (const src of srcCandidates) {
      try {
        const response = await fetch(src, { cache: "no-store" });
        if (!response.ok) continue;
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const loaded = await new Promise((resolve) => {
          const onCanPlay = () => {
            cleanup();
            resolve(true);
          };
          const onError = () => {
            cleanup();
            resolve(false);
          };
          const cleanup = () => {
            audio.removeEventListener("canplaythrough", onCanPlay);
            audio.removeEventListener("loadeddata", onCanPlay);
            audio.removeEventListener("error", onError);
          };
          audio.addEventListener("canplaythrough", onCanPlay, { once: true });
          audio.addEventListener("loadeddata", onCanPlay, { once: true });
          audio.addEventListener("error", onError, { once: true });
          audio.src = objectUrl;
          audio.load();
        });
        if (loaded) {
          audioObjectUrls.push(objectUrl);
          return { loaded: true, src };
        }
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Try next candidate source.
      }
    }
    return { loaded: false, src: null };
  }

  function preloadSounds() {
    const entries = Object.entries(sounds);
    Promise.all(
      entries.map(async ([key, sound]) => {
        const result = await loadAudioWithFetch(sound.audio, sound.sources);
        if (result.loaded) {
          sound.loaded = true;
          sound.src = result.src;
          sound.audio.volume = SFX_VOLUME[key] ?? 0.45;
          return;
        }
        sound.error = true;
        audioStatus.failed.push(key);
      })
    ).then(() => {
      audioStatus.ready = true;
    });
  }

  function unlockAudio() {
    if (audioStatus.unlocked) return;
    audioStatus.unlocked = true;
  }

  function playSfx(key, volumeScale = 1) {
    if (!audioStatus.unlocked) return;
    if (masterVolume <= 0) return;
    const sound = sounds[key];
    if (!sound || !sound.loaded) return;
    try {
      const player = sound.audio.cloneNode(true);
      player.volume = clamp01((SFX_VOLUME[key] ?? 0.45) * volumeScale * masterVolume);
      const promise = player.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    } catch {
      // Ignore playback failure and keep gameplay responsive.
    }
  }

  function preloadAssets() {
    const entries = Object.entries(assets);
    Promise.all(
      entries.map(async ([key, asset]) => {
        const loaded = await loadImageWithFetch(asset.image, asset.src);
        if (loaded) {
          asset.loaded = true;
          return;
        }
        asset.error = true;
        assetStatus.failed.push(key);
      })
    ).then(async () => {
      if (BACKGROUND_VARIANTS.enabled) {
        const variantsToLoad = [{ key: "locked", src: BACKGROUND_VARIANTS.lockedSrc }];
        if (BACKGROUND_VARIANTS.useSafeOpen) {
          variantsToLoad.push({ key: "safeOpen", src: BACKGROUND_VARIANTS.safeOpenSrc });
        }
        if (BACKGROUND_VARIANTS.useDoorOpen) {
          variantsToLoad.push({ key: "doorOpen", src: BACKGROUND_VARIANTS.doorOpenSrc });
        }

        await Promise.all(
          variantsToLoad.map(async ({ key, src }) => {
            const variant = BACKGROUND_VARIANTS[key];
            const loaded = await loadImageWithFetch(variant.image, src);
            if (loaded) {
              variant.loaded = true;
              return;
            }
            variant.error = true;
          })
        );
      }

      assetStatus.ready = true;
      if (assetStatus.failed.length > 0) {
        setMessage(`一部素材の読込に失敗: ${assetStatus.failed.join(", ")}`);
      }
      draw();
    });
  }

  function drawImageCover(image, x, y, w, h) {
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    const srcRatio = srcW / srcH;
    const dstRatio = w / h;

    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;

    if (srcRatio > dstRatio) {
      sw = Math.round(srcH * dstRatio);
      sx = Math.floor((srcW - sw) / 2);
    } else {
      sh = Math.round(srcW / dstRatio);
      sy = Math.floor((srcH - sh) / 2);
    }

    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  }

  function getCoverSourceRect(image, dstW, dstH) {
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    const srcRatio = srcW / srcH;
    const dstRatio = dstW / dstH;

    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;

    if (srcRatio > dstRatio) {
      sw = Math.round(srcH * dstRatio);
      sx = Math.floor((srcW - sw) / 2);
    } else {
      sh = Math.round(srcW / dstRatio);
      sy = Math.floor((srcH - sh) / 2);
    }
    return { sx, sy, sw, sh };
  }

  function drawAssetCover(assetKey, rect) {
    const asset = assets[assetKey];
    if (!asset || !asset.loaded) return false;
    drawImageCover(asset.image, rect.x, rect.y, rect.w, rect.h);
    return true;
  }

  function drawAssetContain(assetKey, rect, padding = 0) {
    const asset = assets[assetKey];
    if (!asset || !asset.loaded) return false;

    const sourceW = asset.image.naturalWidth || asset.image.width;
    const sourceH = asset.image.naturalHeight || asset.image.height;
    const fitW = rect.w - padding * 2;
    const fitH = rect.h - padding * 2;
    if (fitW <= 0 || fitH <= 0) return false;

    const scale = Math.min(fitW / sourceW, fitH / sourceH);
    const drawW = sourceW * scale;
    const drawH = sourceH * scale;
    const drawX = rect.x + (rect.w - drawW) * 0.5;
    const drawY = rect.y + (rect.h - drawH) * 0.5;

    ctx.drawImage(asset.image, 0, 0, sourceW, sourceH, drawX, drawY, drawW, drawH);
    return true;
  }

  function getImageOpaqueBound(image) {
    const cached = imageOpaqueBounds.get(image);
    if (cached) return cached;

    const sourceW = image.naturalWidth || image.width;
    const sourceH = image.naturalHeight || image.height;
    const fallback = { sx: 0, sy: 0, sw: sourceW, sh: sourceH };
    if (!sourceW || !sourceH) return fallback;

    try {
      const probe = document.createElement("canvas");
      probe.width = sourceW;
      probe.height = sourceH;
      const pctx = probe.getContext("2d", { willReadFrequently: true });
      if (!pctx) return fallback;
      pctx.drawImage(image, 0, 0, sourceW, sourceH);
      const data = pctx.getImageData(0, 0, sourceW, sourceH).data;

      let minX = sourceW;
      let minY = sourceH;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < sourceH; y += 1) {
        for (let x = 0; x < sourceW; x += 1) {
          const alpha = data[(y * sourceW + x) * 4 + 3];
          if (alpha <= 8) continue;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      if (maxX < minX || maxY < minY) {
        imageOpaqueBounds.set(image, fallback);
        return fallback;
      }

      const result = {
        sx: minX,
        sy: minY,
        sw: maxX - minX + 1,
        sh: maxY - minY + 1,
      };
      imageOpaqueBounds.set(image, result);
      return result;
    } catch {
      imageOpaqueBounds.set(image, fallback);
      return fallback;
    }
  }

  function drawAssetContainTrimmed(assetKey, rect, padding = 0) {
    const asset = assets[assetKey];
    if (!asset || !asset.loaded) return false;

    const fitW = rect.w - padding * 2;
    const fitH = rect.h - padding * 2;
    if (fitW <= 0 || fitH <= 0) return false;

    const source = getImageOpaqueBound(asset.image);
    const scale = Math.min(fitW / source.sw, fitH / source.sh);
    const drawW = source.sw * scale;
    const drawH = source.sh * scale;
    const drawX = rect.x + (rect.w - drawW) * 0.5;
    const drawY = rect.y + (rect.h - drawH) * 0.5;

    ctx.drawImage(asset.image, source.sx, source.sy, source.sw, source.sh, drawX, drawY, drawW, drawH);
    return true;
  }

  function drawCanvasSliceFromCoverImage(image, canvasRect, dstRect, pad = 0) {
    const cover = getCoverSourceRect(image, WORLD.width, SCENE_HEIGHT);
    const scaleX = cover.sw / WORLD.width;
    const scaleY = cover.sh / SCENE_HEIGHT;

    const left = Math.max(0, canvasRect.x - pad);
    const top = Math.max(0, canvasRect.y - pad);
    const right = Math.min(WORLD.width, canvasRect.x + canvasRect.w + pad);
    const bottom = Math.min(SCENE_HEIGHT, canvasRect.y + canvasRect.h + pad);

    const sx = cover.sx + left * scaleX;
    const sy = cover.sy + top * scaleY;
    const sw = Math.max(1, (right - left) * scaleX);
    const sh = Math.max(1, (bottom - top) * scaleY);

    const srcRatio = sw / sh;
    const dstRatio = dstRect.w / dstRect.h;
    let drawW = dstRect.w;
    let drawH = dstRect.h;
    let drawX = dstRect.x;
    let drawY = dstRect.y;

    if (srcRatio > dstRatio) {
      drawH = dstRect.w / srcRatio;
      drawY = dstRect.y + (dstRect.h - drawH) * 0.5;
    } else {
      drawW = dstRect.h * srcRatio;
      drawX = dstRect.x + (dstRect.w - drawW) * 0.5;
    }

    ctx.drawImage(image, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
    return true;
  }

  function drawFallbackBase() {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 380);
    wallGrad.addColorStop(0, "#d6e0ee");
    wallGrad.addColorStop(1, "#bfd0e3");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, WORLD.width, 380);

    ctx.fillStyle = "#b5845e";
    ctx.fillRect(0, 380, WORLD.width, 160);

    ctx.fillStyle = "#8b4f2b";
    ctx.fillRect(760, 150, 120, 210);

    ctx.fillStyle = "#4f8f5f";
    ctx.beginPath();
    ctx.arc(225, 262, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#606b78";
    ctx.fillRect(670, 285, 90, 65);
  }

  function drawSceneLoadingPlaceholder() {
    ctx.fillStyle = "#05080d";
    ctx.fillRect(0, 0, WORLD.width, SCENE_HEIGHT);
  }

  function canRevealScene() {
    if (!assetStatus.ready) return false;
    if (BACKGROUND_VARIANTS.enabled && !BACKGROUND_VARIANTS.locked.loaded && !BACKGROUND_VARIANTS.locked.error) {
      return false;
    }
    return true;
  }

  function drawIntroSceneOverlay() {
    if (!canRevealScene()) {
      ctx.fillStyle = "#05080d";
      ctx.fillRect(0, 0, WORLD.width, SCENE_HEIGHT);
      return;
    }
    if (introSceneAlpha <= 0) return;
    ctx.fillStyle = `rgba(5, 8, 13, ${introSceneAlpha})`;
    ctx.fillRect(0, 0, WORLD.width, SCENE_HEIGHT);
  }

  function getCurrentVariantBackgroundImage() {
    if (!BACKGROUND_VARIANTS.enabled) return null;
    if (state.mode === "won" && BACKGROUND_VARIANTS.useDoorOpen && BACKGROUND_VARIANTS.doorOpen.loaded) {
      return BACKGROUND_VARIANTS.doorOpen.image;
    }
    if (state.safeUnlocked && BACKGROUND_VARIANTS.useSafeOpen && BACKGROUND_VARIANTS.safeOpen.loaded) {
      return BACKGROUND_VARIANTS.safeOpen.image;
    }
    if (BACKGROUND_VARIANTS.locked.loaded) {
      return BACKGROUND_VARIANTS.locked.image;
    }
    return null;
  }

  function drawScene() {
    const waitingLockedVariant =
      BACKGROUND_VARIANTS.enabled &&
      !BACKGROUND_VARIANTS.locked.loaded &&
      !BACKGROUND_VARIANTS.locked.error;
    if (waitingLockedVariant) {
      drawSceneLoadingPlaceholder();
      return;
    }

    const variantImage = getCurrentVariantBackgroundImage();
    const usedVariantBackground = Boolean(variantImage);
    if (variantImage) {
      drawImageCover(variantImage, 0, 0, WORLD.width, SCENE_HEIGHT);
    }

    if (!usedVariantBackground && !drawAssetCover("bgRoomBase", FULL_SCENE_RECT)) {
      drawFallbackBase();
    }

    if (!usedVariantBackground) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(SAFE_SCENE_RECT.x - 4, SAFE_SCENE_RECT.y + 4, SAFE_SCENE_RECT.w + 8, SAFE_SCENE_RECT.h + 6);

      if (!drawAssetCover(state.safeUnlocked ? "safeOpen" : "safeLocked", SAFE_SCENE_RECT)) {
        ctx.fillStyle = state.safeUnlocked ? "#80878f" : "#6b727b";
        ctx.fillRect(SAFE_SCENE_RECT.x, SAFE_SCENE_RECT.y, SAFE_SCENE_RECT.w, SAFE_SCENE_RECT.h);
        ctx.fillStyle = "#2c3138";
        ctx.fillRect(SAFE_SCENE_RECT.x + 7, SAFE_SCENE_RECT.y + 7, SAFE_SCENE_RECT.w - 14, SAFE_SCENE_RECT.h - 14);
      }
    }
  }

  function drawSettingsButton() {
    drawRoundedRect(
      SETTINGS_BUTTON_RECT.x,
      SETTINGS_BUTTON_RECT.y,
      SETTINGS_BUTTON_RECT.w,
      SETTINGS_BUTTON_RECT.h,
      8
    );
    ctx.fillStyle = state.settingsOpen ? "rgba(97, 165, 111, 0.95)" : "rgba(98, 115, 134, 0.9)";
    ctx.fill();
    ctx.fillStyle = "#f5fbff";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText("音量", SETTINGS_BUTTON_RECT.x + 15, SETTINGS_BUTTON_RECT.y + 18);
  }

  function drawSettingsPanel() {
    if (state.mode !== "playing" || !state.settingsOpen) return;

    drawRoundedRect(SETTINGS_PANEL_RECT.x, SETTINGS_PANEL_RECT.y, SETTINGS_PANEL_RECT.w, SETTINGS_PANEL_RECT.h, 10);
    ctx.fillStyle = "rgba(11, 26, 43, 0.94)";
    ctx.fill();
    ctx.strokeStyle = "rgba(170, 199, 226, 0.82)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#f3f8fd";
    ctx.font = "bold 19px Trebuchet MS";
    ctx.fillText("サウンド設定", SETTINGS_PANEL_RECT.x + 16, SETTINGS_PANEL_RECT.y + 27);

    const percent = Math.round(masterVolume * 100);
    ctx.save();
    ctx.font = "bold 16px Trebuchet MS";
    ctx.textBaseline = "top";
    ctx.fillText(`SE音量: ${percent}%`, SETTINGS_SLIDER_RECT.x, SETTINGS_PANEL_RECT.y + 44);
    ctx.restore();

    drawRoundedRect(SETTINGS_MUTE_RECT.x, SETTINGS_MUTE_RECT.y, SETTINGS_MUTE_RECT.w, SETTINGS_MUTE_RECT.h, 7);
    ctx.fillStyle = masterVolume <= 0 ? "rgba(151, 77, 87, 0.9)" : "rgba(64, 109, 149, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 205, 232, 0.88)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "bold 13px Trebuchet MS";
    const muteLabel = masterVolume <= 0 ? "ミュート解除" : "ミュート";
    const muteLabelW = ctx.measureText(muteLabel).width;
    ctx.fillText(muteLabel, SETTINGS_MUTE_RECT.x + (SETTINGS_MUTE_RECT.w - muteLabelW) * 0.5, SETTINGS_MUTE_RECT.y + 18);

    drawRoundedRect(SETTINGS_MINUS_RECT.x, SETTINGS_MINUS_RECT.y, SETTINGS_MINUS_RECT.w, SETTINGS_MINUS_RECT.h, 7);
    ctx.fillStyle = "rgba(86, 99, 114, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 205, 232, 0.86)";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 23px Trebuchet MS";
    ctx.fillText("−", SETTINGS_MINUS_RECT.x + 11, SETTINGS_MINUS_RECT.y + 21);

    drawRoundedRect(SETTINGS_PLUS_RECT.x, SETTINGS_PLUS_RECT.y, SETTINGS_PLUS_RECT.w, SETTINGS_PLUS_RECT.h, 7);
    ctx.fillStyle = "rgba(86, 99, 114, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 205, 232, 0.86)";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Trebuchet MS";
    ctx.fillText("+", SETTINGS_PLUS_RECT.x + 10, SETTINGS_PLUS_RECT.y + 21);

    drawRoundedRect(SETTINGS_SLIDER_RECT.x, SETTINGS_SLIDER_RECT.y - 4, SETTINGS_SLIDER_RECT.w, 16, 8);
    ctx.fillStyle = "rgba(44, 61, 79, 0.92)";
    ctx.fill();

    const fillW = Math.max(8, SETTINGS_SLIDER_RECT.w * masterVolume);
    drawRoundedRect(SETTINGS_SLIDER_RECT.x, SETTINGS_SLIDER_RECT.y - 4, fillW, 16, 8);
    ctx.fillStyle = "rgba(112, 180, 143, 0.95)";
    ctx.fill();

    const knobX = SETTINGS_SLIDER_RECT.x + SETTINGS_SLIDER_RECT.w * masterVolume;
    ctx.beginPath();
    ctx.arc(knobX, SETTINGS_SLIDER_RECT.y + 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#f5fbff";
    ctx.fill();
    ctx.strokeStyle = "rgba(39, 74, 104, 0.95)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  function drawTopInfo() {
    if (state.mode !== "playing") return;

    drawSettingsButton();

    let chipX = 944;
    const chips = [
      { label: "メモ", active: state.memoDigitsKnown },
      { label: "順序", active: state.orderHintKnown },
      { label: "部屋鍵", active: hasItem("room-key") || state.safeUnlocked },
    ];
    ctx.font = "bold 14px Trebuchet MS";
    for (let i = chips.length - 1; i >= 0; i -= 1) {
      const chip = chips[i];
      const chipWidth = Math.ceil(ctx.measureText(chip.label).width) + 18;
      chipX -= chipWidth;
      drawRoundedRect(chipX, 14, chipWidth, 26, 8);
      ctx.fillStyle = chip.active ? "rgba(97, 165, 111, 0.95)" : "rgba(98, 115, 134, 0.9)";
      ctx.fill();
      ctx.fillStyle = "#f5fbff";
      ctx.fillText(chip.label, chipX + 9, 32);
      chipX -= 8;
    }

    if (state.inspect) {
      drawRoundedRect(16, 14, 160, 28, 8);
      ctx.fillStyle = "rgba(12, 32, 54, 0.78)";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText(state.inspect === "safe" ? "調査中: 金庫" : "調査中: 扉", 26, 33);
    }
  }

  function drawInventoryFallbackIcon(item, rect) {
    const iconRect = {
      x: rect.x + 8,
      y: rect.y + 7,
      w: rect.w - 16,
      h: rect.h - 21,
    };

    if (item.id === "brass-key" || item.id === "room-key") {
      ctx.fillStyle = item.id === "brass-key" ? "#d5aa37" : "#c3d2e0";
      ctx.beginPath();
      const ringR = Math.max(5, Math.floor(iconRect.h * 0.25));
      const ringX = iconRect.x + ringR + 3;
      const ringY = iconRect.y + iconRect.h * 0.58;
      ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(ringX + ringR - 1, ringY - 2, iconRect.w - (ringR * 2 + 8), 4);
      return;
    }

    ctx.fillStyle = "#fffef7";
    ctx.fillRect(iconRect.x + 6, iconRect.y + 2, iconRect.w - 12, iconRect.h - 5);
    ctx.strokeStyle = "#d2c6aa";
    ctx.lineWidth = 1;
    ctx.strokeRect(iconRect.x + 6, iconRect.y + 2, iconRect.w - 12, iconRect.h - 5);
    ctx.fillStyle = "#4a4f58";
    ctx.font = "bold 13px Trebuchet MS";
    ctx.fillText(SAFE_MEMO_DIGITS, iconRect.x + 12, iconRect.y + iconRect.h - 6);
  }

  function drawInventoryItemIcon(item, rect) {
    const iconKey = iconKeyByItemId(item.id);
    const iconRect = { x: rect.x + 8, y: rect.y + 7, w: rect.w - 16, h: rect.h - 21 };
    if (!iconKey || !drawAssetContainTrimmed(iconKey, iconRect, 1)) {
      drawInventoryFallbackIcon(item, rect);
    }
  }

  function drawInventory() {
    const trayGrad = ctx.createLinearGradient(
      INVENTORY_TRAY_RECT.x,
      INVENTORY_TRAY_RECT.y,
      INVENTORY_TRAY_RECT.x,
      INVENTORY_TRAY_RECT.y + INVENTORY_TRAY_RECT.h
    );
    trayGrad.addColorStop(0, "rgba(16, 36, 56, 0.96)");
    trayGrad.addColorStop(1, "rgba(22, 45, 67, 0.95)");
    drawRoundedRect(
      INVENTORY_TRAY_RECT.x,
      INVENTORY_TRAY_RECT.y,
      INVENTORY_TRAY_RECT.w,
      INVENTORY_TRAY_RECT.h,
      12
    );
    ctx.fillStyle = trayGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 204, 230, 0.58)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 17px Trebuchet MS";
    ctx.textBaseline = "top";
    ctx.fillText("持ち物", INVENTORY_TRAY_RECT.x + 14, INVENTORY_TRAY_RECT.y + 8);
    ctx.restore();

    for (let i = 0; i < 4; i += 1) {
      const rect = inventorySlotRect(i);
      const item = state.items[i] || null;
      const selected = item && item.id === state.selectedItemId;
      drawRoundedRect(rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fillStyle = selected ? "#e5c76d" : "#d7dee7";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = selected ? "#946c18" : "#6a7786";
      ctx.stroke();

      if (!item) continue;

      drawInventoryItemIcon(item, rect);

      const detailBtn = inventoryDetailButtonRect(i);
      drawRoundedRect(detailBtn.x, detailBtn.y, detailBtn.w, detailBtn.h, 5);
      ctx.fillStyle = "rgba(18, 38, 58, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(192, 218, 241, 0.86)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "#f3f8fd";
      ctx.font = "bold 18px Trebuchet MS";
      ctx.fillText("+", detailBtn.x + 7, detailBtn.y + 17);
    }
  }

  function drawCloseButton() {
    drawRoundedRect(INSPECT_CLOSE.x, INSPECT_CLOSE.y, INSPECT_CLOSE.w, INSPECT_CLOSE.h, 6);
    ctx.fillStyle = "#d0d7df";
    ctx.fill();
    ctx.strokeStyle = "#3e4f64";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#1f2d3e";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText("×", INSPECT_CLOSE.x + 6, INSPECT_CLOSE.y + 18);
  }

  function drawItemInspectCloseButton() {
    drawRoundedRect(ITEM_INSPECT_CLOSE.x, ITEM_INSPECT_CLOSE.y, ITEM_INSPECT_CLOSE.w, ITEM_INSPECT_CLOSE.h, 6);
    ctx.fillStyle = "#d0d7df";
    ctx.fill();
    ctx.strokeStyle = "#3e4f64";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#1f2d3e";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText("×", ITEM_INSPECT_CLOSE.x + 6, ITEM_INSPECT_CLOSE.y + 18);
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const units = text.includes(" ") ? text.split(" ") : Array.from(text);
    const joiner = text.includes(" ") ? " " : "";
    let line = "";
    let cursorY = y;
    for (let i = 0; i < units.length; i += 1) {
      const test = line ? `${line}${joiner}${units[i]}` : units[i];
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }
      if (line) {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
      }
      line = units[i];
    }
    if (line) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
    return cursorY;
  }

  function drawInspectFrame(title) {
    ctx.fillStyle = "rgba(9, 16, 24, 0.7)";
    ctx.fillRect(110, 60, 740, 390);
    drawRoundedRect(INSPECT_PANEL.x, INSPECT_PANEL.y, INSPECT_PANEL.w, INSPECT_PANEL.h, 12);
    ctx.fillStyle = "rgba(18, 30, 46, 0.96)";
    ctx.fill();
    ctx.strokeStyle = "rgba(184, 203, 226, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Trebuchet MS";
    ctx.fillText(title, INSPECT_PANEL.x + 24, INSPECT_PANEL.y + 40);
    drawCloseButton();
  }

  function drawItemInspectOverlay() {
    if (!state.itemInspectId || state.mode !== "playing") return;
    const item = getItemById(state.itemInspectId);
    if (!item) {
      state.itemInspectId = null;
      return;
    }

    ctx.fillStyle = "rgba(9, 16, 24, 0.72)";
    ctx.fillRect(96, 54, 768, 408);

    drawRoundedRect(ITEM_INSPECT_PANEL.x, ITEM_INSPECT_PANEL.y, ITEM_INSPECT_PANEL.w, ITEM_INSPECT_PANEL.h, 12);
    ctx.fillStyle = "rgba(15, 29, 45, 0.98)";
    ctx.fill();
    ctx.strokeStyle = "rgba(184, 203, 226, 0.76)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px Trebuchet MS";
    ctx.fillText(item.label, ITEM_INSPECT_PANEL.x + 24, ITEM_INSPECT_PANEL.y + 42);
    drawItemInspectCloseButton();

    drawRoundedRect(ITEM_INSPECT_ICON.x, ITEM_INSPECT_ICON.y, ITEM_INSPECT_ICON.w, ITEM_INSPECT_ICON.h, 10);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();

    const iconKey = iconKeyByItemId(item.id);
    if (!iconKey || !drawAssetContainTrimmed(iconKey, ITEM_INSPECT_ICON, 16)) {
      drawInventoryFallbackIcon(item, ITEM_INSPECT_ICON);
    }
    ctx.strokeStyle = "rgba(157, 189, 219, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ITEM_INSPECT_ICON.x, ITEM_INSPECT_ICON.y, ITEM_INSPECT_ICON.w, ITEM_INSPECT_ICON.h);

    drawRoundedRect(ITEM_INSPECT_DESC.x, ITEM_INSPECT_DESC.y, ITEM_INSPECT_DESC.w, ITEM_INSPECT_DESC.h, 10);
    ctx.fillStyle = "rgba(8, 24, 40, 0.82)";
    ctx.fill();
    ctx.strokeStyle = "rgba(126, 162, 197, 0.86)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 21px Trebuchet MS";
    ctx.fillText("持ち物の説明", ITEM_INSPECT_DESC.x + 16, ITEM_INSPECT_DESC.y + 34);
    ctx.fillStyle = "rgba(228, 240, 250, 0.95)";
    ctx.font = "17px Trebuchet MS";
    const desc = itemDescription(item).replace(/\n/g, " ");
    drawWrappedText(desc, ITEM_INSPECT_DESC.x + 16, ITEM_INSPECT_DESC.y + 66, ITEM_INSPECT_DESC.w - 30, 28);

    ctx.fillStyle = "rgba(203, 224, 244, 0.92)";
    ctx.font = "14px Trebuchet MS";
    ctx.fillText("× / Esc で閉じる", ITEM_INSPECT_DESC.x + 16, ITEM_INSPECT_DESC.y + ITEM_INSPECT_DESC.h - 16);
  }

  function getSafeButtons() {
    const buttons = [];
    for (let row = 0; row < KEYPAD_ROWS.length; row += 1) {
      for (let col = 0; col < KEYPAD_ROWS[row].length; col += 1) {
        buttons.push({
          key: KEYPAD_ROWS[row][col],
          x: KEYPAD_LAYOUT.startX + col * (KEYPAD_LAYOUT.buttonW + KEYPAD_LAYOUT.gapX),
          y: KEYPAD_LAYOUT.startY + row * (KEYPAD_LAYOUT.buttonH + KEYPAD_LAYOUT.gapY),
          w: KEYPAD_LAYOUT.buttonW,
          h: KEYPAD_LAYOUT.buttonH,
        });
      }
    }
    return buttons;
  }

  function drawSafeInspect() {
    drawInspectFrame("金庫");

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    drawRoundedRect(SAFE_IMAGE_RECT.x, SAFE_IMAGE_RECT.y, SAFE_IMAGE_RECT.w, SAFE_IMAGE_RECT.h, 10);
    ctx.fill();
    const sceneImage = getCurrentVariantBackgroundImage() || (assets.bgRoomBase.loaded ? assets.bgRoomBase.image : null);
    if (!sceneImage || !drawCanvasSliceFromCoverImage(sceneImage, HOTSPOTS.safe, SAFE_IMAGE_RECT, 16)) {
      drawAssetContain(state.safeUnlocked ? "safeOpen" : "safeLocked", SAFE_IMAGE_RECT, 12);
    }
    ctx.strokeStyle = "rgba(170, 194, 221, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(SAFE_IMAGE_RECT.x, SAFE_IMAGE_RECT.y, SAFE_IMAGE_RECT.w, SAFE_IMAGE_RECT.h);

    drawRoundedRect(SAFE_DISPLAY.x, SAFE_DISPLAY.y, SAFE_DISPLAY.w, SAFE_DISPLAY.h, 6);
    ctx.fillStyle = "#132237";
    ctx.fill();
    ctx.strokeStyle = "#7a91ac";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f4fbff";
    ctx.font = "bold 31px Trebuchet MS";
    ctx.fillText(state.safeInput || "---", SAFE_DISPLAY.x + 16, SAFE_DISPLAY.y + 35);
    ctx.fillStyle = "rgba(213, 232, 247, 0.9)";
    ctx.font = "13px Trebuchet MS";
    ctx.fillText(
      `試行回数: ${state.safeAttempts} / 入力桁: ${state.safeInput.length}/3`,
      SAFE_DISPLAY.x + 16,
      SAFE_DISPLAY.y + 54
    );

    if (!state.safeUnlocked) {
      const buttons = getSafeButtons();
      for (const button of buttons) {
        drawRoundedRect(button.x, button.y, button.w, button.h, 6);
        ctx.fillStyle = button.key === "E" ? "#4e7ca9" : button.key === "C" ? "#8a4e58" : "#c8d3df";
        ctx.fill();
        ctx.strokeStyle = "#3c4d60";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = button.key === "E" || button.key === "C" ? "#fff" : "#1f2a38";
        ctx.font = "bold 25px Trebuchet MS";
        ctx.fillText(button.key, button.x + 23, button.y + 28);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
      ctx.font = "17px Trebuchet MS";
      ctx.fillText("暗証番号は3桁。Eで確定、Cでクリア", 220, 404);
      ctx.fillStyle = state.safeLastResult === "wrong" ? "#ffd3d3" : "rgba(227, 238, 250, 0.92)";
      ctx.font = "16px Trebuchet MS";
      if (state.safeLastResult === "wrong") {
        ctx.fillText("前回の入力は不正解だった", 220, 425);
      } else if (state.safeLastResult === "cleared") {
        ctx.fillText("入力をクリアした。再入力できる", 220, 425);
      } else if (state.safeLastResult === "need-three") {
        ctx.fillText("3桁入力してからEで確定", 220, 425);
      }
      return;
    }

    drawRoundedRect(SAFE_KEY_ITEM_RECT.x, SAFE_KEY_ITEM_RECT.y, SAFE_KEY_ITEM_RECT.w, SAFE_KEY_ITEM_RECT.h, 8);
    ctx.fillStyle = "rgba(12, 32, 54, 0.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(131, 165, 201, 0.88)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Trebuchet MS";
    ctx.fillText("部屋鍵は回収済み", SAFE_KEY_ITEM_RECT.x + 70, SAFE_KEY_ITEM_RECT.y + 42);
    ctx.font = "17px Trebuchet MS";
    ctx.fillText(`解除までの試行回数: ${state.safeAttempts}`, SAFE_KEY_ITEM_RECT.x + 70, SAFE_KEY_ITEM_RECT.y + 66);
  }

  function drawDoorInspect() {
    drawInspectFrame("出口の扉");

    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.font = "22px Trebuchet MS";
    if (state.doorUnlocked) {
      ctx.fillText("扉は解錠済み。開けると脱出できる。", 250, 205);
    } else if (hasItem("room-key")) {
      ctx.fillText("部屋鍵が使えそうだ。", 250, 205);
    } else {
      ctx.fillText("鍵穴がある。部屋鍵が必要だ。", 250, 205);
    }

    drawRoundedRect(DOOR_ACTION_RECT.x, DOOR_ACTION_RECT.y, DOOR_ACTION_RECT.w, DOOR_ACTION_RECT.h, 10);
    ctx.fillStyle = state.doorUnlocked || hasItem("room-key") ? "#4c7f56" : "#535b65";
    ctx.fill();
    ctx.strokeStyle = "#21303a";
    ctx.lineWidth = 2;
    ctx.stroke();
    const actionLabel = state.doorUnlocked ? "外へ出る" : hasItem("room-key") ? "鍵で開ける" : "扉を押す";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Trebuchet MS";
    const actionLabelW = ctx.measureText(actionLabel).width;
    ctx.fillText(
      actionLabel,
      DOOR_ACTION_RECT.x + (DOOR_ACTION_RECT.w - actionLabelW) * 0.5,
      DOOR_ACTION_RECT.y + 33
    );
  }

  function drawInspectOverlay() {
    if (!state.inspect || state.mode !== "playing") return;
    if (state.inspect === "safe") {
      drawSafeInspect();
      return;
    }
    if (state.inspect === "door") {
      drawDoorInspect();
    }
  }

  function drawDebugOverlay() {
    if (!state.debugHotspots) return;

    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    ctx.font = "14px Trebuchet MS";

    for (const [name, rect] of Object.entries(HOTSPOTS)) {
      ctx.fillStyle = "rgba(82, 170, 255, 0.14)";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "rgba(82, 170, 255, 0.95)";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = "#eaf6ff";
      ctx.fillText(name, rect.x + 4, rect.y + 14);
    }

    for (let i = 0; i < 4; i += 1) {
      const rect = inventorySlotRect(i);
      ctx.strokeStyle = "rgba(255, 225, 92, 0.95)";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      const detail = inventoryDetailButtonRect(i);
      ctx.strokeRect(detail.x, detail.y, detail.w, detail.h);
      ctx.fillStyle = "#fff2b8";
      ctx.fillText(`inv-${i + 1}`, rect.x + 4, rect.y + 14);
    }

    if (state.inspect) {
      ctx.strokeStyle = "rgba(255, 152, 111, 0.95)";
      ctx.strokeRect(INSPECT_PANEL.x, INSPECT_PANEL.y, INSPECT_PANEL.w, INSPECT_PANEL.h);
      ctx.strokeRect(INSPECT_CLOSE.x, INSPECT_CLOSE.y, INSPECT_CLOSE.w, INSPECT_CLOSE.h);

      if (state.inspect === "door") {
        ctx.strokeRect(DOOR_ACTION_RECT.x, DOOR_ACTION_RECT.y, DOOR_ACTION_RECT.w, DOOR_ACTION_RECT.h);
      } else if (state.inspect === "safe") {
        ctx.strokeRect(SAFE_DISPLAY.x, SAFE_DISPLAY.y, SAFE_DISPLAY.w, SAFE_DISPLAY.h);
        for (const button of getSafeButtons()) {
          ctx.strokeRect(button.x, button.y, button.w, button.h);
        }
        if (state.safeUnlocked) {
          ctx.strokeRect(SAFE_KEY_ITEM_RECT.x, SAFE_KEY_ITEM_RECT.y, SAFE_KEY_ITEM_RECT.w, SAFE_KEY_ITEM_RECT.h);
        }
      }
    }
    if (state.itemInspectId) {
      ctx.strokeStyle = "rgba(255, 112, 255, 0.95)";
      ctx.strokeRect(ITEM_INSPECT_PANEL.x, ITEM_INSPECT_PANEL.y, ITEM_INSPECT_PANEL.w, ITEM_INSPECT_PANEL.h);
      ctx.strokeRect(ITEM_INSPECT_CLOSE.x, ITEM_INSPECT_CLOSE.y, ITEM_INSPECT_CLOSE.w, ITEM_INSPECT_CLOSE.h);
      ctx.strokeRect(ITEM_INSPECT_ICON.x, ITEM_INSPECT_ICON.y, ITEM_INSPECT_ICON.w, ITEM_INSPECT_ICON.h);
      ctx.strokeRect(ITEM_INSPECT_DESC.x, ITEM_INSPECT_DESC.y, ITEM_INSPECT_DESC.w, ITEM_INSPECT_DESC.h);
    }
    ctx.strokeStyle = "rgba(167, 255, 146, 0.95)";
    ctx.strokeRect(SETTINGS_BUTTON_RECT.x, SETTINGS_BUTTON_RECT.y, SETTINGS_BUTTON_RECT.w, SETTINGS_BUTTON_RECT.h);
    if (state.settingsOpen) {
      ctx.strokeRect(SETTINGS_PANEL_RECT.x, SETTINGS_PANEL_RECT.y, SETTINGS_PANEL_RECT.w, SETTINGS_PANEL_RECT.h);
      ctx.strokeRect(SETTINGS_MINUS_RECT.x, SETTINGS_MINUS_RECT.y, SETTINGS_MINUS_RECT.w, SETTINGS_MINUS_RECT.h);
      ctx.strokeRect(SETTINGS_PLUS_RECT.x, SETTINGS_PLUS_RECT.y, SETTINGS_PLUS_RECT.w, SETTINGS_PLUS_RECT.h);
      ctx.strokeRect(SETTINGS_MUTE_RECT.x, SETTINGS_MUTE_RECT.y, SETTINGS_MUTE_RECT.w, SETTINGS_MUTE_RECT.h);
      ctx.strokeRect(
        SETTINGS_SLIDER_RECT.x - 10,
        SETTINGS_SLIDER_RECT.y - 10,
        SETTINGS_SLIDER_RECT.w + 20,
        SETTINGS_SLIDER_RECT.h + 20
      );
    }

    ctx.setLineDash([]);
    drawRoundedRect(722, 13, 222, 40, 8);
    ctx.fillStyle = "rgba(8, 19, 34, 0.86)";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px Trebuchet MS";
    const px = Math.round(state.lastPointer.x);
    const py = Math.round(state.lastPointer.y);
    ctx.fillText(`DEBUG ON  pointer: (${px}, ${py})`, 734, 38);
    ctx.restore();
  }

  function drawToast() {
    if (state.mode !== "playing") return;
    if (!state.toast.text || state.toast.ttlMs <= 0) return;

    ctx.font = "bold 18px Trebuchet MS";
    const textWidth = Math.ceil(ctx.measureText(state.toast.text).width);
    const bubbleW = Math.min(760, textWidth + 34);
    const bubbleX = (WORLD.width - bubbleW) * 0.5;
    const bubbleY = SCENE_HEIGHT - 54;
    const fadePhase = state.toast.ttlMs > TOAST_FADE_MS ? 1 : Math.max(0, state.toast.ttlMs / TOAST_FADE_MS);
    const fade = Math.pow(fadePhase, 1.9);

    drawRoundedRect(bubbleX, bubbleY, bubbleW, 34, 17);
    ctx.fillStyle = `rgba(14, 31, 46, ${0.74 * fade})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(173, 203, 230, ${0.7 * fade})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = `rgba(245, 251, 255, ${fade})`;
    ctx.fillText(state.toast.text, bubbleX + 16, bubbleY + 23, bubbleW - 24);
  }

  function drawModeOverlay() {
    if (state.mode === "playing") return;

    ctx.fillStyle = "rgba(11, 17, 25, 0.64)";
    ctx.fillRect(170, 150, 620, 210);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Trebuchet MS";
    if (state.mode === "menu") {
      ctx.fillText("洋室からの脱出", 250, 225);
    } else {
      ctx.fillText("脱出成功", 360, 225);
    }
    ctx.font = "24px Trebuchet MS";
    if (state.mode === "menu") {
      ctx.fillText("気になる場所をクリックして調べる", 303, 275);
      ctx.fillText("D: 境界表示 / F: 全画面 / R: リセット", 273, 313);
      if (!assetStatus.ready) {
        ctx.font = "16px Trebuchet MS";
        ctx.fillText("素材を読込中...", 430, 338);
      }
    } else {
      ctx.fillText("洋室からの脱出に成功した", 315, 275);
      ctx.fillText("Rで再プレイ", 405, 313);
    }
  }

  function draw() {
    drawScene();
    drawIntroSceneOverlay();
    drawTopInfo();
    drawInventory();
    drawInspectOverlay();
    drawItemInspectOverlay();
    drawModeOverlay();
    drawSettingsPanel();
    drawToast();
    drawDebugOverlay();
  }

  function reset(mode = "menu") {
    const next = makeInitialState();
    next.mode = mode;
    if (mode === "playing") {
      next.message = "気になる場所を調べて脱出しよう";
    }
    state = next;
    draw();
  }

  function setStartButtonState(hidden, label) {
    if (!startButton) return;
    startButton.classList.toggle("hidden", hidden);
    if (label) {
      startButton.textContent = label;
    }
  }

  function startGame() {
    unlockAudio();
    playSfx("uiClick");
    reset("playing");
    setStartButtonState(true);
  }

  function handleSettingsClick(x, y) {
    if (pointInRect(x, y, SETTINGS_BUTTON_RECT)) {
      state.settingsOpen = !state.settingsOpen;
      playSfx(state.settingsOpen ? "modalOpen" : "modalClose", 0.92);
      return true;
    }

    if (!state.settingsOpen) return false;

    if (!pointInRect(x, y, SETTINGS_PANEL_RECT)) {
      state.settingsOpen = false;
      playSfx("modalClose", 0.92);
      return true;
    }

    if (pointInRect(x, y, SETTINGS_MINUS_RECT)) {
      setMasterVolume(masterVolume - 0.1);
      playSfx("uiClick", 0.9);
      return true;
    }
    if (pointInRect(x, y, SETTINGS_PLUS_RECT)) {
      setMasterVolume(masterVolume + 0.1);
      playSfx("uiClick", 0.9);
      return true;
    }
    if (pointInRect(x, y, SETTINGS_MUTE_RECT)) {
      if (masterVolume <= 0.01) {
        setMasterVolume(volumeBeforeMute || 0.74);
      } else {
        volumeBeforeMute = masterVolume;
        setMasterVolume(0);
      }
      playSfx("uiClick", 0.9);
      return true;
    }

    const sliderPad = 10;
    const sliderRect = {
      x: SETTINGS_SLIDER_RECT.x - sliderPad,
      y: SETTINGS_SLIDER_RECT.y - sliderPad,
      w: SETTINGS_SLIDER_RECT.w + sliderPad * 2,
      h: SETTINGS_SLIDER_RECT.h + sliderPad * 2,
    };
    if (pointInRect(x, y, sliderRect)) {
      const ratio = clamp01((x - SETTINGS_SLIDER_RECT.x) / SETTINGS_SLIDER_RECT.w);
      setMasterVolume(ratio);
      playSfx("uiClick", 0.9);
      return true;
    }

    return true;
  }

  function handleInventoryClick(x, y) {
    for (let i = 0; i < 4; i += 1) {
      const rect = inventorySlotRect(i);
      if (!pointInRect(x, y, rect)) continue;
      const item = state.items[i] || null;
      if (item && pointInRect(x, y, inventoryDetailButtonRect(i))) {
        openItemInspect(item.id);
        return true;
      }
      if (!item) {
        state.selectedItemId = null;
        setMessage("持ち物の選択を外した");
        playSfx("uiClick");
        return true;
      }
      if (state.selectedItemId === item.id) {
        state.selectedItemId = null;
        setMessage(`${item.label}の選択を外した`);
        playSfx("uiClick");
      } else {
        state.selectedItemId = item.id;
        setMessage(`${item.label}を選んだ`);
        playSfx("uiClick");
      }
      return true;
    }
    return false;
  }

  function handleItemInspectClick(x, y) {
    if (pointInRect(x, y, ITEM_INSPECT_CLOSE)) {
      closeItemInspect("持ち物の確認を閉じた");
      return;
    }
    if (!pointInRect(x, y, ITEM_INSPECT_PANEL)) {
      closeItemInspect("持ち物の確認を閉じた");
    }
  }

  function interactPlant() {
    if (state.flags.brassKeyTaken) {
      setMessage("観葉植物だ。ほかに気になる点はない");
      playSfx("uiClick", 0.9);
      return;
    }
    state.flags.brassKeyTaken = true;
    addItem({ id: "brass-key", label: "真鍮鍵", useHint: "小ぶりな真鍮鍵。" });
    setMessage("鉢の裏で真鍮鍵を見つけた");
    playSfx("itemPick");
  }

  function interactDrawer() {
    const selected = selectedItem();
    if (!state.drawerUnlocked) {
      if (selected && selected.id !== "brass-key") {
        setMessage("この持ち物では手応えがない");
        playSfx("safeNg", 0.82);
        return;
      }
      if (!hasItem("brass-key")) {
        setMessage("引き出しには鍵がかかっている");
        playSfx("uiClick");
        return;
      }
      state.drawerUnlocked = true;
      state.drawerOpened = true;
      removeItem("brass-key");
      state.noteFound = true;
      state.memoDigitsKnown = true;
      refreshCodeKnown();
      addItem({ id: "memo", label: "メモ", useHint: `『${SAFE_MEMO_DIGITS}』と記されたメモ。` });
      setMessage("引き出しにメモが残されている");
      playSfx("itemPick");
      return;
    }

    if (!state.noteFound) {
      state.noteFound = true;
      state.memoDigitsKnown = true;
      refreshCodeKnown();
      addItem({ id: "memo", label: "メモ", useHint: `『${SAFE_MEMO_DIGITS}』と記されたメモ。` });
      setMessage("引き出しにあるメモを確認した");
      playSfx("itemPick");
      return;
    }

    setMessage("引き出しは空だ");
    playSfx("uiClick");
  }

  function interactPainting() {
    state.orderHintKnown = true;
    refreshCodeKnown();
    setMessage(`絵の裏に『${SAFE_ORDER_HINT}』とある。何かの順番だろうか`);
    playSfx("uiClick");
  }

  function openInspect(target) {
    state.settingsOpen = false;
    state.itemInspectId = null;
    state.inspect = target;
    playSfx("modalOpen");
    if (target === "safe") {
      setMessage("金庫を調べる");
    } else if (target === "door") {
      setMessage("扉を調べる");
    }
  }

  function closeInspect(message) {
    state.inspect = null;
    playSfx("modalClose");
    if (message) setMessage(message);
  }

  function openItemInspect(itemId) {
    const item = getItemById(itemId);
    if (!item) return;
    state.settingsOpen = false;
    state.itemInspectId = item.id;
    playSfx("modalOpen");
    setMessage(`${item.label}を確認している`, false);
  }

  function closeItemInspect(message) {
    state.itemInspectId = null;
    playSfx("modalClose");
    if (message) setMessage(message, false);
  }

  function safePressKey(key) {
    if (state.safeUnlocked) return;

    if (key === "C") {
      state.safeInput = "";
      state.safeLastResult = "cleared";
      setMessage("入力を消した");
      playSfx("uiClick", 0.9);
      return;
    }

    if (key === "E") {
      if (state.safeInput.length !== 3) {
        state.safeLastResult = "need-three";
        setMessage("3桁そろえてから確定する");
        playSfx("safeNg", 0.8);
        return;
      }
      state.safeAttempts += 1;
      if (state.safeInput === SAFE_CODE) {
        state.safeUnlocked = true;
        state.safeInput = "";
        state.safeLastResult = "opened";
        if (!state.flags.roomKeyTaken) {
          state.flags.roomKeyTaken = true;
          addItem({ id: "room-key", label: "部屋鍵", useHint: "重みのある鍵。" });
        }
        setMessage("金庫が開いた。中に鍵がある");
        playSfx("safeOk");
      } else {
        state.safeInput = "";
        state.safeLastResult = "wrong";
        setMessage("違うようだ");
        playSfx("safeNg");
      }
      return;
    }

    if (!/^\d$/.test(key)) return;

    if (state.safeInput.length >= 3) {
      state.safeLastResult = "need-three";
      setMessage("3桁そろった。Eで確定できる");
      playSfx("safeNg", 0.8);
      return;
    }

    state.safeInput += key;
    state.safeLastResult = "typing";
    setMessage(`入力中: ${state.safeInput}`);
    playSfx("safeInput");
  }

  function tryDoorAction() {
    const selected = selectedItem();
    if (state.doorUnlocked) {
      playSfx("win");
      state.mode = "won";
      state.inspect = null;
      state.itemInspectId = null;
      state.message = "洋室からの脱出に成功した";
      state.toast = { text: "", ttlMs: 0 };
      setStartButtonState(false, "もう一度遊ぶ");
      return;
    }

    if (selected && selected.id !== "room-key") {
      setMessage("この持ち物では手応えがない");
      playSfx("safeNg", 0.82);
      return;
    }

    if (!hasItem("room-key")) {
      setMessage("扉は固く閉じている。鍵が必要だ");
      playSfx("safeNg", 0.82);
      return;
    }

    state.doorUnlocked = true;
    removeItem("room-key");
    playSfx("doorUnlock");
    playSfx("win", 0.92);
    state.mode = "won";
    state.inspect = null;
    state.itemInspectId = null;
    state.message = "洋室からの脱出に成功した";
    state.toast = { text: "", ttlMs: 0 };
    setStartButtonState(false, "もう一度遊ぶ");
  }

  function handleInspectClick(x, y) {
    if (pointInRect(x, y, INSPECT_CLOSE)) {
      closeInspect("調べるのをやめた");
      return;
    }

    if (!pointInRect(x, y, INSPECT_PANEL)) {
      closeInspect("調べるのをやめた");
      return;
    }

    if (state.inspect === "door") {
      if (pointInRect(x, y, DOOR_ACTION_RECT)) {
        tryDoorAction();
        return;
      }
      return;
    }

    if (state.inspect !== "safe") return;

    if (state.safeUnlocked) {
      setMessage("金庫は開いている。もう中は空だ");
      playSfx("uiClick");
      return;
    }

    const buttons = getSafeButtons();
    for (const button of buttons) {
      if (pointInRect(x, y, button)) {
        safePressKey(button.key);
        return;
      }
    }
    setMessage("テンキーで番号を入力する");
    playSfx("uiClick");
  }

  function handlePlayClick(x, y) {
    if (handleSettingsClick(x, y)) {
      return;
    }

    if (state.itemInspectId) {
      handleItemInspectClick(x, y);
      return;
    }

    if (handleInventoryClick(x, y)) return;

    if (state.inspect) {
      handleInspectClick(x, y);
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.safe)) {
      openInspect("safe");
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.door)) {
      openInspect("door");
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.plant)) {
      interactPlant();
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.drawer)) {
      interactDrawer();
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.painting)) {
      interactPainting();
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.window)) {
      setMessage("窓は外から固定されている。ここからは出られない");
      playSfx("uiClick");
      return;
    }

    if (pointInRect(x, y, HOTSPOTS.table)) {
      setMessage("ローテーブル。特に仕掛けはなさそうだ");
      playSfx("uiClick");
      return;
    }

    setMessage("特に変化はない");
    playSfx("uiClick");
  }

  function canvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * sx,
      y: (event.clientY - rect.top) * sy,
    };
  }

  function onCanvasClick(event) {
    unlockAudio();
    const pointer = canvasCoordinates(event);
    state.lastPointer = pointer;

    if (state.mode === "menu") {
      startGame();
      draw();
      return;
    }

    if (state.mode === "won") return;

    handlePlayClick(pointer.x, pointer.y);
    draw();
  }

  function update(dt) {
    if (canRevealScene() && introSceneAlpha > 0) {
      introSceneAlpha = Math.max(0, introSceneAlpha - (dt * 1000) / INTRO_SCENE_FADE_MS);
    }
    if (state.mode !== "playing") return;
    state.elapsed += dt;
    if (state.toast.ttlMs > 0) {
      state.toast.ttlMs = Math.max(0, state.toast.ttlMs - dt * 1000);
      if (state.toast.ttlMs === 0) {
        state.toast.text = "";
      }
    }
  }

  function tick(ts) {
    if (!tick.last) tick.last = ts;
    const dt = Math.min(1 / 30, (ts - tick.last) / 1000);
    tick.last = ts;

    const virtualTimeDriven = typeof window.__vt_pending !== "undefined";
    if (!virtualTimeDriven) {
      update(dt);
    }
    draw();
    rafId = requestAnimationFrame(tick);
  }
  tick.last = 0;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(() => {
        setMessage("全画面切替に失敗");
      });
    } else {
      document.exitFullscreen().catch(() => {
        setMessage("全画面終了に失敗");
      });
    }
  }

  function onKeyDown(event) {
    if (!audioStatus.unlocked && state.mode === "playing") {
      unlockAudio();
    }
    const key = event.key.toLowerCase();
    if (state.mode === "playing" && key === "v") {
      state.settingsOpen = !state.settingsOpen;
      playSfx(state.settingsOpen ? "modalOpen" : "modalClose", 0.92);
      draw();
      return;
    }
    if (state.mode === "playing" && (key === "-" || key === "_")) {
      setMasterVolume(masterVolume - 0.1);
      playSfx("uiClick", 0.9);
      draw();
      return;
    }
    if (state.mode === "playing" && (key === "=" || key === "+")) {
      setMasterVolume(masterVolume + 0.1);
      playSfx("uiClick", 0.9);
      draw();
      return;
    }
    if (state.mode === "playing" && key === "m") {
      if (masterVolume <= 0.01) {
        setMasterVolume(volumeBeforeMute || 0.74);
      } else {
        volumeBeforeMute = masterVolume;
        setMasterVolume(0);
      }
      playSfx("uiClick", 0.9);
      draw();
      return;
    }

    if (key === "f") toggleFullscreen();
    if (key === "d" || key === "a") {
      state.debugHotspots = !state.debugHotspots;
      if (state.mode === "playing") {
        setMessage(state.debugHotspots ? "デバッグ境界を表示中" : "デバッグ境界を非表示");
      }
      draw();
      return;
    }

    if (key === "r" || key === "b") {
      setStartButtonState(false, "ゲーム開始");
      reset("menu");
    }

    if (key === "escape") {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (state.settingsOpen) {
        state.settingsOpen = false;
        playSfx("modalClose", 0.92);
        draw();
        return;
      }
      if (state.itemInspectId) {
        closeItemInspect("持ち物の確認を閉じた");
        draw();
        return;
      }
      if (state.inspect) {
        closeInspect("調べるのをやめた");
        draw();
      }
    }

    if (state.mode !== "playing" || state.inspect !== "safe" || state.safeUnlocked) return;

    if (key >= "0" && key <= "9") {
      safePressKey(key);
      draw();
      return;
    }

    if (key === "enter") {
      safePressKey("E");
      draw();
      return;
    }

    if (key === "e") {
      safePressKey("E");
      draw();
      return;
    }

    if (key === "backspace" || key === "c") {
      safePressKey("C");
      draw();
    }
  }

  function renderGameToText() {
    const payload = {
      coordinateSystem: "origin_top_left_x_right_y_down",
      mode: state.mode,
      inspect: state.inspect,
      message: state.message,
      toast: state.toast,
      elapsedSeconds: Number(state.elapsed.toFixed(2)),
      layout: {
        world: WORLD,
        sceneHeight: SCENE_HEIGHT,
        trayHeight: TRAY_HEIGHT,
        inventoryTray: INVENTORY_TRAY_RECT,
      },
      assets: {
        ready: assetStatus.ready,
        failed: assetStatus.failed,
      },
      audio: {
        ready: audioStatus.ready,
        unlocked: audioStatus.unlocked,
        masterVolume,
        failed: audioStatus.failed,
        loaded: Object.fromEntries(
          Object.entries(sounds).map(([key, sound]) => [key, sound.loaded])
        ),
      },
      puzzle: {
        doorUnlocked: state.doorUnlocked,
        drawerUnlocked: state.drawerUnlocked,
        drawerOpened: state.drawerOpened,
        safeUnlocked: state.safeUnlocked,
        safeInput: state.safeInput,
        safeAttempts: state.safeAttempts,
        safeLastResult: state.safeLastResult,
        codeKnown: state.codeKnown,
        memoDigitsKnown: state.memoDigitsKnown,
        orderHintKnown: state.orderHintKnown,
      },
      items: state.items.map((item) => ({ id: item.id, label: item.label })),
      selectedItemId: state.selectedItemId,
      itemInspectId: state.itemInspectId,
      settingsOpen: state.settingsOpen,
      interactives: HOTSPOTS,
      inspectUi: {
        panel: INSPECT_PANEL,
        close: INSPECT_CLOSE,
        safeButtons: getSafeButtons(),
        safeDisplay: SAFE_DISPLAY,
        safeKeyItem: SAFE_KEY_ITEM_RECT,
        doorAction: DOOR_ACTION_RECT,
        itemInspectPanel: ITEM_INSPECT_PANEL,
        itemInspectClose: ITEM_INSPECT_CLOSE,
        settingsButton: SETTINGS_BUTTON_RECT,
        settingsPanel: SETTINGS_PANEL_RECT,
        settingsMinus: SETTINGS_MINUS_RECT,
        settingsPlus: SETTINGS_PLUS_RECT,
        settingsSlider: SETTINGS_SLIDER_RECT,
        settingsMute: SETTINGS_MUTE_RECT,
        inventoryDetailButtons: [0, 1, 2, 3].map((index) => inventoryDetailButtonRect(index)),
      },
      controls: {
        mouse: "click_to_investigate_or_use_item",
        safeKeyboard: "0-9_enter_backspace",
        restart: "R_or_B",
        fullscreen: "F",
        debugOverlay: "D",
        audioSettings: "volume_button_or_V_M_plus_minus",
        externalApi: "window.escapeGame.start/reset/getState",
        itemInspect: "inventory_plus_button_or_escape",
      },
      debugHotspots: state.debugHotspots,
      backgroundVariants: {
        enabled: BACKGROUND_VARIANTS.enabled,
        useDoorOpen: BACKGROUND_VARIANTS.useDoorOpen,
        useSafeOpen: BACKGROUND_VARIANTS.useSafeOpen,
        locked: BACKGROUND_VARIANTS.locked.loaded,
        safeOpen: BACKGROUND_VARIANTS.safeOpen.loaded,
        doorOpen: BACKGROUND_VARIANTS.doorOpen.loaded,
      },
    };
    return JSON.stringify(payload);
  }

  window.render_game_to_text = renderGameToText;

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i += 1) {
      update(1 / 60);
    }
    draw();
    return renderGameToText();
  };

  window.escapeGame = {
    start() {
      if (state.mode !== "playing") {
        startGame();
      } else {
        draw();
      }
      return JSON.parse(renderGameToText());
    },
    reset(mode = "menu") {
      const nextMode = mode === "playing" ? "playing" : "menu";
      if (nextMode === "menu") {
        setStartButtonState(false, "ゲーム開始");
      } else {
        setStartButtonState(true);
      }
      reset(nextMode);
      return JSON.parse(renderGameToText());
    },
    getState() {
      return JSON.parse(renderGameToText());
    },
  };

  if (startButton) {
    startButton.addEventListener("click", startGame);
  }
  canvas.addEventListener("click", onCanvasClick);
  window.addEventListener("keydown", onKeyDown);
  document.addEventListener("fullscreenchange", () => draw());

  restoreMasterVolume();
  preloadAssets();
  preloadSounds();
  reset("menu");
  rafId = requestAnimationFrame(tick);
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
    for (const objectUrl of audioObjectUrls) {
      URL.revokeObjectURL(objectUrl);
    }
  });
})();

(() => {
  const logList = document.getElementById("log-list");
  const inventoryItem = document.querySelector('[data-item="key"]');
  const doorStatus = document.getElementById("door-status");
  const safeModal = document.getElementById("safe-modal");
  const safeForm = document.getElementById("safe-form");
  const safeInput = document.getElementById("safe-input");
  const safeCancel = document.getElementById("safe-cancel");
  const drawerModal = document.getElementById("drawer-modal");
  const drawerForm = document.getElementById("drawer-form");
  const drawerInput = document.getElementById("drawer-input");
  const drawerCancel = document.getElementById("drawer-cancel");
  const doorModal = document.getElementById("door-modal");
  const doorForm = document.getElementById("door-form");
  const doorInput = document.getElementById("door-input");
  const doorCancel = document.getElementById("door-cancel");
  const clearModal = document.getElementById("clear-modal");
  const restartButton = document.getElementById("restart");
  const safeButton = document.querySelector('[data-object="safe"]');
  const clockButton = document.querySelector('[data-object="clock"]');
  const room = document.querySelector(".room");
  const walls = Array.from(document.querySelectorAll(".wall"));
  const compass = document.getElementById("compass");
  const compassBox = document.querySelector(".compass");
  const compassNote = document.getElementById("compass-note");
  const navButtons = document.querySelectorAll("[data-dir]");
  const memoItem = document.querySelector('[data-item="memo"]');
  const inventoryItems = document.querySelectorAll(".item");
  const hintList = document.getElementById("hint-list");
  const logPanel = document.querySelector(".log");
  const difficultySelect = document.getElementById("difficulty-select");
  const itemModal = document.getElementById("item-modal");
  const itemTitle = document.getElementById("item-title");
  const itemImage = document.getElementById("item-image");
  const itemDesc = document.getElementById("item-desc");
  const itemClose = document.getElementById("item-close");

  const MAX_LOG = 6;
  const directions = ["北", "東", "南", "西"];
  const directionMarks = ["N", "E", "S", "W"];
  const symbolCounts = { blue: 2, red: 1, yellow: 3 };
  const symbolOrder = Object.entries(symbolCounts)
    .sort(([, a], [, b]) => a - b)
    .map(([color]) => color);
  const difficultyConfig = {
    easy: { hints: true, explicit: true },
    normal: { hints: true, explicit: false },
    hard: { hints: false, explicit: false },
  };
  const itemData = {
    key: {
      title: "鍵",
      src: "assets/key.svg",
      desc: "ドアを開けるための鍵。",
    },
    memo: {
      title: "メモ",
      src: "assets/memo.svg",
      desc: "色と数字の対応が書かれている。",
    },
  };

  let wallIndex = 0;
  let safeCode = "134";
  let colorMap = { blue: "1", red: "3", yellow: "4" };
  let clockTime = { hour: 7, minute: 24 };
  let clockSum = 13;
  let drawerCode = "013";
  let doorCode = "24";
  let visitedWalls = [];
  let difficulty = "normal";
  let logTimer = null;

  const state = {
    hasKey: false,
    hasMemo: false,
    safeOpened: false,
    drawerOpened: false,
    doorUnlocked: false,
    posterSeen: false,
    shelfSeen: false,
  };

  const log = (message) => {
    const item = document.createElement("li");
    item.textContent = message;
    logList.prepend(item);
    while (logList.children.length > MAX_LOG) {
      logList.removeChild(logList.lastElementChild);
    }
    if (logPanel) {
      logPanel.classList.add("is-new");
      if (logTimer) {
        clearTimeout(logTimer);
      }
      logTimer = setTimeout(() => {
        logPanel.classList.remove("is-new");
      }, 900);
    }
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const pad = (value, length) => String(value).padStart(length, "0");

  const normalizeDigits = (value) =>
    value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xff10 + 48));

  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const setupClock = () => {
    const hour = randomInt(1, 12);
    const minute = randomInt(1, 59);
    clockTime = { hour, minute };
    const digits = `${hour}${pad(minute, 2)}`.split("");
    clockSum = digits.reduce((acc, digit) => acc + Number(digit), 0);
    drawerCode = pad(clockSum, 3);
    doorCode = pad(minute, 2);
    if (clockButton) {
      clockButton.dataset.time = `${hour}:${pad(minute, 2)}`;
    }
  };

  const setupCode = () => {
    const digits = shuffle(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    colorMap = {
      blue: digits[0],
      red: digits[1],
      yellow: digits[2],
    };
    safeCode = symbolOrder.map((color) => colorMap[color]).join("");
  };

  const getConfig = () => difficultyConfig[difficulty] || difficultyConfig.normal;

  const addHint = (key, text) => {
    if (!getConfig().hints) {
      return;
    }
    if (!hintList || hintList.querySelector(`[data-hint="${key}"]`)) {
      return;
    }
    const item = document.createElement("li");
    item.dataset.hint = key;
    item.textContent = text;
    hintList.appendChild(item);
  };

  const markTapped = (button) => {
    button.classList.remove("is-tapped");
    void button.offsetWidth;
    button.classList.add("is-tapped");
  };

  const shakeModal = (modal) => {
    const card = modal ? modal.querySelector(".modal-card") : null;
    if (!card) {
      return;
    }
    card.classList.remove("is-shake");
    void card.offsetWidth;
    card.classList.add("is-shake");
  };

  const updateCompassHint = () => {
    if (!compassBox) {
      return;
    }
    const hasUnvisited = visitedWalls.some((visited) => !visited);
    compassBox.classList.toggle("has-unvisited", hasUnvisited);
    if (compassNote) {
      compassNote.hidden = !hasUnvisited;
    }
  };

  const setWall = (nextIndex, announce = true) => {
    const count = walls.length || 1;
    wallIndex = ((nextIndex % count) + count) % count;
    walls.forEach((wall, index) => {
      wall.classList.toggle("is-active", index === wallIndex);
    });
    if (compass) {
      compass.textContent = directionMarks[wallIndex] || "N";
    }
    if (room) {
      room.dataset.wall = String(wallIndex);
    }
    if (visitedWalls.length) {
      visitedWalls[wallIndex] = true;
    }
    updateCompassHint();
    if (announce) {
      log(`視点を移した。${directions[wallIndex]}の壁だ。`);
    }
  };

  const isModalOpen = () =>
    !safeModal.hidden ||
    !drawerModal.hidden ||
    !doorModal.hidden ||
    !clearModal.hidden ||
    (itemModal && !itemModal.hidden);

  const openSafe = () => {
    safeModal.hidden = false;
    safeInput.value = "";
    safeInput.focus();
  };

  const openDrawer = () => {
    drawerModal.hidden = false;
    drawerInput.value = "";
    drawerInput.focus();
  };

  const openDoor = () => {
    doorModal.hidden = false;
    doorInput.value = "";
    doorInput.focus();
  };

  const closeSafe = () => {
    safeModal.hidden = true;
    safeForm.reset();
  };

  const closeDrawer = () => {
    drawerModal.hidden = true;
    drawerForm.reset();
  };

  const closeDoor = () => {
    doorModal.hidden = true;
    doorForm.reset();
  };

  const openItemModal = (type) => {
    if (!itemModal) {
      return;
    }
    const data = itemData[type];
    if (!data) {
      return;
    }
    itemTitle.textContent = data.title;
    itemImage.src = data.src;
    itemImage.alt = data.title;
    itemDesc.textContent = data.desc;
    itemModal.hidden = false;
  };

  const closeItemModal = () => {
    if (itemModal) {
      itemModal.hidden = true;
    }
  };

  const showClear = () => {
    clearModal.hidden = false;
  };

  const resetGame = () => {
    if (difficultySelect) {
      difficulty = difficultySelect.value;
    }
    const config = getConfig();
    setupClock();
    setupCode();
    state.hasKey = false;
    state.hasMemo = false;
    state.safeOpened = false;
    state.drawerOpened = false;
    state.doorUnlocked = false;
    state.posterSeen = false;
    state.shelfSeen = false;
    inventoryItem.classList.remove("is-visible");
    memoItem.classList.remove("is-visible");
    doorStatus.textContent = "LOCKED";
    logList.innerHTML = "";
    if (hintList) {
      hintList.innerHTML = "";
      if (!config.hints) {
        const item = document.createElement("li");
        item.textContent = "難易度: HARD（ヒントなし）";
        hintList.appendChild(item);
      }
    }
    safeModal.hidden = true;
    drawerModal.hidden = true;
    doorModal.hidden = true;
    if (itemModal) {
      itemModal.hidden = true;
    }
    clearModal.hidden = true;
    safeButton.classList.remove("is-open");
    if (room) {
      room.classList.remove("is-bright");
    }
    document.body.classList.remove("is-escape");
    document.querySelectorAll(".object").forEach((item) => item.classList.add("is-unseen"));
    visitedWalls = walls.map(() => false);
    setWall(0, false);
    updateCompassHint();
    log("部屋に入った。出口は閉ざされている。");
    log("コンパスの点滅は未調査の壁がある合図だ。");
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dir = button.dataset.dir;
      const delta = dir === "next" ? 1 : -1;
      setWall(wallIndex + delta);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (isModalOpen()) {
      return;
    }
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setWall(wallIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWall(wallIndex - 1);
    }
  });

  document.querySelectorAll(".object").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.remove("is-unseen");
      markTapped(button);

      const target = button.dataset.object;
      const config = getConfig();
      if (target === "poster") {
        state.posterSeen = true;
        if (difficulty === "hard") {
          log("ポスター: 数に意味がある。");
        } else if (config.explicit) {
          log("ポスター: 印の数が少ない色から並べる。");
        } else {
          log("ポスター: 印の数を数えろ。");
        }
        addHint("poster", "印の数が順番の手がかりになる。");
        return;
      }

      if (target === "shelf") {
        state.shelfSeen = true;
        if (difficulty === "hard") {
          log("本棚: 背表紙に小さな印がある。");
        } else if (config.explicit) {
          log("本棚: 印の数は 赤=1 青=2 黄=3。");
          addHint("shelf", "印の数は 赤=1 青=2 黄=3。");
        } else {
          log("本棚: 背表紙の印の数で並び順が決まる。");
          addHint("shelf", "背表紙の印の数で並び順が決まる。");
        }
        return;
      }

      if (target === "safe") {
        if (!state.hasMemo) {
          log("番号の手がかりがない。何かメモが必要だ。");
          return;
        }
        if (state.safeOpened) {
          log("金庫は開いている。");
          return;
        }
        openSafe();
        log("金庫を調べた。3桁の番号が必要だ。");
        return;
      }

      if (target === "clock") {
        const timeText = `${clockTime.hour}:${pad(clockTime.minute, 2)}`;
        if (difficulty === "hard") {
          log(`時計は${timeText}を指している。`);
        } else if (config.explicit) {
          log(`時計は${timeText}を指している。数字を足すと${clockSum}。`);
          log(`3桁にするなら ${drawerCode} になりそうだ。`);
        } else {
          log(`時計は${timeText}を指している。数字を足すと${clockSum}。`);
          log("3桁に整える必要がある。");
        }
        addHint("clock", `時計の数字の合計は${clockSum}。3桁なら${drawerCode}。`);
        return;
      }

      if (target === "drawer") {
        if (state.drawerOpened) {
          log("引き出しは開いている。");
          return;
        }
        openDrawer();
        log("引き出しは番号でロックされている。");
        return;
      }

      if (target === "door-note") {
        if (difficulty === "hard") {
          log("ドアノブの暗号は時間に関係がありそうだ。");
        } else if (config.explicit) {
          log("ドアノブの暗号は時計の「分」だけ。2桁だ。");
        } else {
          log("ドアノブの暗号は時計の「分」だけ。");
        }
        addHint("door-note", "ドアノブ暗号は時計の分（2桁）。");
        return;
      }

      if (target === "door") {
        if (state.hasKey) {
          if (!state.doorUnlocked) {
            openDoor();
            log("ドアノブに2桁の暗号が必要だ。");
            return;
          }
          doorStatus.textContent = "OPEN";
          showClear();
          log("鍵を使った。ドアが開いた！");
          if (room) {
            room.classList.add("is-bright");
          }
          document.body.classList.add("is-escape");
        } else {
          log("ドアは鍵がかかっている。");
        }
      }
    });
  });

  safeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalizeDigits(safeInput.value.trim());

    if (value === safeCode) {
      state.safeOpened = true;
      state.hasKey = true;
      inventoryItem.classList.add("is-visible");
      safeButton.classList.add("is-open");
      safeButton.classList.add("is-opening");
      setTimeout(() => {
        safeButton.classList.remove("is-opening");
      }, 800);
      closeSafe();
      log("金庫が開いた。鍵を入手した。");
    } else {
      log("番号が違うようだ。");
      shakeModal(safeModal);
      safeInput.select();
    }
  });

  drawerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalizeDigits(drawerInput.value.trim());

    if (value === drawerCode) {
      state.drawerOpened = true;
      state.hasMemo = true;
      memoItem.classList.add("is-visible");
      closeDrawer();
      log("引き出しが開いた。メモを入手した。");
      log(`メモ: 青=${colorMap.blue} 赤=${colorMap.red} 黄=${colorMap.yellow}。`);
      log("メモの裏に「急いで」と書かれている。");
      addHint("memo", `青=${colorMap.blue} 赤=${colorMap.red} 黄=${colorMap.yellow}`);
    } else {
      log("引き出しの番号が違う。");
      shakeModal(drawerModal);
      drawerInput.select();
    }
  });

  doorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalizeDigits(doorInput.value.trim());

    if (value === doorCode) {
      state.doorUnlocked = true;
      closeDoor();
      doorStatus.textContent = "OPEN";
      showClear();
      log("暗号が解けた。鍵を使ってドアが開いた！");
      if (room) {
        room.classList.add("is-bright");
      }
      document.body.classList.add("is-escape");
    } else {
      log("ドアノブの暗号が違う。");
      shakeModal(doorModal);
      doorInput.select();
    }
  });

  safeCancel.addEventListener("click", () => {
    closeSafe();
    log("金庫を閉じた。");
  });

  drawerCancel.addEventListener("click", () => {
    closeDrawer();
    log("引き出しを閉じた。");
  });

  doorCancel.addEventListener("click", () => {
    closeDoor();
    log("ドアノブを閉じた。");
  });

  safeModal.addEventListener("click", (event) => {
    if (event.target === safeModal) {
      closeSafe();
      log("金庫を閉じた。");
    }
  });

  drawerModal.addEventListener("click", (event) => {
    if (event.target === drawerModal) {
      closeDrawer();
      log("引き出しを閉じた。");
    }
  });

  doorModal.addEventListener("click", (event) => {
    if (event.target === doorModal) {
      closeDoor();
      log("ドアノブを閉じた。");
    }
  });

  if (itemClose) {
    itemClose.addEventListener("click", () => {
      closeItemModal();
    });
  }

  if (itemModal) {
    itemModal.addEventListener("click", (event) => {
      if (event.target === itemModal) {
        closeItemModal();
      }
    });
  }

  restartButton.addEventListener("click", () => {
    resetGame();
  });

  inventoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (!item.classList.contains("is-visible")) {
        return;
      }
      const type = item.dataset.item;
      if (type === "key") {
        log("鍵だ。ドアを開けるために使えそうだ。");
        openItemModal("key");
      } else if (type === "memo") {
        log(`メモ: 青=${colorMap.blue} 赤=${colorMap.red} 黄=${colorMap.yellow}。`);
        addHint("memo", `青=${colorMap.blue} 赤=${colorMap.red} 黄=${colorMap.yellow}`);
        openItemModal("memo");
      }
    });
  });

  if (difficultySelect) {
    difficultySelect.addEventListener("change", () => {
      resetGame();
    });
  }

  resetGame();
})();

(() => {
  const logList = document.getElementById("log-list");
  const hintList = document.getElementById("hint-list");
  const logPanel = document.querySelector(".log");
  const doorStatus = document.getElementById("door-status");
  const room = document.querySelector(".room");
  const walls = Array.from(document.querySelectorAll(".wall"));
  const compass = document.getElementById("compass");
  const compassBox = document.querySelector(".compass");
  const compassNote = document.getElementById("compass-note");
  const navButtons = document.querySelectorAll("[data-dir]");
  const difficultySelect = document.getElementById("difficulty-select");
  const inventoryEmpty = document.getElementById("inventory-empty");
  const inventoryItems = document.querySelectorAll(".item");

  const matchModal = document.getElementById("match-modal");
  const matchArea = document.getElementById("match-area");
  const matchResult = document.getElementById("match-result");
  const matchClose = document.getElementById("match-close");

  const doorModal = document.getElementById("door-modal");
  const doorForm = document.getElementById("door-form");
  const doorInput = document.getElementById("door-input");
  const doorCancel = document.getElementById("door-cancel");

  const clearModal = document.getElementById("clear-modal");
  const restartButton = document.getElementById("restart");
  const seatModal = document.getElementById("seat-modal");
  const seatClose = document.getElementById("seat-close");
  const seatUseMirror = document.getElementById("seat-use-mirror");
  const seatUseTicket = document.getElementById("seat-use-ticket");
  const seatPreview = document.querySelector(".shape-preview");
  const seatNote = document.querySelector(".shape-note");
  const itemModal = document.getElementById("item-modal");
  const itemTitle = document.getElementById("item-title");
  const itemImage = document.getElementById("item-image");
  const itemDesc = document.getElementById("item-desc");
  const itemClose = document.getElementById("item-close");

  const MAX_LOG = 6;
  const DOOR_CODE = "304";
  const directions = ["北", "東", "南", "西"];
  const directionMarks = ["N", "E", "S", "W"];
  const difficultyConfig = {
    easy: { hints: true, explicit: true },
    normal: { hints: true, explicit: false },
    hard: { hints: false, explicit: false },
  };

  let wallIndex = 0;
  let visitedWalls = [];
  let logTimer = null;
  let difficulty = "normal";

  const state = {
    windowSolved: false,
    ruleKnown: false,
    seatSeen: false,
    seatMirrored: false,
    seatFilled: false,
    doorUnlocked: false,
    hasTicket: false,
    hasMirror: false,
  };

  const normalizeDigits = (value) =>
    value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xff10 + 48));

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

  const getConfig = () => difficultyConfig[difficulty] || difficultyConfig.normal;

  const itemData = {
    ticket: {
      title: "整理券",
      src: "assets/ticket.svg",
      desc: () => {
        if (difficulty === "hard") {
          return "図形が1つ描かれている。";
        }
        if (getConfig().explicit) {
          return "図形が1つ描かれている整理券。欠けを埋めるヒントかもしれない。";
        }
        return "図形が1つ描かれている。";
      },
    },
    mirror: {
      title: "反射カード",
      src: "assets/mirror.svg",
      desc: () => {
        if (difficulty === "hard") {
          return "左右が反転して見えるカードだ。";
        }
        if (getConfig().explicit) {
          return "左右反転して読むためのカード。使う場所がありそうだ。";
        }
        return "左右反転のヒントになりそうだ。";
      },
    },
  };

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
    !matchModal.hidden ||
    !doorModal.hidden ||
    !clearModal.hidden ||
    !seatModal.hidden ||
    !itemModal.hidden;

  const openMatch = () => {
    matchModal.hidden = false;
  };

  const closeMatch = () => {
    matchModal.hidden = true;
  };

  const openDoor = () => {
    doorModal.hidden = false;
    doorInput.value = "";
    doorInput.focus();
  };

  const closeDoor = () => {
    doorModal.hidden = true;
    doorForm.reset();
  };

  const openItemModal = (type) => {
    const data = itemData[type];
    if (!data || !itemModal) {
      return;
    }
    itemTitle.textContent = data.title;
    itemImage.src = data.src;
    itemImage.alt = data.title;
    itemDesc.textContent = typeof data.desc === "function" ? data.desc() : data.desc;
    itemModal.hidden = false;
  };

  const closeItemModal = () => {
    if (itemModal) {
      itemModal.hidden = true;
    }
  };

  const openSeatModal = () => {
    seatModal.hidden = false;
  };

  const closeSeatModal = () => {
    seatModal.hidden = true;
  };

  const updateSeatMirrorUI = () => {
    if (seatPreview) {
      seatPreview.classList.toggle("is-mirrored", state.seatMirrored);
      seatPreview.classList.toggle("is-filled", state.seatFilled);
    }
    if (seatNote) {
      if (state.seatFilled) {
        seatNote.textContent = state.seatMirrored ? "反転した配置を覚える。" : "図形の配置を覚える。";
      } else {
        seatNote.textContent = state.seatMirrored ? "反転した配置（欠けあり）を覚える。" : "図形の配置（欠けあり）を覚える。";
      }
    }
    if (seatUseMirror) {
      const canUse = state.hasMirror && !state.seatMirrored;
      seatUseMirror.hidden = !state.hasMirror;
      seatUseMirror.disabled = !canUse;
    }
    if (seatUseTicket) {
      const canUse = state.hasTicket && !state.seatFilled;
      seatUseTicket.hidden = !state.hasTicket;
      seatUseTicket.disabled = !canUse;
    }
  };


  const showClear = () => {
    clearModal.hidden = false;
  };

  const resetMatchPuzzle = () => {
    matchArea.classList.remove("is-solved");
    matchResult.textContent = "まだ動かせていない。";
    matchArea.querySelectorAll(".match-stick").forEach((stick) => {
      stick.disabled = false;
    });
  };

  const resetGame = () => {
    difficulty = difficultySelect ? difficultySelect.value : "normal";
    const config = getConfig();
    state.windowSolved = false;
    state.ruleKnown = false;
    state.seatSeen = false;
    state.seatMirrored = false;
    state.seatFilled = false;
    state.doorUnlocked = false;
    logList.innerHTML = "";
    if (hintList) {
      hintList.innerHTML = "";
      if (!config.hints) {
        const item = document.createElement("li");
        item.textContent = "難易度: HARD（ヒントなし）";
        hintList.appendChild(item);
      }
    }
    doorStatus.textContent = "LOCKED";
    closeMatch();
    closeDoor();
    closeSeatModal();
    closeItemModal();
    clearModal.hidden = true;
    resetMatchPuzzle();
    if (room) {
      room.classList.remove("is-bright");
    }
    document.body.classList.remove("is-escape");
    document.querySelectorAll(".object").forEach((item) => item.classList.add("is-unseen"));
    inventoryItems.forEach((item) => item.classList.remove("is-visible"));
    if (inventoryEmpty) {
      inventoryEmpty.hidden = false;
    }
    state.hasTicket = false;
    state.hasMirror = false;
    updateSeatMirrorUI();
    visitedWalls = walls.map(() => false);
    setWall(0, false);
    updateCompassHint();
    log("車内に取り残されている。静かすぎる。");
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
      const target = button.dataset.object;
      const config = getConfig();

      if (target === "ad") {
        if (state.windowSolved) {
          log("吊り広告のマッチ棒は解かれている。");
          return;
        }
        if (config.explicit) {
          log("吊り広告: 1本動かして図形を2つの窓に。");
        } else {
          log("吊り広告: マッチ棒を1本動かす。");
        }
        addHint("ad", "1本動かして図形を2つの窓にする。");
        openMatch();
        return;
      }

      if (target === "reflection") {
        if (state.hasMirror) {
          log("反射ガラスは空だ。");
          return;
        }
        if (difficulty === "hard") {
          log("反射ガラスにカードが挟まっている。");
        } else if (config.explicit) {
          log("反射ガラス: 反射カードが挟まっている。");
        } else {
          log("反射ガラス: 何かが挟まっている。");
        }
        if (!state.hasMirror) {
          state.hasMirror = true;
          const mirrorItem = document.querySelector('[data-item="mirror"]');
          if (mirrorItem) {
            mirrorItem.classList.add("is-visible");
          }
          if (inventoryEmpty) {
            inventoryEmpty.hidden = true;
          }
          log("反射カードを拾った。");
          addHint("mirror", "左右反転のヒントになりそうだ。");
          updateSeatMirrorUI();
        }
        return;
      }

      if (target === "monitor") {
        if (difficulty === "hard") {
          log("モニターに「→ ↓」の表示が出ている。");
        } else if (config.explicit) {
          log("モニター: 「→ ↓」の順で読む。");
        } else {
          log("モニター: 矢印の向きに注目。");
        }
        addHint("monitor", "「→ ↓」の順で読む。");
        return;
      }

      if (target === "window") {
        if (state.windowSolved) {
          log("窓が左右2つに見える。");
          return;
        }
        log("窓の外は暗い。");
        return;
      }

      if (target === "seat") {
        state.seatSeen = true;
        if (state.ruleKnown) {
          log("座席裏のメモ: ○ □（欠けあり）");
          addHint("seat", "図形は L字に並んでいる。");
        } else if (difficulty === "hard") {
          log("座席裏のメモに図形が並んでいるが、1つ欠けている。");
        } else {
          log("座席裏のメモ: ○ □（欠けあり）");
        }
        openSeatModal();
        updateSeatMirrorUI();
        return;
      }

      if (target === "priority") {
        if (difficulty === "hard") {
          log("優先席のピクトが並んでいる。");
        } else if (config.explicit) {
          log("優先席: 普通の優先席ピクトだ。");
        } else {
          log("優先席のピクトを見た。");
        }
        if (!state.hasTicket) {
          state.hasTicket = true;
          const ticketItem = document.querySelector('[data-item="ticket"]');
          if (ticketItem) {
            ticketItem.classList.add("is-visible");
          }
          if (inventoryEmpty) {
            inventoryEmpty.hidden = true;
          }
          log("優先席に整理券が挟まっている。拾った。");
          addHint("ticket", "整理券には図形が描かれている。");
        }
        return;
      }

      if (target === "door") {
        if (state.doorUnlocked) {
          log("ドアは開いている。");
          return;
        }
        openDoor();
        log("ドアには3桁の暗号が必要だ。");
      }
    });
  });

  matchArea.addEventListener("click", (event) => {
    const stick = event.target.closest(".match-stick");
    if (!stick || state.windowSolved) {
      return;
    }
    if (stick.dataset.stick === "extra") {
      state.windowSolved = true;
      state.ruleKnown = true;
      matchArea.classList.add("is-solved");
      matchResult.textContent = "図形が左右2つの窓になった。";
      matchArea.querySelectorAll(".match-stick").forEach((item) => {
        item.disabled = true;
      });
      if (difficulty === "hard") {
        log("広告の図形が2つの窓になった。下に薄い文字がある。");
      } else if (getConfig().explicit) {
        log("広告の図形が2つの窓になった。『形は辺の数』と書かれている。");
      } else {
        log("広告の図形が2つの窓になった。『辺の数』と書かれている。");
      }
      addHint("rule", "形は辺の数で読む。");
    } else {
      log("違う棒だ。");
      shakeModal(matchModal);
    }
  });

  matchClose.addEventListener("click", () => {
    closeMatch();
  });

  matchModal.addEventListener("click", (event) => {
    if (event.target === matchModal) {
      closeMatch();
    }
  });

  doorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalizeDigits(doorInput.value.trim());
    if (value === DOOR_CODE) {
      state.doorUnlocked = true;
      closeDoor();
      doorStatus.textContent = "OPEN";
      showClear();
      log("暗号が解けた。ドアが開いた！");
      if (room) {
        room.classList.add("is-bright");
      }
      document.body.classList.add("is-escape");
    } else {
      log("暗号が違う。");
      shakeModal(doorModal);
      doorInput.select();
    }
  });

  doorCancel.addEventListener("click", () => {
    closeDoor();
    log("ドアを閉じた。");
  });

  doorModal.addEventListener("click", (event) => {
    if (event.target === doorModal) {
      closeDoor();
      log("ドアを閉じた。");
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

  if (seatClose) {
    seatClose.addEventListener("click", () => {
      closeSeatModal();
    });
  }

  if (seatUseTicket) {
    seatUseTicket.addEventListener("click", () => {
      if (!state.hasTicket || state.seatFilled) {
        return;
      }
      state.seatFilled = true;
      updateSeatMirrorUI();
      log("整理券を当てると欠けた図形が埋まった。");
      addHint("seat-fill", "欠けた図形は整理券で埋める。");
    });
  }

  if (seatUseMirror) {
    seatUseMirror.addEventListener("click", () => {
      if (!state.hasMirror || state.seatMirrored) {
        return;
      }
      state.seatMirrored = true;
      updateSeatMirrorUI();
      log("反射カードを使うと、図形が左右反転して見えた。");
      addHint("mirror-use", "反射カードで図形を左右反転して確認する。");
    });
  }

  if (seatModal) {
    seatModal.addEventListener("click", (event) => {
      if (event.target === seatModal) {
        closeSeatModal();
      }
    });
  }

  inventoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (!item.classList.contains("is-visible")) {
        return;
      }
      openItemModal(item.dataset.item);
    });
  });

  restartButton.addEventListener("click", () => {
    resetGame();
  });

  if (difficultySelect) {
    difficultySelect.addEventListener("change", () => {
      resetGame();
    });
  }

  resetGame();
})();

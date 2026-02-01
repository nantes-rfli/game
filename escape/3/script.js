(() => {
  const roomMessage = document.getElementById("room-message");
  const inventoryItems = document.getElementById("inventory-items");
  const inventoryEmpty = document.getElementById("inventory-empty");
  const bookmarkItem = inventoryItems.querySelector('[data-item="bookmark"]');

  const shelfModal = document.getElementById("shelf-modal");
  const shelfGrid = document.getElementById("shelf-grid");
  const shelfNote = document.getElementById("shelf-note");
  const cardModal = document.getElementById("card-modal");
  const cardOrder = document.getElementById("card-order");
  const deskModal = document.getElementById("desk-modal");
  const deskForm = document.getElementById("desk-form");
  const deskInput = document.getElementById("desk-input");
  const deskError = document.getElementById("desk-error");
  const pageModal = document.getElementById("page-modal");
  const pageGrid = document.getElementById("page-grid");
  const pageVisual = document.getElementById("page-visual");
  const pageItemBookmark = document.getElementById("page-item-bookmark");
  const pageItemsNote = document.getElementById("page-items-note");
  const pageResult = document.getElementById("page-result");
  const doorModal = document.getElementById("door-modal");
  const doorForm = document.getElementById("door-form");
  const doorInput = document.getElementById("door-input");
  const doorError = document.getElementById("door-error");
  const clearModal = document.getElementById("clear-modal");
  const restartButton = document.getElementById("restart");
  const doorStatus = document.getElementById("door-status");
  const itemModal = document.getElementById("item-modal");
  const itemCard = document.getElementById("item-card");
  const itemTitle = document.getElementById("item-title");
  const itemImage = document.getElementById("item-image");
  const itemDesc = document.getElementById("item-desc");
  const languageSelect = document.getElementById("language-select");

  const walls = Array.from(document.querySelectorAll(".wall"));
  const navButtons = document.querySelectorAll("[data-dir]");
  const compass = document.getElementById("compass");

  const directions = ["N", "E", "S", "W"];
  const symbolData = [
    { id: "triangle", mark: "▲", name: "三角" },
    { id: "circle", mark: "●", name: "円" },
    { id: "square", mark: "■", name: "四角" },
  ];
  const shelfPoints = [
    { x: 6.122, y: 65.492 },
    { x: 15.057, y: 65.901 },
    { x: 24.087, y: 65.083 },
    { x: 32.452, y: 65.492 },
    { x: 40.057, y: 65.696 },
    { x: 47.852, y: 64.879 },
    { x: 56.407, y: 64.471 },
    { x: 65.247, y: 64.062 },
    { x: 72.567, y: 64.471 },
    { x: 79.03, y: 63.654 },
    { x: 85.779, y: 62.428 },
    { x: 93.669, y: 63.449 },
  ];
  const config = { hints: true, explicit: false };

  const translations = {
    ja: {
      title: "図書室脱出",
      subtitle: "Library Escape",
      tagline: "静かな書架の間で、手がかりを集めて出口を開く。",
      "language.label": "言語",
      "language.aria": "言語を選択",
      "nav.prev": "◀ 左を見る",
      "nav.next": "右を見る ▶",
      "compass.label": "View",
      "inventory.title": "持ち物",
      "inventory.empty": "持ち物はない",
      "item.bookmark": "しおり",
      "item.bookmark.desc": "薄くて繊細なしおり。よく見ると小さな抜きがある。",
      "shelf.title": "書架の背表紙",
      "shelf.lead": "記号のついた本が並んでいる。",
      "shelf.note.normal": "数を数えて記録しておこう。",
      "shelf.note.explicit": "記号の数を数えておこう。カードの順番で暗号になる。",
      "card.title": "机上カード",
      "card.lead": "記号の順番が書かれている。",
      "desk.title": "司書机の引き出し",
      "desk.lead": "3桁の暗号を入力してください。",
      "page.title": "読書テーブルのページ",
      "page.lead": "ページには数字の並びが書かれている。",
      "page.note": "薄い紙片を重ねると、何か見えそうだ。",
      "page.items.label": "持ち物を試す",
      "page.items.empty": "今は試せるものがない。",
      "door.title": "出口のドア",
      "door.lead": "3桁の暗号を入力してください。",
      "item.title": "アイテム",
      "clear.title": "脱出成功",
      "clear.lead": "ドアが静かに開く。外の光が差し込んだ。",
      "clear.epilogue": "司書の声：「またいつでも、どうぞ。」",
      "button.close": "閉じる",
      "button.open": "開ける",
      "button.restart": "もう一度",
      "door.status.locked": "施錠中",
      "door.status.open": "解錠",
      "page.result.normal": "浮かび上がった数字: {code}",
      "page.result.explicit": "浮かび上がった数字は「{code}」。これがドアの暗号だ。",
      "error.codeLength": "3桁の数字を入力してください。",
      "error.deskWrong": "暗号が違うようだ。",
      "error.deskSuccess": "開いた。しおりを入手した。",
      "error.doorWrong": "鍵が開かない。",
      "log.shelf": "書架の背表紙を確認した。",
      "log.card": "机上カードで記号の順番を確認した。",
      "log.desk": "引き出しの暗号に挑戦した。",
      "log.page": "ページの数字を見つけた。",
      "log.door": "出口のドアを調べた。",
      "log.bookmarkGet": "引き出しが開き、しおりを手に入れた。",
      "log.doorUnlocked": "ドアの鍵が外れた。",
      "log.bookmarkUse": "しおりを重ねて数字を確認した。",
      "ambient.north.1": "背表紙の色が落ち着く。",
      "ambient.north.2": "紙の匂いが静かに漂う。",
      "ambient.east.1": "机の木目が柔らかい。",
      "ambient.east.2": "カウンターの上は整っている。",
      "ambient.south.1": "椅子の背もたれが静かに並ぶ。",
      "ambient.south.2": "空調の風がかすかに当たる。",
      "ambient.west.1": "出口は静かに閉ざされている。",
      "ambient.west.2": "鍵の金具が冷たそうだ。",
      "spot.clock": "秒針の音が静かに響く。",
      "spot.plant": "葉がやわらかく揺れている。",
      "spot.cardCabinet": "引き出しは固く閉じられている。",
      "spot.phone": "受話器はひんやりしている。",
      "spot.deskLamp": "柔らかな光が机に落ちている。",
      "spot.stackBooks": "積み上げられた本が少し傾いている。",
      "spot.lamp.heat": "ランプの熱がほのかに伝わる。",
      "spot.lamp.flicker": "小さな灯りが揺れている。",
      "spot.lamp.desk": "灯りが机を静かに照らす。",
      "spot.lamp.warm": "温かい光が落ちている。",
      "spot.cabinet.left": "扉は固く閉じられている。",
      "spot.cabinet.right": "鍵がかかっているようだ。",
      "spot.wallLight.left": "壁に小さな光の輪が浮かぶ。",
      "spot.wallLight.right": "淡い光が壁を照らしている。",
      "spot.mat": "足音を吸い込むマットだ。",
      "spot.shelf.left": "本の背表紙が整然と並ぶ。",
      "spot.shelf.right": "静かな書架が壁に寄り添う。",
      "spot.door.closed": "出口は静かに閉ざされている。",
      "aria.page.visual": "格子の入ったページ",
      "aria.code.input": "3桁の暗号",
      "room.aria": "図書室",
      "alt.card": "机上カードのアップ",
      "alt.desk": "引き出しの鍵のアップ",
      "alt.door": "ドアの鍵のアップ",
    },
    en: {
      title: "Library Room Escape",
      subtitle: "Library Escape",
      tagline: "Collect clues among the quiet shelves and open the way out.",
      "language.label": "Language",
      "language.aria": "Select language",
      "nav.prev": "◀ Look Left",
      "nav.next": "Look Right ▶",
      "compass.label": "View",
      "inventory.title": "Inventory",
      "inventory.empty": "No items",
      "item.bookmark": "Bookmark",
      "item.bookmark.desc": "A delicate bookmark. If you look closely, tiny cutouts are visible.",
      "shelf.title": "Shelf Spines",
      "shelf.lead": "Books marked with symbols are lined up.",
      "shelf.note.normal": "Count them and keep a note.",
      "shelf.note.explicit": "Count each symbol. The card order forms the code.",
      "card.title": "Desk Card",
      "card.lead": "The order of symbols is written.",
      "desk.title": "Librarian Desk Drawer",
      "desk.lead": "Enter the 3-digit code.",
      "page.title": "Reading Table Page",
      "page.lead": "A sequence of numbers is written on the page.",
      "page.note": "If you overlay a thin slip, something might appear.",
      "page.items.label": "Try an item",
      "page.items.empty": "Nothing to try right now.",
      "door.title": "Exit Door",
      "door.lead": "Enter the 3-digit code.",
      "item.title": "Item",
      "clear.title": "Escape Success",
      "clear.lead": "The door opens quietly. Light pours in.",
      "clear.epilogue": "Librarian: “Anytime, you're welcome.”",
      "button.close": "Close",
      "button.open": "Open",
      "button.restart": "Play Again",
      "door.status.locked": "LOCKED",
      "door.status.open": "OPEN",
      "page.result.normal": "Revealed numbers: {code}",
      "page.result.explicit": "The numbers revealed are “{code}”. That's the door code.",
      "error.codeLength": "Enter a 3-digit number.",
      "error.deskWrong": "That code doesn't seem right.",
      "error.deskSuccess": "It opened. You got the bookmark.",
      "error.doorWrong": "The lock won't open.",
      "log.shelf": "You checked the shelf spines.",
      "log.card": "You checked the card for the order.",
      "log.desk": "You tried the drawer code.",
      "log.page": "You found the numbers on the page.",
      "log.door": "You checked the exit door.",
      "log.bookmarkGet": "The drawer opened. You got the bookmark.",
      "log.doorUnlocked": "The door unlocked.",
      "log.bookmarkUse": "You overlaid the bookmark and checked the numbers.",
      "ambient.north.1": "The colors of the spines are calming.",
      "ambient.north.2": "The scent of paper drifts softly.",
      "ambient.east.1": "The wood grain feels gentle.",
      "ambient.east.2": "The counter surface is neatly arranged.",
      "ambient.south.1": "Chair backs line up quietly.",
      "ambient.south.2": "A faint breeze from the vents.",
      "ambient.west.1": "The exit remains still and closed.",
      "ambient.west.2": "The metal of the lock looks cold.",
      "spot.clock": "The ticking of the second hand is quiet.",
      "spot.plant": "The leaves sway softly.",
      "spot.cardCabinet": "The drawers are firmly shut.",
      "spot.phone": "The receiver is cool to the touch.",
      "spot.deskLamp": "Soft light falls across the desk.",
      "spot.stackBooks": "The stacked books lean slightly.",
      "spot.lamp.heat": "A trace of warmth comes from the lamp.",
      "spot.lamp.flicker": "A small light flickers.",
      "spot.lamp.desk": "The light gently illuminates the desk.",
      "spot.lamp.warm": "Warm light spills down.",
      "spot.cabinet.left": "The cabinet doors are firmly closed.",
      "spot.cabinet.right": "It seems to be locked.",
      "spot.wallLight.left": "A small ring of light floats on the wall.",
      "spot.wallLight.right": "A pale light brushes the wall.",
      "spot.mat": "A mat that muffles footsteps.",
      "spot.shelf.left": "Spines are neatly aligned.",
      "spot.shelf.right": "A quiet bookcase rests against the wall.",
      "spot.door.closed": "The exit is quietly closed.",
      "aria.page.visual": "Page with a grid",
      "aria.code.input": "3-digit code",
      "room.aria": "Library room",
      "alt.card": "Close-up of the desk card",
      "alt.desk": "Close-up of the drawer lock",
      "alt.door": "Close-up of the door lock",
    },
    zh: {
      title: "图书室逃脱",
      subtitle: "图书室逃脱",
      tagline: "在安静的书架间收集线索，打开出口。",
      "language.label": "语言",
      "language.aria": "选择语言",
      "nav.prev": "◀ 看左边",
      "nav.next": "看右边 ▶",
      "compass.label": "视角",
      "inventory.title": "物品",
      "inventory.empty": "暂无物品",
      "item.bookmark": "书签",
      "item.bookmark.desc": "一枚轻薄的书签。细看能发现小小的镂空。",
      "shelf.title": "书脊",
      "shelf.lead": "带有符号的书排成一列。",
      "shelf.note.normal": "数一数并记下来。",
      "shelf.note.explicit": "数清每种符号。按卡片顺序组成密码。",
      "card.title": "桌上卡片",
      "card.lead": "写着符号的顺序。",
      "desk.title": "司书桌抽屉",
      "desk.lead": "请输入三位密码。",
      "page.title": "阅览桌页面",
      "page.lead": "页面上写着数字的排列。",
      "page.note": "叠上一片薄纸，似乎会显现什么。",
      "page.items.label": "试用物品",
      "page.items.empty": "现在没有可用的物品。",
      "door.title": "出口的门",
      "door.lead": "请输入三位密码。",
      "item.title": "物品",
      "clear.title": "逃脱成功",
      "clear.lead": "门静静地打开，外面的光洒了进来。",
      "clear.epilogue": "司书的声音：「随时欢迎。」",
      "button.close": "关闭",
      "button.open": "打开",
      "button.restart": "再来一次",
      "door.status.locked": "上锁",
      "door.status.open": "开启",
      "page.result.normal": "浮现的数字：{code}",
      "page.result.explicit": "浮现的数字是「{code}」，这就是门的密码。",
      "error.codeLength": "请输入三位数字。",
      "error.deskWrong": "密码不对。",
      "error.deskSuccess": "打开了。得到书签。",
      "error.doorWrong": "锁没有打开。",
      "log.shelf": "你查看了书脊。",
      "log.card": "你确认了卡片上的顺序。",
      "log.desk": "你尝试了抽屉的密码。",
      "log.page": "你发现了页面上的数字。",
      "log.door": "你查看了出口的门。",
      "log.bookmarkGet": "抽屉打开了，得到书签。",
      "log.doorUnlocked": "门锁打开了。",
      "log.bookmarkUse": "你叠上书签确认了数字。",
      "ambient.north.1": "书脊的颜色令人安定。",
      "ambient.north.2": "纸张的气味静静飘散。",
      "ambient.east.1": "木纹触感柔和。",
      "ambient.east.2": "柜台上整理得很整齐。",
      "ambient.south.1": "椅背静静排成一列。",
      "ambient.south.2": "能感觉到微弱的送风。",
      "ambient.west.1": "出口仍然静静关闭。",
      "ambient.west.2": "锁的金属看起来很冷。",
      "spot.clock": "秒针的滴答声很安静。",
      "spot.plant": "叶子轻轻摇动。",
      "spot.cardCabinet": "抽屉紧闭着。",
      "spot.phone": "话筒凉凉的。",
      "spot.deskLamp": "柔和的光落在桌面上。",
      "spot.stackBooks": "堆放的书微微倾斜。",
      "spot.lamp.heat": "灯散发出些许热度。",
      "spot.lamp.flicker": "小小的灯光在摇曳。",
      "spot.lamp.desk": "灯光静静照着桌面。",
      "spot.lamp.warm": "温暖的光洒落下来。",
      "spot.cabinet.left": "柜门紧紧关着。",
      "spot.cabinet.right": "似乎上了锁。",
      "spot.wallLight.left": "墙上浮着一圈小光晕。",
      "spot.wallLight.right": "淡淡的光照在墙上。",
      "spot.mat": "能吸收脚步声的地垫。",
      "spot.shelf.left": "书脊整齐排列。",
      "spot.shelf.right": "安静的书架贴在墙边。",
      "spot.door.closed": "出口静静关闭着。",
      "aria.page.visual": "带格子的页面",
      "aria.code.input": "三位密码",
      "room.aria": "图书室",
      "alt.card": "桌上卡片的近景",
      "alt.desk": "抽屉锁的近景",
      "alt.door": "门锁的近景",
    },
    ko: {
      title: "도서실 탈출",
      subtitle: "도서실 탈출",
      tagline: "조용한 서가 사이에서 단서를 모아 출구를 연다.",
      "language.label": "언어",
      "language.aria": "언어 선택",
      "nav.prev": "◀ 왼쪽 보기",
      "nav.next": "오른쪽 보기 ▶",
      "compass.label": "시점",
      "inventory.title": "소지품",
      "inventory.empty": "소지품이 없다",
      "item.bookmark": "책갈피",
      "item.bookmark.desc": "얇고 섬세한 책갈피. 자세히 보면 작은 구멍이 있다.",
      "shelf.title": "책등",
      "shelf.lead": "기호가 붙은 책들이 줄지어 있다.",
      "shelf.note.normal": "수를 세어 기록해 두자.",
      "shelf.note.explicit": "각 기호의 개수를 세자. 카드 순서가 암호가 된다.",
      "card.title": "탁자 위 카드",
      "card.lead": "기호의 순서가 적혀 있다.",
      "desk.title": "사서 책상 서랍",
      "desk.lead": "3자리 암호를 입력하세요.",
      "page.title": "독서 테이블의 페이지",
      "page.lead": "페이지에 숫자 배열이 적혀 있다.",
      "page.note": "얇은 종이를 겹치면 무언가 보일 것 같다.",
      "page.items.label": "아이템 사용",
      "page.items.empty": "지금은 사용할 물건이 없다.",
      "door.title": "출구 문",
      "door.lead": "3자리 암호를 입력하세요.",
      "item.title": "아이템",
      "clear.title": "탈출 성공",
      "clear.lead": "문이 조용히 열린다. 밖의 빛이 스며든다.",
      "clear.epilogue": "사서의 목소리: \"언제든지, 환영해요.\"",
      "button.close": "닫기",
      "button.open": "열기",
      "button.restart": "다시 하기",
      "door.status.locked": "잠김",
      "door.status.open": "열림",
      "page.result.normal": "떠오른 숫자: {code}",
      "page.result.explicit": "떠오른 숫자는 \"{code}\". 이것이 문 암호다.",
      "error.codeLength": "3자리 숫자를 입력하세요.",
      "error.deskWrong": "암호가 맞지 않은 것 같다.",
      "error.deskSuccess": "열렸다. 책갈피를 얻었다.",
      "error.doorWrong": "문이 열리지 않는다.",
      "log.shelf": "책등을 확인했다.",
      "log.card": "카드에서 순서를 확인했다.",
      "log.desk": "서랍 암호에 도전했다.",
      "log.page": "페이지의 숫자를 찾았다.",
      "log.door": "출구 문을 살폈다.",
      "log.bookmarkGet": "서랍이 열리고 책갈피를 얻었다.",
      "log.doorUnlocked": "문 자물쇠가 풀렸다.",
      "log.bookmarkUse": "책갈피를 겹쳐 숫자를 확인했다.",
      "ambient.north.1": "책등의 색이 차분하다.",
      "ambient.north.2": "종이 냄새가 잔잔히 돈다.",
      "ambient.east.1": "나무 결이 부드럽다.",
      "ambient.east.2": "카운터 위가 잘 정돈되어 있다.",
      "ambient.south.1": "의자 등받이가 조용히 늘어서 있다.",
      "ambient.south.2": "공조 바람이 희미하게 느껴진다.",
      "ambient.west.1": "출구는 조용히 닫혀 있다.",
      "ambient.west.2": "자물쇠 금속이 차가워 보인다.",
      "spot.clock": "초침 소리가 조용히 울린다.",
      "spot.plant": "잎이 부드럽게 흔들린다.",
      "spot.cardCabinet": "서랍이 단단히 닫혀 있다.",
      "spot.phone": "수화기가 차갑다.",
      "spot.deskLamp": "부드러운 빛이 책상에 떨어진다.",
      "spot.stackBooks": "쌓인 책이 조금 기울어 있다.",
      "spot.lamp.heat": "램프의 열기가 은은히 전해진다.",
      "spot.lamp.flicker": "작은 빛이 흔들린다.",
      "spot.lamp.desk": "등불이 책상을 조용히 비춘다.",
      "spot.lamp.warm": "따뜻한 빛이 내려앉는다.",
      "spot.cabinet.left": "캐비닛 문이 단단히 닫혀 있다.",
      "spot.cabinet.right": "잠겨 있는 듯하다.",
      "spot.wallLight.left": "벽에 작은 빛의 고리가 떠 있다.",
      "spot.wallLight.right": "옅은 빛이 벽을 비춘다.",
      "spot.mat": "발소리를 흡수하는 매트다.",
      "spot.shelf.left": "책등이 가지런히 늘어서 있다.",
      "spot.shelf.right": "조용한 책장이 벽에 기대어 있다.",
      "spot.door.closed": "출구는 조용히 닫혀 있다.",
      "aria.page.visual": "격자가 있는 페이지",
      "aria.code.input": "3자리 암호",
      "room.aria": "도서실",
      "alt.card": "탁자 위 카드 확대",
      "alt.desk": "서랍 자물쇠 확대",
      "alt.door": "문 자물쇠 확대",
    },
  };

  const normalizeLanguage = (value) => {
    if (!value) {
      return "ja";
    }
    const lower = value.toLowerCase();
    if (lower.startsWith("ja")) {
      return "ja";
    }
    if (lower.startsWith("en")) {
      return "en";
    }
    if (lower.startsWith("zh")) {
      return "zh";
    }
    if (lower.startsWith("ko")) {
      return "ko";
    }
    return "ja";
  };

  let currentLanguage = normalizeLanguage(localStorage.getItem("escape-lang") || navigator.language);

  const t = (key, vars = {}) => {
    const dict = translations[currentLanguage] || translations.ja;
    let text = dict[key] ?? translations.ja[key] ?? key;
    Object.entries(vars).forEach(([token, value]) => {
      text = text.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
    });
    return text;
  };

  const itemData = {
    bookmark: {
      titleKey: "item.bookmark",
      src: "assets/bookmark.png",
      descKey: "item.bookmark.desc",
    },
  };

  let activeItemKey = null;
  let wallIndex = 0;
  let shelfOrder = [];
  let cardSequence = [];
  let symbolCounts = {};
  let deskCode = "";
  let pageDigits = [];
  let holeIndices = [];
  let doorCode = "";

  const state = {
    hasBookmark: false,
    pageSolved: false,
    doorUnlocked: false,
  };

  const ambientLines = {
    0: ["ambient.north.1", "ambient.north.2"],
    1: ["ambient.east.1", "ambient.east.2"],
    2: ["ambient.south.1", "ambient.south.2"],
    3: ["ambient.west.1", "ambient.west.2"],
  };

  let messageTimer = null;
  const log = (message) => {
    if (!roomMessage) {
      return;
    }
    roomMessage.textContent = message;
    roomMessage.classList.add("is-visible");
    if (messageTimer) {
      window.clearTimeout(messageTimer);
    }
    messageTimer = window.setTimeout(() => {
      roomMessage.classList.remove("is-visible");
    }, 2600);
  };

  const logKey = (key, vars) => log(t(key, vars));

  const addHint = () => {};

  const shuffle = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const normalizeDigits = (value) =>
    value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xff10 + 48));

  const getShelfNoteText = () =>
    config.explicit ? t("shelf.note.explicit") : t("shelf.note.normal");

  const getPageResultText = () =>
    config.explicit ? t("page.result.explicit", { code: doorCode }) : t("page.result.normal", { code: doorCode });

  const updateItemModal = (key) => {
    const data = itemData[key];
    if (!data) {
      return;
    }
    if (itemCard) {
      itemCard.classList.toggle("is-bookmark", key === "bookmark");
    }
    itemTitle.textContent = t(data.titleKey);
    itemImage.src = data.src;
    itemImage.alt = t(data.titleKey);
    itemDesc.textContent = t(data.descKey);
  };

  const applyTranslations = () => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.setAttribute("alt", t(element.dataset.i18nAlt));
    });
    document.title = t("title");
    if (doorStatus) {
      doorStatus.textContent = state.doorUnlocked ? t("door.status.open") : t("door.status.locked");
    }
    if (shelfNote) {
      shelfNote.textContent = getShelfNoteText();
    }
    if (state.pageSolved) {
      pageResult.textContent = getPageResultText();
    }
    if (activeItemKey && itemModal && !itemModal.hidden) {
      updateItemModal(activeItemKey);
    }
  };

  const setLanguage = (value) => {
    currentLanguage = normalizeLanguage(value);
    if (languageSelect) {
      languageSelect.value = currentLanguage;
    }
    document.documentElement.lang = currentLanguage;
    localStorage.setItem("escape-lang", currentLanguage);
    applyTranslations();
  };

  const setupPuzzle = () => {
    const totalSpines = 12;
    const randomWeights = symbolData.map(() => randomInt(1, 5));
    const weightSum = randomWeights.reduce((sum, value) => sum + value, 0);
    const counts = {};
    let allocated = 0;
    symbolData.forEach((symbol, index) => {
      const count = Math.max(1, Math.round((randomWeights[index] / weightSum) * totalSpines));
      counts[symbol.id] = count;
      allocated += count;
    });
    while (allocated > totalSpines) {
      const pick = symbolData[Math.floor(Math.random() * symbolData.length)].id;
      if (counts[pick] > 1) {
        counts[pick] -= 1;
        allocated -= 1;
      }
    }
    while (allocated < totalSpines) {
      const pick = symbolData[Math.floor(Math.random() * symbolData.length)].id;
      counts[pick] += 1;
      allocated += 1;
    }
    symbolCounts = counts;
    shelfOrder = shuffle(symbolData);
    do {
      cardSequence = shuffle(symbolData);
    } while (cardSequence.every((symbol, index) => symbol.id === shelfOrder[index].id));
    deskCode = cardSequence.map((symbol) => symbolCounts[symbol.id]).join("");

    pageDigits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    holeIndices = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3).sort((a, b) => a - b);
    doorCode = holeIndices.map((index) => pageDigits[index]).join("");
  };

  const renderShelf = () => {
    shelfGrid.innerHTML = "";
    const symbols = symbolData.flatMap((symbol) =>
      Array.from({ length: symbolCounts[symbol.id] }, () => symbol)
    );
    const shuffled = shuffle(symbols);
    const baseY = shelfPoints[0]?.y ?? 50;
    const outlineMarks = { triangle: "△", circle: "○", square: "□" };
    shelfPoints.forEach((point, index) => {
      const symbol = shuffled[index];
      if (!symbol) {
        return;
      }
      const cell = document.createElement("div");
      cell.className = `symbol ${symbol.id}`;
      cell.textContent = outlineMarks[symbol.id] || symbol.mark;
      cell.style.left = `${point.x}%`;
      cell.style.top = `${baseY}%`;
      shelfGrid.appendChild(cell);
    });
  };

  const renderCard = () => {
    cardOrder.innerHTML = "";
    cardSequence.forEach((symbol) => {
      const cell = document.createElement("span");
      cell.className = `card-symbol ${symbol.id}`;
      cell.textContent = symbol.mark;
      cardOrder.appendChild(cell);
    });
  };

  const renderPage = () => {
    pageGrid.innerHTML = "";
    pageDigits.forEach((digit, index) => {
      const cell = document.createElement("div");
      cell.className = "page-cell";
      cell.textContent = digit;
      cell.dataset.index = String(index);
      pageGrid.appendChild(cell);
    });
  };

  const resetPageReveal = () => {
    pageResult.textContent = "";
    pageGrid.querySelectorAll(".page-cell").forEach((cell) => {
      cell.classList.remove("is-hole");
    });
    pageVisual.classList.remove("is-revealed");
  };

  const revealPage = () => {
    holeIndices.forEach((index) => {
      const cell = pageGrid.querySelector(`[data-index="${index}"]`);
      if (cell) {
        cell.classList.add("is-hole");
      }
    });
    pageVisual.classList.add("is-revealed");
    pageResult.textContent = getPageResultText();
  };

  const setWall = (index) => {
    wallIndex = (index + walls.length) % walls.length;
    walls.forEach((wall, i) => {
      wall.classList.toggle("is-active", i === wallIndex);
    });
    if (compass) {
      compass.textContent = directions[wallIndex];
    }
  };

  const handleAmbientClick = (index) => {
    const lines = ambientLines[index] || [];
    if (!lines.length) {
      return;
    }
    const line = lines[Math.floor(Math.random() * lines.length)];
    log(t(line));
  };

  const openModal = (modal) => {
    if (!modal) {
      return;
    }
    modal.hidden = false;
  };

  const closeModal = (modal) => {
    if (!modal) {
      return;
    }
    modal.hidden = true;
  };

  const updateInventory = () => {
    if (state.hasBookmark) {
      bookmarkItem.setAttribute("aria-hidden", "false");
      inventoryEmpty.hidden = true;
    } else {
      bookmarkItem.setAttribute("aria-hidden", "true");
      inventoryEmpty.hidden = false;
    }
    if (pageItemBookmark && pageItemsNote) {
      pageItemBookmark.hidden = !state.hasBookmark;
      pageItemsNote.hidden = state.hasBookmark;
    }
  };

  const handleObjectClick = (object) => {
    switch (object) {
      case "shelf":
        openModal(shelfModal);
        logKey("log.shelf");
        shelfNote.textContent = getShelfNoteText();
        break;
      case "card":
        openModal(cardModal);
        logKey("log.card");
        break;
      case "desk":
        openModal(deskModal);
        deskError.textContent = "";
        logKey("log.desk");
        break;
      case "page":
        openModal(pageModal);
        resetPageReveal();
        if (state.pageSolved) {
          revealPage();
        }
        logKey("log.page");
        break;
      case "door":
        openModal(doorModal);
        doorError.textContent = "";
        logKey("log.door");
        break;
      default:
        break;
    }
  };

  const handleDeskSubmit = (event) => {
    event.preventDefault();
    const raw = normalizeDigits(deskInput.value.trim());
    if (raw.length !== 3 || !/^[0-9]{3}$/.test(raw)) {
      deskError.textContent = t("error.codeLength");
      return;
    }
    if (raw !== deskCode) {
      deskError.textContent = t("error.deskWrong");
      return;
    }
    if (!state.hasBookmark) {
      state.hasBookmark = true;
      logKey("log.bookmarkGet");
    }
    deskError.textContent = t("error.deskSuccess");
    updateInventory();
  };

  const handleDoorSubmit = (event) => {
    event.preventDefault();
    const raw = normalizeDigits(doorInput.value.trim());
    if (raw.length !== 3 || !/^[0-9]{3}$/.test(raw)) {
      doorError.textContent = t("error.codeLength");
      return;
    }
    if (raw !== doorCode) {
      doorError.textContent = t("error.doorWrong");
      return;
    }
    if (!state.doorUnlocked) {
      state.doorUnlocked = true;
      doorStatus.textContent = t("door.status.open");
      logKey("log.doorUnlocked");
    }
    closeModal(doorModal);
    openModal(clearModal);
  };

  const handleUseBookmark = () => {
    if (!state.hasBookmark) {
      return;
    }
    state.pageSolved = true;
    revealPage();
    logKey("log.bookmarkUse");
  };

  const handleItemClick = (event) => {
    const button = event.target.closest(".item");
    if (!button || button.getAttribute("aria-hidden") === "true") {
      return;
    }
    const key = button.dataset.item;
    if (!itemData[key]) {
      return;
    }
    activeItemKey = key;
    updateItemModal(key);
    openModal(itemModal);
  };

  const handlePageItemClick = () => {
    if (!state.hasBookmark || pageModal.hidden) {
      return;
    }
    handleUseBookmark();
  };

  const resetGame = () => {
    wallIndex = 0;
    state.hasBookmark = false;
    state.pageSolved = false;
    state.doorUnlocked = false;
    activeItemKey = null;
    deskInput.value = "";
    doorInput.value = "";
    doorStatus.textContent = t("door.status.locked");
    setupPuzzle();
    renderShelf();
    renderCard();
    renderPage();
    updateInventory();
    applyTranslations();
    setWall(0);
  };

  const attachEvents = () => {
    document.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.close;
        const map = {
          shelf: shelfModal,
          card: cardModal,
          desk: deskModal,
          page: pageModal,
          door: doorModal,
          item: itemModal,
        };
        closeModal(map[target]);
      });
    });

    navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const dir = button.dataset.dir;
        setWall(wallIndex + (dir === "next" ? 1 : -1));
      });
    });

    document.querySelectorAll(".hotspot").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const messageKey = button.dataset.messageKey;
        if (messageKey) {
          log(t(messageKey));
          return;
        }
        const message = button.dataset.message;
        if (message) {
          log(message);
          return;
        }
        handleObjectClick(button.dataset.object);
      });
    });

    walls.forEach((wall, index) => {
      wall.addEventListener("click", (event) => {
        if (event.target !== wall) {
          return;
        }
        handleAmbientClick(index);
      });
    });

    deskForm.addEventListener("submit", handleDeskSubmit);
    doorForm.addEventListener("submit", handleDoorSubmit);
    inventoryItems.addEventListener("click", handleItemClick);
    if (pageItemBookmark) {
      pageItemBookmark.addEventListener("click", handlePageItemClick);
    }
    if (languageSelect) {
      languageSelect.addEventListener("change", (event) => {
        setLanguage(event.target.value);
      });
    }
    restartButton.addEventListener("click", () => {
      closeModal(clearModal);
      resetGame();
    });
  };

  setLanguage(currentLanguage);
  setupPuzzle();
  renderShelf();
  renderCard();
  renderPage();
  updateInventory();
  setWall(0);
  attachEvents();
})();

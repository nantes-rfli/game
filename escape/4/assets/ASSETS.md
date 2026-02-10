# 脱出ゲーム #4 素材一覧（生成用プロンプト付き）

この環境では画像生成を直接実行できないため、**必要素材の一覧**と、別AI（画像生成モデル）に渡すための**生成プロンプト**をまとめる。

形式（SVG/PNG）は固定せず、**作りやすさ・見栄え・実装の安定性**で選ぶ。特に生成AIはPNGが安定しやすいので、**小物もPNG採用でOK**（必要なら後から一部だけSVG化）。

---

## 共通仕様（推奨）
### 背景（PNG推奨）
- サイズ: **1536×1024**（前作 `north.png` と同等）
- テイスト: 静か・現実寄り・寒色、ホラーではなく「気持ち悪い」寄り
- 注意: **読める文字・数字は入れない**（謎としてUI側で出すため）
- 構図: 「大物（棚/窓/扉/机）」が判別しやすい（ホットスポット設定が楽）

### 小物（PNG推奨 / SVGも可）
- 生成AIで作るなら **PNG + 透明背景（alpha）** が安定（切り抜きやすい）
- サイズ目安: 512×512（アイテム） / 768×768（拡大表示する紙物） / 256×256（小アイコン）
- SVGが向くもの: 自作UI枠、単純形状アイコン、解像度依存を避けたいパーツ

### アイコン/スタンプ（PNG or SVG）
- サイズ: 128×128（推奨）※UIで縮小表示
- 4種スタンプ（記/録/雨/音）は**形で区別**できるように（文字に依存しない）

---

## 1) 最低限（MVPで必須）

### 背景（4枚）
- `escape/4/assets/record-room.png`（記録室）
- `escape/4/assets/hallway.png`（廊下）
- `escape/4/assets/storage.png`（保管庫）
- `escape/4/assets/washroom.png`（洗面）

### 小物・UI（PNG推奨 / SVGも可）
※背景に“描き込む”方式でもOKだが、拡大調査・差分演出があるものは単体素材があると実装が楽。
- `escape/4/assets/drawers.(png|svg)`（引き出し棚 4×4 の見た目）
- `escape/4/assets/desk.(png|svg)`（机）
- `escape/4/assets/recorder.(png|svg)`（レコーダー）
- `escape/4/assets/clock.(png|svg)`（壁時計）
- `escape/4/assets/window.(png|svg)`（窓）
- `escape/4/assets/panel.(png|svg)`（配電盤の外観）
- `escape/4/assets/lamp.(png|svg)`（電気スタンド）
- `escape/4/assets/door.(png|svg)`（扉）

### 入手アイテム（PNG推奨 / SVGも可）
- `escape/4/assets/item-cloth.(png|svg)`
- `escape/4/assets/item-flashlight.(png|svg)`
- `escape/4/assets/item-mirror.(png|svg)`
- `escape/4/assets/item-red-film.(png|svg)`
- `escape/4/assets/item-tape.(png|svg)`
- `escape/4/assets/item-plug.(png|svg)`

### 紙物（テンプレ＋破片 / PNG推奨）
※紙片は「1テンプレ＋スタンプ＋テキスト（HTML）」で作ると、画像生成が激減して保守が楽。
- `escape/4/assets/paper-record-template.(png|svg)`（記録片テンプレ：罫線＋余白＋スタンプ枠）
- `escape/4/assets/paper-ledger.(png|svg)`（台帳の見た目）
- `escape/4/assets/paper-ledger-scrap-1.(png|svg)`
- `escape/4/assets/paper-ledger-scrap-2.(png|svg)`
- `escape/4/assets/paper-ledger-scrap-3.(png|svg)`
- `escape/4/assets/paper-torn-a.(png|svg)`（破れ紙片A）
- `escape/4/assets/paper-torn-b.(png|svg)`（破れ紙片B）
- `escape/4/assets/paper-fold.(png|svg)`（折り線入りの紙）

### スタンプ（4種）（PNG or SVG）
- `escape/4/assets/stamp-ki.(png|svg)`（記）
- `escape/4/assets/stamp-roku.(png|svg)`（録）
- `escape/4/assets/stamp-ame.(png|svg)`（雨）
- `escape/4/assets/stamp-oto.(png|svg)`（音）

---

## 2) あると良い（演出・分かりやすさ）
※UI枠はCSSで描けるなら素材不要。凝るならPNG/SVGどちらでもOK。
- `escape/4/assets/ui-drawer-modal.(png|svg)`（引き出し拡大枠）
- `escape/4/assets/ui-keypad-6digit.(png|svg)`（扉の6桁入力UI枠）
- `escape/4/assets/ui-panel-modal.(png|svg)`（配電盤拡大枠）
- `escape/4/assets/ui-clock-modal.(png|svg)`（時計合わせ拡大枠）
- `escape/4/assets/ui-hint-speaker.(png|svg)`（館内放送/ヒントのアイコン）
- `escape/4/assets/ui-lamp-on.(png|svg)` / `ui-lamp-off.(png|svg)`（点灯差分）
- `escape/4/assets/fx-fog.png`（窓の曇りレイヤ：拭き取り演出用）

---

## 3) 生成プロンプト（コピペ用）

### 3-0 スタイル指定（全プロンプト冒頭に付ける）
共通スタイル:
- 「日本の古い資料館の室内」「静かな雨の夜」「ホラーではないが不穏」
- フラット寄り、線は太め、色数少なめ、落ち着いたトーン
- 文字・数字・読めるラベルは入れない
- 余白を残し、UIのホットスポットが置ける構図

（参考）アウトライン色: #6f5a43、紙の色: #f1e4cf 付近、木材: #dec9ad〜#ccb79a 付近

---

### 3-1 背景（PNG 1536×1024）

#### `record-room.png`
プロンプト:
「古い資料館の記録室。正面に大きい引き出し棚（4×4の区画が分かる程度）、右に曇った窓、左前に**1つだけ**の木の机（上にレコーダーと電気スタンドを置く余白が分かる）、机の近くの壁に止まった時計、壁の片隅に簡易配電盤、棚の上か手前に**小さな秤**が置かれていることが分かる構図、手前右に扉。夜、雨の気配、室内は薄暗いが視認性は確保。フラット寄りで線は太め、落ち着いた配色。文字や数字、読めるラベル無し。PNG、1536×1024。」

#### `hallway.png`
プロンプト:
「古い資料館の短い廊下。コート掛け、掲示板（中身は抽象図形だけで文字無し）、傘立て。床は何も置かずクリーンにし、後から紙片を重ねられる余白を残す。雨で少し湿った空気。フラット寄り、太線、落ち着いた配色。文字無し。PNG、1536×1024。」

#### `storage.png`
プロンプト:
「資料館の保管庫。棚に標本瓶が並ぶ（5本程度が分かる）、小さな箱、古い紙類。棚や机の上のどこかに**テープの小箱が見える位置**を確保（形は抽象的でOK）。暗いが見やすい。フラット寄り、太線、落ち着いた配色。文字無し。PNG、1536×1024。」

#### `washroom.png`
プロンプト:
「古い洗面室。洗面台、鏡、タオル（布）。水滴や湿気の雰囲気。フラット寄り、太線、落ち着いた配色。文字無し。PNG、1536×1024。」

---

### 3-2 小物（PNG推奨 / SVGも可）
※生成AIは「単体・透明背景PNG」が失敗しやすい場合があるため、そのときは「単色背景で生成→後で切り抜き」でもOK。

#### `drawers.(png|svg)`
プロンプト:
「木製の引き出し棚、4×4で16個の引き出し面が分かる。各引き出しに小さな取っ手、軽い陰影、太いアウトライン。文字無し。背景は透明（可能なら）または単色。PNGまたはSVG。」

#### `desk.(png|svg)`
プロンプト:
「古い木の机（横長）。引き出しが2〜3段見えるシンプルな形。天板は少し色ムラ、金属ハンドルは抽象的。太線、少色、文字無し。PNGまたはSVG、可能なら透明背景。」

#### `recorder.(png|svg)`
プロンプト:
「机上の小さな古いカセット/ICレコーダー。再生ボタンとインジケータは抽象的（記号のみ）。太いアウトライン、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

#### `clock.(png|svg)`
プロンプト:
「壁掛けの丸い時計。針は2本、文字盤の数字は無し（目盛りのみ）。太線、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

#### `window.(png|svg)`
プロンプト:
「古い窓枠。ガラスは曇りの表現は薄く（曇りは別PNGレイヤにしても良い）。太線、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

#### `fx-fog.png`
プロンプト:
「窓ガラスの曇りレイヤー用。単体PNG、透明背景。淡い乳白色の霧が全面に乗っているイメージで、中心や一部が少し薄い。文字や模様なし。サイズ1536x1024（背景と同じ）、アルファ付き。」

#### `panel.(png|svg)`
プロンプト:
「簡易配電盤の外観。差し込み口が4つ程度、色は抽象色ブロックで表現。太線、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

#### `lamp.(png|svg)`
プロンプト:
「電気スタンド（デスクランプ）。オン/オフ差分が作れる形。太線、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

#### `door.(png|svg)`
プロンプト:
「古い木の扉。鍵パネルの位置が分かる程度。太線、少色。文字無し。PNGまたはSVG、可能なら透明背景。」

---

### 3-3 アイテム（PNG推奨 / SVGも可）
#### `item-cloth.(png|svg)`
プロンプト:
「小さな布（ハンカチ/雑巾）。折り目。太線、少色。PNGまたはSVG、可能なら透明背景。」

#### `item-flashlight.(png|svg)`
プロンプト:
「懐中電灯（小型）。太線、少色。PNGまたはSVG、可能なら透明背景。」

#### `item-mirror.(png|svg)`
プロンプト:
「手鏡。太線、少色。PNGまたはSVG、可能なら透明背景。」

#### `item-red-film.(png|svg)`
プロンプト:
「赤いセロファンフィルム（四角い透明板）。太線、少色。PNGまたはSVG、可能なら透明背景。」

#### `item-tape.(png|svg)`
プロンプト:
「透明テープ（小さいテープ台でも可）。太線、少色。PNGまたはSVG、可能なら透明背景。」

#### `item-plug.(png|svg)`
プロンプト:
「古い2ピンプラグ＋短いケーブル。太線、少色。PNGまたはSVG、可能なら透明背景。」

---

### 3-4 紙物（PNG推奨 / SVGも可）
#### `paper-record-template.(png|svg)`
プロンプト:
「古い紙片のテンプレ。角が少し欠け、薄い罫線、右下に丸いスタンプ枠（中身無し）、左上に小さな連番枠（中身無し）。紙色は淡いベージュ。文字無し。PNGまたはSVG。」

#### `paper-ledger.(png|svg)`
プロンプト:
「古い台帳の見た目（開いた状態）。見出しや本文はダミーの線（読めない線）で表現。文字として読めるものは無し。PNGまたはSVG。」

#### `paper-ledger-scrap-1/2/3.(png|svg)`
プロンプト:
「古い台帳の破片。3種類、形が違う。本文はダミー線で表現（読めない）。文字無し。PNGまたはSVG。」

#### `paper-torn-a.(png|svg)` / `paper-torn-b.(png|svg)`
プロンプト:
「破れた紙片。AとBで破れ目が噛み合う形。本文はダミー線（読めない）。文字無し。PNGまたはSVG。」

#### `paper-fold.(png|svg)`
プロンプト:
「折り線が強調された紙。折り線は線として見えるが、読める文字無し。PNGまたはSVG。」

---

### 3-5 スタンプ（PNG or SVG 4種）
方針:
- **文字は入れず**、形で区別（例：四角/二重丸/波形/二本線など）
- 後でゲーム側で「記/録/雨/音」のラベルを付けても良い

#### `stamp-ki.(png|svg)`
プロンプト:
「古いゴム印風のスタンプアイコン。四角形ベース、中央に抽象的な“記”っぽい形（文字ではない記号）。インクのかすれ少し。PNGまたはSVG、可能なら透明背景。」

#### `stamp-roku.(png|svg)`
プロンプト:
「古いゴム印風のスタンプアイコン。丸ベース、中央に抽象的な“録”っぽい形（文字ではない記号）。インクのかすれ少し。PNGまたはSVG、可能なら透明背景。」

#### `stamp-ame.(png|svg)`
プロンプト:
「古いゴム印風のスタンプアイコン。雫/波形ベース、中央に抽象的な雨の記号。PNGまたはSVG、可能なら透明背景。」

#### `stamp-oto.(png|svg)`
プロンプト:
「古いゴム印風のスタンプアイコン。音波/同心円ベース、中央に抽象的な音の記号。PNGまたはSVG、可能なら透明背景。」

---

## 4) 生成を依頼する時の追加指定（失敗しにくいコツ）
- 「**No text / no readable letters / no numbers**」を明記（背景と紙物は特に重要）
- 背景は「オブジェクトの輪郭が見える」「コントラストは弱すぎない」を指定
- SVGが難しいモデルの場合は、まずPNGで生成→後からトレース（Inkscape等）でもOK

---

## 5) 生成後チェック
生成した素材を `escape/4/assets/` に配置した後、存在チェックができる。

- 必須/任意の一覧: `escape/4/assets/manifest.json`
- チェックコマンド: `node escape/4/check-assets.js`

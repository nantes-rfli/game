# 脱出ゲーム #4 音仕様（実装用）

## 方針
- 基本は環境音（雨）で雰囲気を作り、重要フィードバック（通電/部分一致/解錠）は短いSEで明確にする
- 音謎（9）は、聴覚に依存しすぎないように **短/長のテキスト表示**も併設（アクセシビリティ）

---

## 必須音（最小）
### 環境音
- `escape/4/assets/audio/amb-rain-loop.(mp3|wav)`（雨音ループ、10〜30秒、継ぎ目なし推奨）

### 効果音（SE）
- `escape/4/assets/audio/sfx-beep-short.(mp3|wav)`（短）
- `escape/4/assets/audio/sfx-beep-long.(mp3|wav)`（長）
- `escape/4/assets/audio/sfx-power-on.(mp3|wav)`（通電）
- `escape/4/assets/audio/sfx-unlock.(mp3|wav)`（ロック解錠）
- `escape/4/assets/audio/sfx-error.(mp3|wav)`（失敗/不正入力）

---

## 推奨音（あると気持ちいい）
- `escape/4/assets/audio/sfx-drawer-open.(mp3|wav)`
- `escape/4/assets/audio/sfx-paper.(mp3|wav)`（紙を扱う）
- `escape/4/assets/audio/sfx-tape.(mp3|wav)`（貼る）
- `escape/4/assets/audio/sfx-door-partial-1.(mp3|wav)`（部分一致1〜3桁）
- `escape/4/assets/audio/sfx-door-partial-2.(mp3|wav)`（部分一致4〜5桁）
- `escape/4/assets/audio/sfx-clear.(mp3|wav)`（クリア）

---

## 謎9（レコーダー）の具体仕様
### 目的
- 短/長の列を、掲示板（符号表）で **2桁の「20」** にする

### 再生パターン（例）
- 数字は「短/長の4つ並び」で1桁を表す（モールスではない）
- レコーダーの出力（短/長）:
  - `短 長 短 短`（=2）
  - `長 長 長 長`（=0）

### UI側の表示（推奨）
- 再生中に「短/長」ラベルが流れる（または再生後にログへ保存）
- 例: `短 長 短 短 / 長 長 長 長`

---

## 出口ロック（18）の音フィードバック
※音だけで判断させない（同時にランプ/テキストで段階を出す）
- 0桁一致: `sfx-error`
- 1〜3桁一致: `sfx-door-partial-1`（無ければ `sfx-beep-short` を低めに）
- 4〜5桁一致: `sfx-door-partial-2`
- 6桁一致: `sfx-unlock` → 直後に雨音が弱まる演出（BGMミキシングでも可）


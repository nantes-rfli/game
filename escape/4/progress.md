Original prompt: [$develop-web-game](/Users/nanto/.codex/skills/develop-web-game/SKILL.md)で、4作目（escape/4）における次のアクションを実行して。

## Work log
- 2026-02-09: `progress.md`を新規作成。`render_game_to_text` / `advanceTime` 未実装を確認。
- 2026-02-10: `script.js` に `window.render_game_to_text` を追加（scene/hotspots/inventory/flags/drawers/progress/notesをJSON化）。
- 2026-02-10: `script.js` に `window.advanceTime(ms)` を追加し、テスト時の `wait()` を仮想時間キューで進行可能にした。
- 2026-02-10: `WEB_GAME_CLIENT` で baseline/hallway/drawers/door を実行し、`state-0.json`生成と表示確認を実施（エラーなし）。
- 2026-02-10: `playwright_scenario_runner.mjs` を追加（click/wait/fill/advanceTime/capture/assert対応）。
- 2026-02-10: `scenarios/recorder_modal_play.json` を追加し、レコーダー再生で `flags.audioDecoded=true` / `notes.audioDigits="20"` を検証。
- 2026-02-10: `scenarios/drawer08_unlock.json` / `scenarios/door_unlock.json` / `scenarios/clock_final_set.json` を追加して終盤連鎖を自動回帰化。
- 2026-02-10: 追加3シナリオを実行して成功を確認。
  - `scenario-drawer08`: `flags.audioDecoded=true` かつ `drawers[08].opened=true`
  - `scenario-door`: `flags.doorUnlocked=true` かつ `notes.doorCodeProgress=6`
  - `scenario-clock`: `flags.clockFinalSet=true` かつ `modalTitle="脱出成功"`
- 2026-02-10: 追加シナリオ群でコンソールエラーなし（各出力に `errors.json` 未生成）。
- 2026-02-10: CI高速化を反映。`escape4-regression` workflowに `actions/cache` を追加し、`~/.npm` と `~/.cache/ms-playwright` をキャッシュするようにした（`--with-deps`運用は維持）。

- 2026-02-10: 次アクションとして `f` キーのフルスクリーントグルを実装。
  - `index.html` に `#game-root` と `#fullscreen-toggle` を追加。
  - `script.js` で `toggleFullscreen()` を追加し、ボタン操作・`f` キー切替・`Esc` 解除・UI文言切替を実装。
  - `render_game_to_text` に `fullscreen` フラグを追加してテキスト状態でも全画面状態を検証可能にした。
  - `styles.css` に `#game-root:fullscreen` / `#game-root:-webkit-full-screen` スタイルを追加し、全画面時のレイアウト崩れを抑制。
- 2026-02-10: 回帰シナリオを拡張。
  - `scenarios/fullscreen_toggle.json` を新規追加（ボタンON→Esc OFF→f ON→f OFF を検証）。
  - `scenarios/suite.json` に `fullscreen` シナリオを追加。
- 2026-02-10: 検証実行。
  - `WEB_GAME_CLIENT` 実行（`output/web-game/client-fullscreen`）で `state-0/1.json` とスクリーンショットを確認、console/pageerror なし。
  - `playwright_scenario_suite.mjs` を実行し、初回失敗（Escで解除されず）を確認後、keydownでEsc時に `toggleFullscreen()` を呼ぶ修正を追加。
  - 修正後に再実行し `total=5 passed=5 failed=0` を確認。
  - `output/web-game/suite/fullscreen/*.png` と `*.state.json` を目視・内容確認し、表示と `fullscreen` 状態の整合を確認。

## TODO (next)
- （任意）GitHub Actionsの2回目以降実行でキャッシュヒット率と実行時間差（before/after）を記録する。
- 実ブラウザ（headed）でOS実フルスクリーン遷移時の体感（特にMacのSpaces遷移）を1回確認して、必要なら遷移中メッセージを追加する。
- 2026-02-10: UI調整（次アクション）。
  - ホットスポット上の小アイコン表示を本番向けに無効化（`SHOW_HOTSPOT_ICONS=false`）。
  - モーダル画像はホットスポット `icon` を使わず、モーダル種別のフォールバックから解決するよう整理。
  - 画像存在確認をHEADで行い、存在する画像のみ表示する安全化を追加（404の連鎖抑制）。
- 2026-02-10: 秤・ランプ素材対応。
  - 秤の `hotspots.json` 参照を配電盤画像から切り離し（`rr-scale.icon` を削除）。
  - `scale` モーダルは専用素材未配置時は画像を出さない挙動に変更。
  - ランプは `assets/lamp-off.png` / `assets/lamp-on.png` を優先利用する実装に変更。
  - 既存 `assets/lamp.png` が左右2灯構成だったため、暫定対応として左右分割して `lamp-off.png`（左）と `lamp-on.png`（右）を生成。
- 2026-02-10: 回帰確認を拡張。
  - `scenarios/scale_lamp_visual.json` を追加（メイン画面/秤/ランプの視覚確認）。
  - `scenarios/suite.json` に `scale-lamp` シナリオを追加。
  - 最終実行: `output/web-game/suite-next3` で `total=6 passed=6 failed=0`（errors.json なし）。

## TODO (next)
- `assets/scale.png`（秤の単体画像）を用意したら、`script.js` の `getModalImage("scale")` に候補を戻して秤モーダルにも画像を表示する。
- `lamp-on/off` は暫定の左右分割版なので、必要なら個別に描き起こした最終素材へ差し替える。
- 2026-02-10: `assets/scale.png` 配置を反映。
  - `script.js` の `scale` モーダル画像フォールバックを `assets/scale.png` に戻し、秤モーダルで画像表示を確認。
- 2026-02-10: 記録室背景の電源ON/OFF差分対応を追加。
  - `hotspots.json` の `record-room` に `backgroundOn` / `backgroundOff` を追加。
  - `script.js` の `renderStage()` を拡張し、`powerOn` 状態に応じて背景画像を切替（未配置時は `background` へ自動フォールバック）。
  - `setFlag("powerOn")` 時に `renderStage()` を再描画するように変更。
  - `record-room-off.png` 未配置でconsole 404になるため、暫定として `record-room.png` から `record-room-off.png` を複製配置。
- 2026-02-10: 再検証。
  - `WEB_GAME_CLIENT` 実行（`output/web-game/client-scale-bg2`）。
  - `playwright_scenario_suite.mjs` 実行（`output/web-game/suite-bg2`）で `total=6 passed=6 failed=0`、`errors.json` なし。

## TODO (next)
- `record-room-off.png` を最終素材に差し替える（現在は暫定で `record-room.png` の複製）。

- 2026-02-10: `record-room-off.png` をユーザー提供素材へ差し替え済み（実ファイル確認: ON/OFFでhash相違、解像度差あり）。
- 2026-02-10: 再検証を実施。
  - `WEB_GAME_CLIENT` 実行（`output/web-game/client-record-room-off-verify`）。
  - `playwright_scenario_suite.mjs` 実行（`output/web-game/suite-record-room-off-verify`）で `total=6 passed=6 failed=0`、`errors.json` なし。
  - 目視確認: `scale-lamp/main-no-hotspot-icons.png` で背景OFF版が適用され、ホットスポット小アイコン非表示を維持。

## TODO (next)
- 背景ON/OFFの見え方（暗さ・色味・コントラスト）の最終トーンを必要なら微調整する。

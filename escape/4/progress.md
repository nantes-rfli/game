Original prompt: [$develop-web-game](/Users/nanto/.codex/skills/develop-web-game/SKILL.md)で、脱出ゲームを作製してください。

## 2026-02-10
- 初期化: リポジトリが空であることを確認。
- 方針: 単一Canvasの2D脱出ゲームを実装し、`render_game_to_text` と `advanceTime(ms)` を提供する。
- TODO: 基本ゲーム実装、Playwright動作確認、スクリーンショット目視確認、主要操作の網羅テスト。
- 実装: `index.html` と `game.js` を追加。単一Canvas、開始ボタン、鍵・扉・見張りの脱出ループ、`window.render_game_to_text`、`window.advanceTime(ms)`、`f`全画面トグルを実装。
- 次: ローカルサーバー起動後に Playwright クライアントで操作シナリオを実行し、スクリーンショット/テキスト状態/コンソールを確認。
- テスト: `web_game_playwright_client` を `http://localhost:4173` で実行し、`output/web-game/run1` にスクリーンショットと状態JSONを生成。ポート5173競合を回避して4173で固定。
- 修正: Playwrightクライアント対応キーに合わせ、扉操作を `Enter` でも可能に、リセットを `B` でも可能に変更（既存の `E` / `R` は維持）。
- 修正: Playwrightのvirtual-time注入時に通常`requestAnimationFrame`更新を停止し、`advanceTime`のみで進行するよう変更。テスト時の二重更新を解消。
- テスト(成功): `door-no-key` で鍵なし扉操作時に `message: 扉はロック中。鍵が必要` を確認。
- テスト(成功): `win-route` で `keyItem.collected: true` -> `door.unlocked: true` -> `mode: won` を確認。
- テスト(成功): `lose-guard` で見張り接触時に `mode: lost` を確認。
- テスト(成功): `reset-b` で `mode: menu` へ戻ることを確認。
- テスト(成功): Playwright MCPで `f` による全画面ON (`document.fullscreenElement === canvas`) と `Esc` でOFFを確認。
- 修正: `index.html` に `data:,` favicon を追加し、不要な404コンソールエラーを解消。

### TODO for next agent
- モバイル向けに仮想パッド入力を追加する場合は、`render_game_to_text` の `controls` を更新して整合させる。
- 難易度調整を行う場合は、`guard.speed` と壁レイアウトを個別に変更し、既存シナリオ(door/win/lose/reset)を再実行して回帰確認する。
- 要件変更: ユーザー要望に合わせ、アクション型から洋室の探索型脱出ゲームへ全面改修。
- 実装: `game.js` をクリック探索+インベントリ+アイテム使用+金庫テンキー(274)+扉解錠の導線に置換。
- 実装: `render_game_to_text` を探索状態中心のJSONに更新。`advanceTime(ms)` / `f`全画面 / `R,B`リセットは維持。
- 次: Playwrightでクリックシナリオ(鍵入手→引き出し→金庫開錠→扉解錠→脱出)と失敗ケースを検証。
- 修正: CanvasのCSS幅上限を `960px` に変更し、クリック座標のズレを縮小。
- バグ修正: 金庫テンキー最下段が金庫クリック範囲外だったため、safe領域の高さを `h:112` に拡張。
- テスト(成功): `new-door-locked` で鍵無し扉クリック時メッセージを確認。
- テスト(成功): `new-win-route` で植物鍵取得→引き出し解錠→メモ取得→金庫274開錠→部屋鍵使用→扉脱出(`mode: won`)を確認。
- テスト(成功): `new-reset-b` で `mode: menu` へ戻ることを確認。
- テスト(成功): 全シナリオで `errors-0.json` 未生成(新規コンソールエラーなし)。
- 画像生成試行: `imagegen` スキルのCLIで13素材(背景+透過パーツ)を `tmp/imagegen/jobs.jsonl` から一括生成を実行。
- ブロック: OpenAI Images API が `401 invalid_api_key` を返し、全ジョブ失敗。`output/imagegen/raw` は空。
- 残タスク: 有効な `OPENAI_API_KEY` 設定後、同コマンドを再実行して素材を生成し、canvas描画へ差し替え。
- 素材受領: `assets/images` に13ファイルを確認。`safe-open.png .png` を `safe-open.png` へリネーム。
- 実装: `game.js` を画像描画ベースへ改修。背景/扉/机/引き出し/植物/絵/金庫/インベントリアイコンを素材で描画し、未読込時は図形描画へフォールバック。
- 実装: 透明PNGの余白差を吸収するため、各素材の不透明領域を解析して描画時に自動トリミング。
- 実装: `render_game_to_text` に `assets.ready/failed` を追加して素材読込状態を観測可能化。
- テスト(成功): `new-door-locked` / `new-win-route` / `new-reset-b` を再実行し、状態遷移と操作を確認。`errors-0.json` なし。
- ユーザーフィードバック対応: 素材配置と当たり判定のズレを修正。
- 修正: 画像配置を背景に合わせて再キャリブレーション（door/table/drawer/plant/painting/safe の描画座標を調整）。
- 修正: ヒットボックスを描画とは独立管理にして再調整し、操作対象のクリック精度を改善。
- 修正: 金庫テンキーを固定レイアウト+近傍スナップ判定に変更し、押しづらさを軽減。
- 修正: クリック優先順位を `safe` 判定先行へ変更し、ドア手前で金庫入力が阻害される問題を解消。
- テスト(成功): `new-door-locked`, `new-reset-b`, `new-win-route` で回帰確認。`new-win-route` は `mode: won` を再達成。
- 設計変更: 背景+小物の重ね合わせを廃止し、背景は `bg-room-base` 固定、操作対象は `HOTSPOTS` で判定し、金庫/扉は中央の調査モーダルで操作する方式へ移行。
- 実装: `game.js` に `inspect` 状態を追加。`safe` と `door` は現場クリックでモーダル表示し、テンキー/扉操作はモーダル内ボタンで入力するよう変更。
- 実装: 金庫テンキーを画面中央の固定グリッド化し、背景上の金庫位置とは分離。背景画像差異に影響されない入力判定へ変更。
- 実装: `render_game_to_text` を更新し、`inspectUi.panel/close/safeButtons/safeDisplay/safeKeyItem/doorAction` を出力するように変更。
- テスト(成功): 新UIに合わせて `output/web-game/actions/new-door-locked.json` `new-win-route.json` `new-reset-b.json` を更新し、3シナリオ再実行で以下を確認。
- 確認: `new-door-locked` は `mode: playing` + `inspect: door` + メッセージ「扉は固く閉じている。鍵が必要だ」。
- 確認: `new-win-route` は `mode: won` + メッセージ「洋室からの脱出に成功した」。
- 確認: `new-reset-b` は `mode: menu` に復帰。
- 確認: 再実行後の `new-door-locked` で `errors-0.json` は生成されず、新規コンソールエラーなし。

### TODO for next agent
- 追加品質向上: 金庫モーダルのデザイン（フォント、ボタン陰影、SE）を強化して、背景の高品質感に合わせる。
- パズル導線調整: 必要なら「金庫入力はメモ入手後のみ有効」にして探索順を固定化する。
- 追加検証: Playwrightシナリオに `safe wrong code -> clear -> correct code` の失敗復帰ケースを追加する。

## 2026-02-11 (follow-up)
- ユーザー要望対応: 上部タイトル/メッセージの重なり改善、クリック境界デバッグ表示、背景再生成を見据えた差し替え構造を追加。
- 実装: `drawTopInfo` を再設計し、タイトルバーとメッセージバーを丸角パネル化して重なりを緩和。
- 実装: `D` キーでホットスポット境界表示をトグルする `debugHotspots` を追加（テストクライアント向けに `A` でも同トグル）。
- 実装: デバッグ時に `HOTSPOTS`、インベントリスロット、モーダル操作領域、最新ポインタ座標をオーバーレイ表示。
- 実装: 背景差し替えのため `window.__escape_use_bg_variants = true` で `bg-room-locked.png` / `bg-room-open.png` を有効化できる構造を追加。
- 実装: 変種背景はデフォルト無効にし、未配置時に404を出さないように変更（有効時のみロード）。
- テスト(成功): 直列実行 `new-door-locked-v3` / `new-win-route-v3` / `new-reset-b-v3` で `mode` 遷移が正しいことを確認。
- テスト(成功): `new-debug-overlay-v3` で `debugHotspots: true` と境界表示スクリーンショットを確認。
- テスト(成功): v3 実行では `errors-0.json` 未生成（新規コンソールエラーなし）。

### TODO for next agent
- 背景再生成後: `assets/images/bg-room-locked.png` と `assets/images/bg-room-open.png` を配置し、`index.html` で `window.__escape_use_bg_variants = true` を有効化して視覚確認する。
- ホットスポット再調整: 新背景に合わせて `HOTSPOTS` の座標を微調整し、`D` オーバーレイで境界を確定する。
- 追記: `bg-room-open.png` にウォーターマークが混入したため、暫定対応として `window.__escape_use_open_variant = false` を追加し open背景だけ無効化。
- 追記: `window.__escape_use_bg_variants = true` は維持し、locked背景のみ使用してプレイ可能にした。
- 検証(成功): `new-win-route-watermark-safe` で `mode: won` を確認。`backgroundVariants.enabled: true` / `useOpen: false` / `locked: true` を確認。
- 対応完了: ウォーターマークなし `bg-room-open.png` に差し替え後、`index.html` を更新して `window.__escape_use_open_variant = true` に戻した。
- 検証(成功): `new-win-route-open-enabled` で `mode: won`、`backgroundVariants.enabled: true` / `useOpen: true` / `locked: true` / `open: true`、かつ `errors-0.json` なしを確認。
- 追加調整: 新背景に合わせて `HOTSPOTS` を再キャリブレーション。
- 更新値: `door(726,62,196,320)` `plant(0,116,150,284)` `drawer(166,262,112,136)` `painting(158,118,92,68)` `safe(590,232,124,122)` `window(308,92,254,260)` `table(246,360,378,150)`。
- 検証(成功): `hotspot-calib-1` で `D` オーバーレイを確認し、各領域が対象物に沿うことを目視確認。
- 検証(成功): `hotspot-center-check` で領域中心クリックの挙動（絵/植物/引き出し/金庫/扉）を確認。メモ取得・モーダル遷移とも正常。
- 回帰(成功): `new-door-locked-hotspot-tuned` / `new-win-route-hotspot-tuned` / `new-reset-b-hotspot-tuned` で状態遷移正常、`errors-0.json` なし。
- 追加要望対応:
- 金庫モーダル改善: パネルを拡大し、テンキー/表示枠を大型化。開錠後の「部屋鍵を取る」ボタンと鍵アイコンを拡大して見切れを解消。
- 金庫モーダル画像改善: 背景画像の cover 補正を考慮した切り出しに変更し、背景と整合した金庫拡大表示に修正。
- 背景切替ロジック改善: `mode: won` 時だけドア開背景を使用。`safeUnlocked` ではドア開背景を使わない仕様に変更。
- 背景バリアント拡張: `bg-room-safe-open.png` を任意で使えるよう追加（`window.__escape_use_safe_open_variant`）。
- 安全化: 背景バリアントは `fetch` で存在確認後に読込するため、未配置でも404を出さない。
- 検証(成功): `fix2-door-locked-v2` で扉ロックモーダル遷移確認・エラーなし。
- 検証(成功): `fix2-safe-opened-view` で開錠後金庫モーダル（拡大画像と鍵取得ボタン）を確認。
- 検証(成功): `fix2-win-route` で `mode: won` を再達成。
- 追加要望対応(2): 「部屋鍵を取る」見切れ対策として、金庫開錠時に部屋鍵を自動取得する仕様へ変更。
- 追加要望対応(2): 開錠後の文言を「中は空だ」から「部屋鍵は回収済み」へ変更し、モーダル表示を改善。
- 追加要望対応(2): `index.html` を更新し `window.__escape_use_safe_open_variant = true` を有効化。safe-open背景を使用可能化。
- 検証(成功): `fix3-safe-opened-view` で `items` に `room-key` が自動追加されることを確認。
- 検証(成功): `fix3-win-route` で `mode: won` 到達・新規エラーなし。
- 追加要望対応(3): 金庫モーダルの状態メッセージを金庫画像の下に配置（画像への重なりを解消）。
- 追加要望対応(3): ヒント重複を解消。メモは数字 `427`、絵は順序ヒント `2→3→1` に変更し、両方確認しないと金庫確定できない仕様へ変更。
- 仕様: 金庫入力確定(`E`)時、`codeKnown` が false なら「手がかり不足」を表示して開錠不可。
- 検証(成功): `fix4-safe-opened-view` で金庫モーダル下部表示を確認、`room-key` 自動取得を確認。
- 検証(成功): `fix4-win-route-v2` で新ギミック導線（植物→引き出し→絵→金庫→扉）で `mode: won` 到達、エラーなし。
- 最終確認: 要望3点の反映を再検証。
- 確認(成功): 金庫モーダル画像は `drawCanvasSliceFromCoverImage` の contain 描画で横伸びが解消。
- 確認(成功): 開錠後メッセージは画像重ねをやめ、シンプルな下部メッセージバー表示になっている。
- 確認(成功): 「メモ+絵の両方必須」制約は撤廃済み。未ヒント状態でも `274` で開錠可能。
- テスト(成功): `output/web-game/actions/fix6-open-without-hints-center.json` を追加し、`fix6-open-without-hints-center` 実行で `safeUnlocked: true` / `items: room-key` / エラーなしを確認。

## 2026-02-11 (improve follow-up)
- 改善実装: 上部UIを再設計。タイトルバーを横幅いっぱいの高コントラスト表示に変更し、プレイ中は進捗チップ（メモ/順序/部屋鍵）を追加。
- 改善実装: 調査モーダル表示中は上部メッセージバーを簡略化（`調査中: 金庫/扉`）し、重なり時の可読性を改善。
- 改善実装: 金庫UIに入力進捗を追加。`試行回数` と `入力桁` を表示し、誤答/クリア/桁不足の状態を明示。
- 改善実装: 金庫入力状態を `safeAttempts` / `safeLastResult` として状態管理し、`render_game_to_text.puzzle` に出力。
- 改善実装: 金庫キーボード操作で `E` キー（確定）を追加。
- 改善実装: 画像プリロードを `fetch + blob` 経由へ統一し、直接`img.src`読込由来の不安定なリソースエラーを抑制。
- 次: Playwrightで baseline 3シナリオ + 新規「誤コード→クリア→正解」シナリオを実行して画面/状態/エラーを確認する。
- テスト(一部再試行): `improve-v1-*` を短pauseで並列実行した際、`ERR_SOCKET_NOT_CONNECTED/ERR_CONNECTION_RESET` が断続発生。サーバー応答タイミング由来と判断。
- テスト(成功): 長pauseの逐次実行で再検証し、`improve-v1-door-final` / `improve-v1-win-final` / `improve-v1-reset-final` / `improve-v1-safe-retry-longpause` はすべて `errors-0.json` なし。
- テスト(成功): 新規シナリオ `safe-wrong-clear-correct` で「誤入力→Cクリア→正入力」の復帰を確認。最終状態 `safeUnlocked: true` / `safeAttempts: 2` / `safeLastResult: opened`。
- 目視確認(成功): 上部バーの可読性改善、調査中ラベル表示、金庫モーダル内の試行回数表示をスクリーンショットで確認。

### TODO for next agent
- 入力体験の追加改善候補: 金庫テンキー押下時に短いアニメーション/SEを追加して操作フィードバックを強化。
- テスト強化候補: Playwrightクライアントに数字キー(`0-9`)送信対応を追加し、金庫のキーボード入力ルートを自動E2E化する。
- 運用メモ: 一時的なネットワーク系console errorを避けるため、CI実行時は `--pause-ms 1000+` で逐次実行が安定。
- キーボード入力検証(成功): Playwright直接スクリプトで `274 + e` を送信し、`safeUnlocked: true` / `safeAttempts: 1` / `safeLastResult: opened` を確認。
- 追加対応(提案モック): 本番非影響で `layout-mocks/index.html` を新規追加。3案（HUDミニマル / 左サイド情報 / 没入優先）を静的比較できるモックを作成。
- 反映方針: ユーザー要望に合わせ、全案で「タイトルは開始画面のみ大きく表示、プレイ画面では非表示または最小化」を前提化。
- モック更新: `layout-mocks/index.html` に新規「案3B: 没入優先 + 下枠外トレイ」を追加。
- モック更新: 開始画面背景を古い `bg-room-base.png` から `bg-room-locked.png` に統一。
- モック更新: モック内の表記 `Inventory` を `持ち物` に統一。
- 確認(成功): `output/web-game/layout-mocks-preview/shot-1-full.png` で案1/2/3/3Bの全体表示を目視確認。
## 2026-02-11 (implementation: single-canvas tray)
- 実装開始: ユーザー合意の設計に従い、単一Canvas構成のまま下部トレイ一体レイアウトへ改修。
- 実装: Canvas仮想サイズを `960x640` に拡張（scene 540 + tray 100）。`index.html` のcanvas高さも640へ更新。
- 実装: `drawTopInfo` を再設計。開始画面(`menu`)でのみ大型タイトル表示、`playing` は進捗チップと調査ラベルのみ表示。
- 実装: 常設メッセージバーを廃止し、`state.toast` + `TOAST_DURATION` による下部トースト表示へ変更。
- 実装: 下部トレイ描画を追加し、表記を `Inventory` から `持ち物` へ統一。
- 実装: `setMessage` は `message` 更新に加えてプレイ中トーストを起動する仕様へ変更。
- 実装: `render_game_to_text` に `toast` と `layout(scene/tray)` を追加。
- 次: Playwright 4シナリオを長pauseで再実行し、スクリーンショット・状態JSON・console errorsを検証する。
- テスト(成功): 単一Canvas下部トレイ化後に `impl-v1-door` / `impl-v1-win` / `impl-v1-reset` / `impl-v1-safe-retry` を再実行し、4シナリオで状態遷移を確認。`errors-0.json` なし。
- 目視確認(成功): 下部トレイ（持ち物）をCanvas内の下段に表示。プレイ中は上部タイトル非表示、開始画面のみ中央タイトル表示、下部トースト表示を確認。
- 微調整: 開始画面でのタイトル二重表示を解消（上部タイトルバーをmenu時非表示）。
- 微調整: クリア遷移時にトーストをクリアし、`won`画面へ不要文言が残らないよう修正。

### TODO for next agent
- UI調整候補: 画面幅が狭い端末でトレイ高さ100が窮屈な場合、`TRAY_HEIGHT` を可変(84-110)にして最適化。
- 演出候補: 持ち物の追加時にトレイスロットへ軽いハイライトアニメーションを付ける。
- 埋め込み準備候補: `postMessage` で `reset/start/getState` を受ける薄いAPIレイヤーを追加する。
- ユーザー要望対応: トーストのフェード速度を高速化。
- 変更: `TOAST_DURATION` を `2200ms -> 1500ms` に短縮。
- 変更: 透明度カーブを線形から `phase^1.9` に変更し、前半から薄くなるよう調整。
- 検証(成功): `impl-v1-toast-fast` で表示確認。状態JSON/console errorとも問題なし。
- ユーザー要望対応(追加): トーストを「長く表示+短くフェード」へ再調整。
- 変更: `TOAST_DURATION=3400ms`、`TOAST_FADE_MS=520ms` を導入し、終端フェードのみ高速化。
- ユーザー要望対応(追加): 初回表示を「暗転→背景フェードイン」に変更。
- 変更: `INTRO_SCENE_FADE_MS=900ms` と `introSceneAlpha` を追加。背景読込待ち中は黒背景、読込後に暗転オーバーレイを減衰。
- 追加修正: 背景切り出しYスケールを `cover.sh / SCENE_HEIGHT` に修正（座標スケール整合）。
- 検証(成功): `impl-v1-toast-longfade-short` でトースト状態と画面確認、エラーなし。
- 検証(成功): `impl-v1-intro-fade` で 0ms→220ms→640ms→1060ms の暗転フェード遷移を確認。
- 追加実装: 外部操作用API `window.escapeGame` を追加。
- 追加API: `start()`（プレイ開始）, `reset(mode='menu')`（menu/playingへ復帰）, `getState()`（現在状態JSONをオブジェクト返却）。
- 追記: `render_game_to_text.controls.externalApi` に `window.escapeGame.start/reset/getState` を追加。
- 次: PlaywrightでAPI呼び出しを実行し、状態遷移とエラー有無を確認する。
- ユーザー要望対応: 持ち物アイコンが豆粒に見える問題を改善。
- 調整: スロットサイズを `112x44 -> 120x52` に拡大。
- 調整: アイコン優先レイアウトへ変更（ラベルは下帯の小型表示）。
- 根本対応: 透過余白が大きいPNG向けに不透明領域トリミング描画(`drawAssetContainTrimmed`)を追加。
- 実装詳細: `WeakMap` キャッシュ付きで画像ごとの不透明矩形を算出し、持ち物アイコン描画へ適用。
- 検証(成功): `impl-v1-items-trim-win` / `impl-v1-items-trim-safe` でメモ/部屋鍵アイコンの視認性向上を確認。`errors-0.json` なし。
- ユーザー要望対応: 持ち物スロット内の文字ラベルを撤去し、絵のみ表示に変更。
- 追加実装: 各スロット右上に `+` ボタンを追加。クリックで持ち物詳細モーダルを表示。
- 追加実装: 持ち物詳細モーダル（拡大アイコン・持ち物名・説明文）を追加。`×`/外側クリック/`Esc` で閉じる。
- 操作調整: `+` ボタン判定を 18x18 -> 22x22 に拡大してクリックしやすさを改善。
- 状態出力拡張: `itemInspectId` と `inspectUi.itemInspectPanel/itemInspectClose/inventoryDetailButtons` を `render_game_to_text` に追加。
- テスト追加: `output/web-game/actions/item-inspect-open.json`（開く）と `item-inspect-open-close.json`（開閉）を追加。
- 検証(成功): `impl-v2-item-inspect-open` で `itemInspectId: brass-key` を確認しモーダル表示を目視確認。
- 検証(成功): `impl-v2-item-inspect-close` で `itemInspectId: null` を確認し閉じる挙動を確認。
- 回帰(成功): `impl-v2-win-regression-v2` で `mode: won` 到達、`errors-0.json` なし。

- ユーザー要望対応: 直接的な答え表示を抑えるため、開始文・アイテム説明・取得メッセージ・絵ヒント・金庫モーダル文言を曖昧化/削除。
- 変更: 開始画面文言を「気になる場所をクリックして調べる」に変更し、具体的手順ガイドを削除。
- 変更: 真鍮鍵/メモ説明を非直接化（メモは「427と数字が書かれている」へ）。
- 変更: 引き出し取得メッセージから順序ヒント文を削除、絵メッセージを「何かの順番だろうか」に変更。
- 変更: 金庫モーダル下部の直接ヒント文（メモ+絵）を削除。

## 2026-02-11 (copy polish + test hardening)
- 文言統一: 初期メッセージを「気になる場所を調べて脱出しよう」に変更し、用語を `アイテム` から `持ち物` ベースに統一。
- 文言微調整: 選択解除/選択メッセージを自然な語感へ調整（「選択を外した」「選んだ」）。
- 文言微調整: 不一致メッセージを「この持ち物では〜」へ統一（引き出し/扉）。
- テスト強化: `output/web-game/actions/no-hint-win.json` を追加（絵ヒント未確認でクリアルート）。
- テスト強化: `output/web-game/actions/recovery-noisy-win.json` を追加（誤操作・誤入力から復帰してクリア）。
- 検証(成功): `impl-v4-no-hint-win` で `mode: won` / `safeUnlocked: true` を確認、エラー出力なし。
- 検証(成功): `impl-v4-recovery-noisy-win` で `mode: won` を確認、誤入力後の復帰動作を確認、エラー出力なし。
- 回帰(成功): `impl-v4-door-locked-reg`（鍵なし扉）と `impl-v4-item-inspect-reg`（持ち物詳細）を再確認、エラー出力なし。

- 追加要望対応: 持ち物詳細モーダルの説明文を機能説明から雰囲気寄りへ調整（直接的な使い先説明を抑制）。
- 変更: `itemDescription` を更新（真鍮鍵/部屋鍵/メモを抽象表現へ）。
- 変更: `addItem(...useHint)` も同トーンへ統一（将来の表示先でも直接ヒント化しないよう対応）。
- テスト追加: `output/web-game/actions/item-inspect-room-key.json` を追加（部屋鍵詳細モーダル確認用）。
- 検証(成功): `impl-v5-inspect-brass` / `impl-v5-inspect-memo` / `impl-v5-inspect-room-key` で各詳細モーダルの文言を目視確認、エラー出力なし。
- 回帰(成功): `impl-v5-win-regression` で `mode: won` を再確認、エラー出力なし。

- ユーザー要望対応: トースト文言を全体的に自然寄りへ調整（機械的/説明的な言い回しを緩和）。
- ユーザー要望対応: 扉モーダルの主ボタン文言を状態で出し分けに変更（鍵なし: `扉を押す` / 鍵あり: `鍵で開ける` / 解錠後: `外へ出る`）。
- ユーザー要望対応: 下部トレイの「持ち物」ラベルの上はみ出しを修正（`textBaseline=top` + 描画Y調整）。
- 文言微調整: 例 `この持ち物では手応えがない` `入力中: xxx` `テンキーで番号を入力する` などに統一。
- テスト追加: `output/web-game/actions/door-with-key-inspect.json` と `toast-plant.json` を追加。
- 検証(成功): `impl-v6-menu-label` で「持ち物」ラベルのはみ出し解消を確認。
- 検証(成功): `impl-v6-toast-plant` でトースト文言を確認。
- 検証(成功): `impl-v6-door-no-key` / `impl-v6-door-with-key` で扉ボタン文言の出し分けを確認。
- 回帰(成功): `impl-v6-win-regression` で `mode: won` を再確認、エラー出力なし。

- 効果音対応: 生成SEを `assets/sfx` に追加（`ui-click`, `item-pick`, `modal-open`, `modal-close`, `safe-input`, `safe-ok`, `safe-ng`, `door-unlock`, `win`）。
- 生成方法: `tmp/generate_sfx.js` で `.wav` を自動生成し、`ffmpeg(libopus)` で `.ogg` を作成（`.ogg` 優先、`.wav` フォールバック）。
- 実装: `game.js` に SFX ローダー/再生基盤を追加（`SFX_PATHS`, `SFX_VOLUME`, `preloadSounds`, `playSfx`, `unlockAudio`）。
- 実装: 主要操作にSEを割り当て（選択/調査/モーダル開閉/取得/テンキー入力/正解不正解/解錠/クリア）。
- 実装: `render_game_to_text` に `audio.ready/unlocked/failed/loaded` を追加し、自動検証時に音声読込状態を可視化。
- 安全化: `beforeunload` で音声blob URLをrevokeし、メモリリークを回避。
- 検証(成功): `impl-v7-audio-menu` `impl-v7-audio-plant` `impl-v7-audio-iteminspect` `impl-v7-audio-win` を実行。
- 確認(成功): 4ケースすべてで `audio.ready=true` / `audio.failed=[]` / 各SE `loaded=true`。プレイ開始後は `audio.unlocked=true`。
- 回帰(成功): `impl-v7-audio-win` で `mode: won` 到達、エラー出力なし。

- ユーザー要望対応: SE音量をゲーム内設定で調整できる機能を追加。
- UI追加: 右上に `音量` ボタンを追加。クリックで設定パネル（`サウンド設定`）を開閉。
- 設定内容: `-` / `+` ボタン、スライダー、`ミュート` トグルを実装。
- 操作追加(キー): `V`=設定開閉, `+/-`=音量増減, `M`=ミュート切替。
- 永続化: `localStorage` (`escape_sfx_volume`) にマスター音量を保存し、次回起動時に復元。
- 実装: `playSfx` に `masterVolume` を反映。`.ogg`優先・`.wav`フォールバックを維持。
- 実装: `render_game_to_text` を拡張（`audio.masterVolume`, `settingsOpen`, 設定UI矩形、controls.audioSettings）。
- 挙動調整: 設定を開いたまま調査モーダルへ入らないよう、調査/持ち物詳細を開く際は設定を自動クローズ。
- 検証(成功): `impl-v8-audio-settings` で設定UI表示と音量変更（59- ユーザー要望対応: SE音量をゲーム内設定で調整できる機能を追加。
- UI追加: 右上に `音量` ボタンを追加。クリックで設定パネル（`サウンド設定`）を開閉。
- 設定内容: `-` / `+` ボタン、スライダー、`ミュート` トグルを実装。
- 操作追加(キー): `V`=設定開閉, `+/-`=音量増減, `M`=ミュート切替。
- 永続化: `localStorage` (`escape_sfx_volume`) にマスター音量を保存し、次回起動時に復元。
- 実装: `playSfx` に `masterVolume` を反映。`.ogg`優先・`.wav`フォールバックを維持。
- 実装: `render_game_to_text` を拡張（`audio.masterVolume`, `settingsOpen`, 設定UI矩形、controls.audioSettings）。
- 挙動調整: 設定を開いたまま調査モーダルへ入らないよう、調査/持ち物詳細を開く際は設定を自動クローズ。
- 検証(成功): `impl-v8-audio-settings` で設定UI表示と音量変更（59%）を確認。
- 検証(成功): `impl-v8-audio-win-reg` でクリア回帰確認（`mode: won`）。
- 検証(成功): `impl-v8-audio-item-inspect-reg` で持ち物詳細回帰確認。
- 確認: 3シナリオとも `errors-*.json` なし。
- 追加修正: サウンド設定パネルで `SE音量` テキストがUI要素と重なる問題を修正。
- 対応: パネル高さ/各コントロールY座標を再配置し、テキスト描画をスライダー開始Xに合わせて `textBaseline=top` で表示。
- 検証(成功): `impl-v9-audio-settings-layout` でテキストと `-` ボタン/スライダーの重なり解消を確認、エラー出力なし。
- レイアウト微調整: サウンド設定パネルの余白バランスを再設計。
- 修正内容: パネル幅/高さと各コントロール座標を再配置し、右余白を確保しつつ下余白の過剰を削減。
- 修正内容: `SE音量` テキストのY座標を上げ、スライダーと十分な縦間隔を確保（重なり解消）。
- 検証(成功): `impl-v10-audio-settings-layout-balance` で「文字とスライダーの被りなし」「余白バランス改善」を確認、エラー出力なし。
- 仕上げ微調整: サウンド設定パネルのタイポグラフィを調整。
- 変更: タイトル `20px -> 19px`、ラベル `17px -> 16px`、ミュートラベル `14px -> 13px`、`+/-` 記号サイズを微調整。
- 変更: ミュートラベルを横中央配置にして見た目の揃いを改善。
- 検証(成功): `impl-v11-audio-settings-typography` で文字詰まり/重なりなし、視認性改善を確認。エラー出力なし。

## 2026-02-11 (hub wrapper for episode 4)
- ユーザー要望対応: ゲーム本体（`/escape/4/index.html`）は埋め込み向けに維持しつつ、一覧導線付きのラッパーページを追加する方針を採用。
- 実装: `escape/4/play.html` を新規追加。タイトル、説明、`一覧へ戻る` ボタン、`ゲーム単体で開く` ボタン、`iframe` 埋め込みを実装。
- 実装: `escape/index.html` の4作目カードリンク先を `/escape/4/` から `/escape/4/play.html` へ変更。
- 実装: `play.html` で iframe 高さを `load/resize` 時に自動調整する軽量スクリプトを追加。
- 修正: Playwrightで検出した `allowfullscreen`/`allow="fullscreen"` 重複由来の警告を解消（`allowfullscreen` を削除）。
- 検証(成功): 一覧ページから4作目カードをクリックすると `play.html` へ遷移し、iframe 内にゲーム本体が表示されることを確認。
- 検証(成功): `play.html` 上で iframe 内「ゲーム開始」ボタン押下が可能なことを確認。
- 検証(成功): `web_game_playwright_client` で `new-door-locked.json` を1回実行し、ゲーム本体の動作に回帰がないことを確認。
- 確認: `play.html` のコンソールエラー 0 件。

### TODO for next agent
- 必要なら `play.html` のヘッダー文言（タイトル/説明）をブランドトーンに合わせて調整する。
- 必要なら iframe の高さ調整ロジックを固定比率（例: 3:2）へ変更し、表示揺れを抑える。

## 2026-02-11 (remove in-game start button for embed shell)
- ユーザー要望対応: 埋め込みラッパー表示時に枠が二重に見える問題を解消するため、ゲーム本体 `index.html` の `ゲーム開始` ボタンを削除。
- 実装: `escape/4/index.html` から `#start-btn` のCSSと `<button id="start-btn">` を除去。
- 実装: `escape/4/game.js` の `startButton` 依存をnull安全化。
- 追加: `setStartButtonState(hidden, label)` ヘルパーを導入し、ボタン存在時のみ表示更新するよう変更。
- 修正: クリアオーバーレイ文言を `R か ボタンで再プレイ` から `Rで再プレイ` へ変更。
- 修正: `startButton.addEventListener` は要素存在時のみ登録するよう変更。
- 実装: 埋め込みページ `escape/4/play.html` の iframe URL に `?v=embed-shell-1` を付与し、古いiframeキャッシュでボタンが残るケースを回避。
- 検証(成功): `/escape/4/` 単体表示で開始ボタン非表示、キャンバスクリックで `mode: playing` へ遷移することを確認。
- 検証(成功): `/escape/4/play.html` の iframe 内に開始ボタンが出ないことを確認。
- 検証(成功): Playwrightクライアントで `new-door-locked.json` / `new-win-route.json` を再実行し、状態遷移（扉ロック表示/クリア）に回帰がないことを確認。

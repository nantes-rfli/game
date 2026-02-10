(() => {
  const stage = document.getElementById("stage");
  const wallSelect = document.getElementById("wall-select");
  const fitSelect = document.getElementById("fit-select");
  const overlaySelect = document.getElementById("overlay-select");
  const overlay = document.getElementById("overlay");
  const overlayImage = document.getElementById("overlay-image");
  const marker = document.getElementById("marker");
  const markerText = document.getElementById("marker-text");
  const measureSelect = document.getElementById("measure-select");
  const output = document.getElementById("output");
  const clearButton = document.getElementById("clear-list");
  const copyButton = document.getElementById("copy-list");
  const copyStyleButton = document.getElementById("copy-style");
  const fontSelect = document.getElementById("font-select");
  const colorSelect = document.getElementById("color-select");
  const sizeSelect = document.getElementById("size-select");
  const styleOutput = document.getElementById("style-output");
  const resetMarkerButton = document.getElementById("reset-marker");
  const copyMarkerButton = document.getElementById("copy-marker");
  const cropControls = document.getElementById("crop-controls");
  const cropZoom = document.getElementById("crop-zoom");
  const cropZoomValue = document.getElementById("crop-zoom-value");
  const copyCropButton = document.getElementById("copy-crop");
  const cropOutput = document.getElementById("crop-output");
  const gridControls = document.getElementById("grid-controls");
  const toggleGridButton = document.getElementById("toggle-grid");
  const copyGridButton = document.getElementById("copy-grid");
  const gridOutput = document.getElementById("grid-output");

  const state = {
    lines: [],
    markerDragging: false,
    markerOffsetX: 0,
    markerOffsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    selection: null,
    points: [],
    pointDots: [],
    cropMode: false,
    cropDragging: false,
    cropOffsetX: 0,
    cropOffsetY: 0,
    cropX: 80,
    cropY: 78,
    cropSize: 140,
    gridBox: null,
    gridDragging: false,
    gridResizing: false,
    gridStartX: 0,
    gridStartY: 0,
    gridStartW: 0,
    gridStartH: 0,
  };

  const shelfDefaults = {
    x: 78.81,
    y: 41.21,
    size: 648.97,
    aspect: 2.149,
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const formatPercent = (value) => (Math.round(value * 1000) / 10).toFixed(1);

  const setBackground = () => {
    const name = wallSelect.value;
    if (!state.cropMode) {
      stage.style.backgroundImage = `url(assets/${name}.png)`;
    }
  };

  const setFit = () => {
    stage.style.backgroundSize = fitSelect.value;
  };

  function resetMarker() {
    marker.style.left = "50%";
    marker.style.top = "50%";
    marker.style.transform = "translate(-50%, -50%)";
    updateMarkerOutput();
  }

  const setOverlay = () => {
    const value = overlaySelect.value;
    if (value === "card") {
      overlay.style.display = "block";
      overlayImage.src = "assets/card.png";
      overlayImage.alt = "カードの拡大画像";
      stage.style.setProperty("--stage-ratio", "1 / 1");
      cropControls.style.display = "none";
      cropOutput.value = "";
      state.cropMode = false;
      stage.style.backgroundImage = "none";
      if (measureSelect.value === "marker") {
        stage.classList.add("show-marker");
      } else {
        stage.classList.remove("show-marker");
      }
      resetMarker();
    } else {
      overlay.style.display = "none";
      overlayImage.removeAttribute("src");
      overlayImage.alt = "";
      stage.classList.remove("show-marker");
      state.lines = [];
      updateOutput();
      if (value === "page") {
        stage.style.setProperty("--stage-ratio", "3 / 2");
        stage.style.backgroundImage = "url(assets/page-grid.png)";
        stage.style.backgroundRepeat = "no-repeat";
        state.cropMode = true;
        cropControls.style.display = "flex";
        gridControls.style.display = "flex";
        ensureGridBox();
        showGridBox(true);
        stage.classList.remove("show-marker");
        updateCrop();
      } else if (value === "shelf") {
        stage.style.setProperty("--stage-ratio", `${shelfDefaults.aspect} / 1`);
        stage.style.backgroundImage = "url(assets/north.png)";
        stage.style.backgroundRepeat = "no-repeat";
        state.cropMode = true;
        state.cropX = shelfDefaults.x;
        state.cropY = shelfDefaults.y;
        state.cropSize = shelfDefaults.size;
        cropControls.style.display = "flex";
        gridControls.style.display = "none";
        showGridBox(false);
        stage.classList.remove("show-marker");
        updateCrop();
      } else {
        stage.style.setProperty("--stage-ratio", "3 / 2");
        stage.style.backgroundImage = `url(assets/${wallSelect.value}.png)`;
        stage.style.backgroundRepeat = "no-repeat";
        state.cropMode = false;
        cropControls.style.display = "none";
        gridControls.style.display = "none";
        showGridBox(false);
        cropOutput.value = "";
        stage.classList.remove("show-marker");
      }
    }
  };

  const updateMeasureMode = () => {
    if (measureSelect.value === "marker" && overlaySelect.value === "card") {
      stage.classList.add("show-marker");
      resetMarker();
    } else {
      stage.classList.remove("show-marker");
    }
  };

  const updateMarkerStyles = () => {
    markerText.className = "marker-text";
    markerText.classList.add(`font-${fontSelect.value}`);
    markerText.classList.add(`color-${colorSelect.value}`);
    markerText.classList.add(`size-${sizeSelect.value}`);
  };

  const updateOutput = () => {
    output.value = state.lines.join("\n");
  };

  const updatePointOutput = () => {
    output.value = JSON.stringify(state.points, null, 2);
  };

  const updateStyleOutput = () => {
    styleOutput.value = `font:${fontSelect.value}; color:${colorSelect.value}; size:${sizeSelect.value}`;
  };

  const updateCropOutput = () => {
    if (overlaySelect.value === "shelf") {
      cropOutput.value = `--crop-pos-x:${state.cropX.toFixed(2)}%; --crop-pos-y:${state.cropY.toFixed(
        2
      )}%; --crop-scale:${state.cropSize.toFixed(2)}%; --crop-aspect:${shelfDefaults.aspect};`;
      return;
    }
    cropOutput.value = `--page-bg-x:${state.cropX.toFixed(1)}%; --page-bg-y:${state.cropY.toFixed(
      1
    )}%; --page-bg-size:${state.cropSize}%;`;
  };

  const ensureGridBox = () => {
    if (state.gridBox) {
      return;
    }
    const box = document.createElement("div");
    box.className = "grid-box";
    box.style.left = "12%";
    box.style.top = "14%";
    box.style.width = "60%";
    box.style.height = "50%";
    const handle = document.createElement("div");
    handle.className = "grid-handle br";
    box.appendChild(handle);
    stage.appendChild(box);
    state.gridBox = box;
    updateGridOutput();
    box.addEventListener("pointerdown", handleGridDown);
    handle.addEventListener("pointerdown", handleGridResizeDown);
  };

  const showGridBox = (show) => {
    if (!state.gridBox) {
      return;
    }
    state.gridBox.classList.toggle("show", show);
  };

  const updateGridOutput = () => {
    if (!state.gridBox) {
      return;
    }
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) {
      gridOutput.value = "stage not ready";
      return;
    }
    const rect = state.gridBox.getBoundingClientRect();
    const left = clamp(rect.left - stageRect.left, 0, stageRect.width);
    const top = clamp(rect.top - stageRect.top, 0, stageRect.height);
    const width = clamp(rect.width, 0, stageRect.width);
    const height = clamp(rect.height, 0, stageRect.height);
    const x = Number(formatPercent((left / stageRect.width) * 100));
    const y = Number(formatPercent((top / stageRect.height) * 100));
    const w = Number(formatPercent((width / stageRect.width) * 100));
    const h = Number(formatPercent((height / stageRect.height) * 100));
    const total = 10000;
    const right = Math.max(0, total - (x + w)).toFixed(1);
    const bottom = Math.max(0, total - (y + h)).toFixed(1);
    gridOutput.value = `inset:${y}% ${right}% ${bottom}% ${x}%;`;
  };

  const handleGridDown = (event) => {
    if (!state.gridBox || event.target.classList.contains("grid-handle")) {
      return;
    }
    event.stopPropagation();
    state.gridDragging = true;
    const rect = state.gridBox.getBoundingClientRect();
    state.gridStartX = event.clientX - rect.left;
    state.gridStartY = event.clientY - rect.top;
    state.gridBox.setPointerCapture(event.pointerId);
  };

  const handleGridResizeDown = (event) => {
    if (!state.gridBox) {
      return;
    }
    event.stopPropagation();
    state.gridResizing = true;
    const rect = state.gridBox.getBoundingClientRect();
    state.gridStartW = rect.width;
    state.gridStartH = rect.height;
    state.gridStartX = event.clientX;
    state.gridStartY = event.clientY;
    state.gridBox.setPointerCapture(event.pointerId);
  };

  const handleGridMove = (event) => {
    if (!state.gridBox) {
      return;
    }
    const stageRect = stage.getBoundingClientRect();
    const boxRect = state.gridBox.getBoundingClientRect();
    if (state.gridDragging) {
      const nextLeft = clamp(event.clientX - stageRect.left - state.gridStartX, 0, stageRect.width - boxRect.width);
      const nextTop = clamp(event.clientY - stageRect.top - state.gridStartY, 0, stageRect.height - boxRect.height);
      state.gridBox.style.left = `${(nextLeft / stageRect.width) * 100}%`;
      state.gridBox.style.top = `${(nextTop / stageRect.height) * 100}%`;
      updateGridOutput();
    } else if (state.gridResizing) {
      const deltaX = event.clientX - state.gridStartX;
      const deltaY = event.clientY - state.gridStartY;
      const nextWidth = clamp(state.gridStartW + deltaX, 60, stageRect.width - (boxRect.left - stageRect.left));
      const nextHeight = clamp(state.gridStartH + deltaY, 40, stageRect.height - (boxRect.top - stageRect.top));
      state.gridBox.style.width = `${(nextWidth / stageRect.width) * 100}%`;
      state.gridBox.style.height = `${(nextHeight / stageRect.height) * 100}%`;
      updateGridOutput();
    }
  };

  const handleGridUp = (event) => {
    if (!state.gridBox) {
      return;
    }
    if (state.gridDragging || state.gridResizing) {
      state.gridDragging = false;
      state.gridResizing = false;
      state.gridBox.releasePointerCapture(event.pointerId);
      updateGridOutput();
    }
  };

  const updateCrop = () => {
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      cropOutput.value = "stage not ready";
      return;
    }
    stage.style.backgroundPosition = `${state.cropX}% ${state.cropY}%`;
    stage.style.backgroundSize = `${state.cropSize}% auto`;
    cropZoomValue.textContent = `${state.cropSize}%`;
    cropZoom.value = String(state.cropSize);
    updateCropOutput();
  };

  const updateMarkerOutput = () => {
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) {
      output.value = "stage not ready";
      return;
    }
    const rect = markerText.getBoundingClientRect();
    const left = clamp(rect.left - stageRect.left, 0, stageRect.width);
    const top = clamp(rect.top - stageRect.top, 0, stageRect.height);
    const width = clamp(rect.width, 0, stageRect.width);
    const height = clamp(rect.height, 0, stageRect.height);
    const x = formatPercent((left / stageRect.width) * 100);
    const y = formatPercent((top / stageRect.height) * 100);
    const w = formatPercent((width / stageRect.width) * 100);
    const h = formatPercent((height / stageRect.height) * 100);
    const line = `x:${x},y:${y},w:${w},h:${h}`;
    state.lines = [line];
    updateOutput();
  };

  const createSelection = () => {
    const div = document.createElement("div");
    div.className = "selection";
    stage.appendChild(div);
    state.selection = div;
  };

  const handleRectDown = (event) => {
    if (state.cropMode || measureSelect.value !== "rect") {
      return;
    }
    if (event.target.closest(".grid-box") || event.target.closest(".marker")) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    state.isDragging = true;
    state.startX = clamp(event.clientX - rect.left, 0, rect.width);
    state.startY = clamp(event.clientY - rect.top, 0, rect.height);
    if (state.selection) {
      state.selection.remove();
    }
    createSelection();
    state.selection.style.left = `${state.startX}px`;
    state.selection.style.top = `${state.startY}px`;
    state.selection.style.width = "0px";
    state.selection.style.height = "0px";
  };

  const handleRectMove = (event) => {
    if (!state.isDragging || !state.selection) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const currentX = clamp(event.clientX - rect.left, 0, rect.width);
    const currentY = clamp(event.clientY - rect.top, 0, rect.height);
    const left = Math.min(state.startX, currentX);
    const top = Math.min(state.startY, currentY);
    const width = Math.abs(currentX - state.startX);
    const height = Math.abs(currentY - state.startY);
    state.selection.style.left = `${left}px`;
    state.selection.style.top = `${top}px`;
    state.selection.style.width = `${width}px`;
    state.selection.style.height = `${height}px`;
  };

  const handleRectUp = (event) => {
    if (!state.isDragging || !state.selection) {
      return;
    }
    state.isDragging = false;
    const rect = stage.getBoundingClientRect();
    const endX = clamp(event.clientX - rect.left, 0, rect.width);
    const endY = clamp(event.clientY - rect.top, 0, rect.height);
    const left = Math.min(state.startX, endX);
    const top = Math.min(state.startY, endY);
    const width = Math.abs(endX - state.startX);
    const height = Math.abs(endY - state.startY);
    if (width < 4 || height < 4) {
      state.selection.remove();
      state.selection = null;
      return;
    }
    const x = formatPercent((left / rect.width) * 100);
    const y = formatPercent((top / rect.height) * 100);
    const w = formatPercent((width / rect.width) * 100);
    const h = formatPercent((height / rect.height) * 100);
    const line = `x:${x},y:${y},w:${w},h:${h}`;
    state.lines.push(line);
    updateOutput();
  };

  const clearPoints = () => {
    state.points = [];
    state.pointDots.forEach((dot) => dot.remove());
    state.pointDots = [];
    updatePointOutput();
  };

  const handlePointClick = (event) => {
    if (measureSelect.value !== "point") {
      return;
    }
    if (state.cropMode && overlaySelect.value !== "shelf") {
      return;
    }
    if (event.target.closest(".grid-box") || event.target.closest(".marker")) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = Number(formatPercent(((event.clientX - rect.left) / rect.width) * 100));
    const y = Number(formatPercent(((event.clientY - rect.top) / rect.height) * 100));
    state.points.push({ x, y });
    const dot = document.createElement("div");
    dot.className = "point-dot";
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    stage.appendChild(dot);
    state.pointDots.push(dot);
    updatePointOutput();
  };

  const handleMarkerDown = (event) => {
    const rect = marker.getBoundingClientRect();
    state.markerDragging = true;
    state.markerOffsetX = event.clientX - rect.left;
    state.markerOffsetY = event.clientY - rect.top;
    marker.setPointerCapture(event.pointerId);
  };

  const handleMarkerMove = (event) => {
    if (!state.markerDragging) {
      return;
    }
    const stageRect = stage.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const width = markerRect.width;
    const height = markerRect.height;
    const nextLeft = clamp(event.clientX - stageRect.left - state.markerOffsetX, 0, stageRect.width - width);
    const nextTop = clamp(event.clientY - stageRect.top - state.markerOffsetY, 0, stageRect.height - height);
    marker.style.left = `${nextLeft}px`;
    marker.style.top = `${nextTop}px`;
    marker.style.transform = "translate(0, 0)";
    updateMarkerOutput();
  };

  const handleMarkerUp = (event) => {
    if (!state.markerDragging) {
      return;
    }
    state.markerDragging = false;
    marker.releasePointerCapture(event.pointerId);
    updateMarkerOutput();
  };

  const handleCropDown = (event) => {
    if (!state.cropMode || measureSelect.value === "point") {
      return;
    }
    if (event.target.closest(".grid-box")) {
      return;
    }
    state.cropDragging = true;
    state.cropOffsetX = event.clientX;
    state.cropOffsetY = event.clientY;
  };

  const handleCropMove = (event) => {
    if (!state.cropDragging || !state.cropMode) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const deltaX = ((event.clientX - state.cropOffsetX) / rect.width) * 100;
    const deltaY = ((event.clientY - state.cropOffsetY) / rect.height) * 100;
    state.cropX = clamp(state.cropX + deltaX, 0, 100);
    state.cropY = clamp(state.cropY + deltaY, 0, 100);
    state.cropOffsetX = event.clientX;
    state.cropOffsetY = event.clientY;
    updateCrop();
  };

  const handleCropUp = () => {
    state.cropDragging = false;
  };

  const handleClear = () => {
    if (measureSelect.value === "point") {
      clearPoints();
      return;
    }
    state.lines = [];
    updateOutput();
  };

  const handleCopy = async () => {
    if (!output.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      copyButton.textContent = "コピー済み";
      setTimeout(() => {
        copyButton.textContent = "コピー";
      }, 1200);
    } catch {
      output.focus();
      output.select();
    }
  };

  const handleCopyStyle = async () => {
    if (!styleOutput.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(styleOutput.value);
      copyStyleButton.textContent = "コピー済み";
      setTimeout(() => {
        copyStyleButton.textContent = "スタイルをコピー";
      }, 1200);
    } catch {
      styleOutput.focus();
      styleOutput.select();
    }
  };

  const handleCopyMarker = async () => {
    if (!output.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      copyMarkerButton.textContent = "コピー済み";
      setTimeout(() => {
        copyMarkerButton.textContent = "サンプル位置をコピー";
      }, 1200);
    } catch {
      output.focus();
      output.select();
    }
  };

  const handleCopyCrop = async () => {
    if (!cropOutput.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(cropOutput.value);
      copyCropButton.textContent = "コピー済み";
      setTimeout(() => {
        copyCropButton.textContent = "トリミングをコピー";
      }, 1200);
    } catch {
      cropOutput.focus();
      cropOutput.select();
    }
  };

  const handleCopyGrid = async () => {
    if (!gridOutput.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(gridOutput.value);
      copyGridButton.textContent = "コピー済み";
      setTimeout(() => {
        copyGridButton.textContent = "グリッド位置をコピー";
      }, 1200);
    } catch {
      gridOutput.focus();
      gridOutput.select();
    }
  };

  marker.addEventListener("pointerdown", handleMarkerDown);
  marker.addEventListener("pointermove", handleMarkerMove);
  marker.addEventListener("pointerup", handleMarkerUp);
  marker.addEventListener("pointerleave", handleMarkerUp);

  stage.addEventListener("pointerdown", handleCropDown);
  stage.addEventListener("pointermove", handleCropMove);
  stage.addEventListener("pointerup", handleCropUp);
  stage.addEventListener("pointerleave", handleCropUp);
  stage.addEventListener("pointerdown", handleRectDown);
  stage.addEventListener("pointermove", handleRectMove);
  stage.addEventListener("pointerup", handleRectUp);
  stage.addEventListener("pointerleave", handleRectUp);
  stage.addEventListener("click", handlePointClick);
  stage.addEventListener("pointermove", handleGridMove);
  stage.addEventListener("pointerup", handleGridUp);
  stage.addEventListener("pointerleave", handleGridUp);

  wallSelect.addEventListener("change", setBackground);
  fitSelect.addEventListener("change", setFit);
  overlaySelect.addEventListener("change", setOverlay);
  measureSelect.addEventListener("change", () => {
    updateMeasureMode();
    clearPoints();
    if (state.selection) {
      state.selection.remove();
      state.selection = null;
    }
  });
  fontSelect.addEventListener("change", () => {
    updateMarkerStyles();
    updateStyleOutput();
    updateMarkerOutput();
  });
  colorSelect.addEventListener("change", () => {
    updateMarkerStyles();
    updateStyleOutput();
    updateMarkerOutput();
  });
  sizeSelect.addEventListener("change", () => {
    updateMarkerStyles();
    updateStyleOutput();
    updateMarkerOutput();
  });
  clearButton.addEventListener("click", handleClear);
  copyButton.addEventListener("click", handleCopy);
  copyStyleButton.addEventListener("click", handleCopyStyle);
  resetMarkerButton.addEventListener("click", resetMarker);
  copyMarkerButton.addEventListener("click", handleCopyMarker);
  copyCropButton.addEventListener("click", handleCopyCrop);
  copyGridButton.addEventListener("click", handleCopyGrid);
  toggleGridButton.addEventListener("click", () => {
    if (!state.gridBox) {
      return;
    }
    state.gridBox.classList.toggle("show");
  });
  cropZoom.addEventListener("input", () => {
    state.cropSize = Number(cropZoom.value);
    updateCrop();
  });

  window.addEventListener("resize", () => {
    updateMarkerOutput();
    updateGridOutput();
    if (state.cropMode) {
      updateCrop();
    }
  });

  setBackground();
  setFit();
  setOverlay();
  updateMeasureMode();
  updateMarkerStyles();
  updateStyleOutput();
  resetMarker();
})();

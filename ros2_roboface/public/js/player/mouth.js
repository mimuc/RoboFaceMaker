
const DEFAULT_PARAMS = {
  X_OFFSET: 500,
  Y_OFFSET: 525,
  TONGUE_X_OFFSET: 500,
  TONGUE_Y_OFFSET: 575,
};

/**
 * Updates visibility of mouth and tongue elements in the UI.
 *
 * @param {{ [_: string]: SVGElement }} elements - The SVG elements
 * @param {any} state - The state parameters for the mouth and tongue
 */
function updateMouthVisibility(elements, state) {
  // Update visibility for mouth
  const mouthVisible = state.Enabled;
  elements.mouthStroke.style.display = mouthVisible ? "block" : "none";
  elements.mouthFill.style.display = mouthVisible ? "block" : "none";

  // Update visibility for tongue
  const tongue = state.Tongue;
  const tongueVisible = mouthVisible && tongue.Enabled;
  elements.tonguePath.style.display = tongueVisible ? "block" : "none";
}

// Mouth:

/**
 * Updates the SVG path for the mouth based on curvature and roundness parameters.
 */
function updateMouthPath(elements, state) {
  const {
    Curvature1: curvature1,
    Curvature2: curvature2,
    Curvature3: curvature3,
    Curvature4: curvature4,
    Roundness1: roundness1,
    Roundness2: roundness2,
    Roundness3: roundness3,
    Roundness4: roundness4,
    GlobalCurvature: globalCurvature,
  } = state;

  const newPath = `
    M -75 -75
    C ${-25 + roundness1 * 2} ${-75 - (curvature1 + globalCurvature) * 2},
      ${25 - roundness1 * 2} ${-75 - (curvature1 + globalCurvature) * 2}, 75 -75
    C ${75 + (curvature2 + globalCurvature) * 2} ${-25 + roundness2 * 2},
      ${75 + (curvature2 + globalCurvature) * 2} ${25 - roundness2 * 2}, 75 75
    C ${25 - roundness3 * 2} ${75 + (curvature3 + globalCurvature) * 2},
      ${-25 + roundness3 * 2} ${75 + (curvature3 + globalCurvature) * 2}, -75 75
    C ${-75 - (curvature4 + globalCurvature) * 2} ${25 - roundness4 * 2},
      ${-75 - (curvature4 + globalCurvature) * 2} ${-25 + roundness4 * 2}, -75 -75 Z
  `;

  elements.mouthStroke.setAttribute("d", newPath);
  elements.mouthFill.setAttribute("d", newPath);
}


/**
 * Applies transformation (position, scale, rotation) to the mouth element.
 */
function updateMouthTransform (elements, state) {
  const translateX = state.TranslateX;
  const translateY = state.TranslateY;
  const scaleX = state.ScaleX;
  const scaleY = state.ScaleY;
  const rotation = state.Rotation;

  const { cx, cy } = getMouthCenter(elements);
  const mouthOffsetX = DEFAULT_PARAMS.X_OFFSET + (1 - scaleX) * cx;
  const mouthOffsetY = DEFAULT_PARAMS.Y_OFFSET + (1 - scaleY) * cy;

  const transform = `
    translate(${translateX + mouthOffsetX}, ${translateY + mouthOffsetY})
    rotate(${rotation}, 0, 0)
    scale(${scaleX}, ${scaleY})
  `;

  elements.mouthStroke.setAttribute('transform', transform);
  elements.mouthFill.setAttribute('transform', transform);
}


/**
 * Updates the stroke width of the mouth path.
 */
function updateMouthStrokeWidth(elements, state) {
  const strokeWidth = state.StrokeWidth;
  elements.mouthStroke.setAttribute('stroke-width', strokeWidth);
  elements.mouthFill.setAttribute('stroke-width', strokeWidth);
}


/**
 * Updates the fill and stroke color attributes of the mouth and tongue.
 */
function updateMouthColor(elements, state) {
  const tongue = state.Tongue;
  elements.mouthStroke.setAttribute('stroke', state["ColorStroke"]);
  elements.mouthFill.setAttribute('fill', state["ColorFill"]);
  elements.mouthTongueClipColor.setAttribute('fill', tongue["ColorFill"]);
}


// Tongue:

/**
 * Updates the tongue SVG path based on current curvature and roundness values.
 *
 * @param {{tonguePath: SVGPathElement}} elements - The SVG elements related to the tongue.
 * @param {any} state - The state parameters for the tongue.
 */
function updateTonguePath(elements, state) {
  const {
    Curvature1: curvature1,
    Curvature2: curvature2,
    Curvature3: curvature3,
    Curvature4: curvature4,
    Roundness1: roundness1,
    Roundness2: roundness2,
    Roundness3: roundness3,
    Roundness4: roundness4,
  } = state;

  const newPath = `
      M -50 -30
      C ${-25 + roundness1 * 2} ${-30 - curvature1 * 2}, ${25 - roundness1 * 2} ${-30 - curvature1 * 2}, 50 -30
      C ${50 + curvature2 * 2} ${-15 + roundness2 * 2}, ${50 + curvature2 * 2} ${15 - roundness2 * 2}, 50 30
      C ${25 - roundness3 * 2} ${30 + curvature3 * 2}, ${-25 + roundness3 * 2} ${30 + curvature3 * 2}, -50 30
      C ${-50 - curvature4 * 2} ${15 - roundness4 * 2}, ${-50 - curvature4 * 2} ${-15 + roundness4 * 2}, -50 -30
      Z`;
  elements.tonguePath.setAttribute("d", newPath);
}


/**
 * Applies transformations to the tongue path.
 *
 * @param {{tonguePath: SVGPathElement}} elements
 * @param {any} state
 */
function updateTongueTransform(elements, state) {
  updateTonguePath(elements, state);

  const translateX = state.TranslateX;
  const translateY = state.TranslateY;
  const scaleX = state.ScaleX + state.ScaleX * 0.2;
  const scaleY = state.ScaleY + state.ScaleY * 0.2;
  const rotation = state.Rotation;

  const { cx, cy } = getTongueCenter(elements);

  const tongueOffsetX = DEFAULT_PARAMS.TONGUE_X_OFFSET + (1 - scaleX) * cx;
  const tongueOffsetY = DEFAULT_PARAMS.TONGUE_Y_OFFSET + (1 - scaleY) * cy;

  const transform = `
    translate(${translateX + tongueOffsetX}, ${translateY + tongueOffsetY})
    rotate(${rotation}, ${cx}, ${cy})
    scale(${scaleX}, ${scaleY})
  `;

  elements.tonguePath.setAttribute('transform', transform);
}


/**
 * Computes the center point of the mouth stroke path.
 *
 * @param {{mouthStroke: SVGPathElement}} elements
 * @returns {{centerX: number, centerY: number}}
 */
function getMouthCenter(elements) {
  const path = elements.mouthStroke;
  const bbox = path.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return { cx, cy };
}


/**
 * Computes the center point of the tongue path.
 *
 * @param {{tonguePath: SVGPathElement}} elements
 * @returns {{centerX: number, centerY: number}}
 */
function getTongueCenter(elements) {
  const path = elements.tonguePath;
  const bbox = path.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return { cx, cy };
}


export function updateMouth(state, doc = document) {
  const elements = {
    mouthLine: doc.getElementById('MouthLine'),
    mouthFill: doc.getElementById('MouthFill'),
    mouthTongueClipContainerPath: doc.getElementById('MouthTongueClipContainerPath'),
    tonguePath: doc.getElementById('TonguePath'),
    mouthStroke: doc.getElementById('MouthStroke'),
    mouthTongueClipColor: doc.getElementById('MouthTongueClipColor'),
    mouthSmileFill: doc.getElementById('MouthSmileFill'),
    mouthSmileStroke: doc.getElementById('MouthSmileStroke'),
    mouthTongueSmileClipColor: doc.getElementById('MouthTongueSmileClipColor'),
  };

  updateMouthVisibility(elements, state.Mouth);
  updateMouthPath(elements, state.Mouth);
  updateMouthTransform(elements, state.Mouth);
  updateMouthStrokeWidth(elements, state.Mouth);
  updateMouthColor(elements, state.Mouth);
  updateTonguePath(elements, state.Mouth.Tongue);
  updateTongueTransform(elements, state.Mouth.Tongue);
}

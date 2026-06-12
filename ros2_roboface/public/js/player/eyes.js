const DEFAULT_PARAMS = {
  LEFT: { X_OFFSET: 250, Y_OFFSET: 270, X_OFFSET_FACTOR: 1 },
  RIGHT: { X_OFFSET: 750, Y_OFFSET: 270, X_OFFSET_FACTOR: -1 },
};


/**
 * Updates visibility of eye and iris components.
 */
function updateEyeVisibility(elements, state) {
  if (state.Enabled) {
    elements.eyeStroke.style.display = 'block';
    elements.eyeFill.style.display = 'block';
    elements.irisClip.style.display = 'block';
  } else {
    elements.eyeStroke.style.display = 'none';
    elements.eyeFill.style.display = 'none';
    elements.irisClip.style.display = 'none';
  }

  if (state.Enabled && state.Iris.Enabled) {
    elements.irisPath.style.display = 'block';
    elements.irisClip.style.display = 'block';
  } else {
    elements.irisPath.style.display = 'none';
    elements.irisClip.style.display = 'none';
  }
}


/**
 * Updates the SVG path of the eye using its curvature and roundness parameters.
 */
function updateEyeShape(elements, state) {
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

  const { eyeStroke, eyeFill } = elements;

  // +/- different => for symmetry - find symmetrical curvature/roundness changes
  const newPath = `
    M -75 -75
    C ${-25 + roundness1 * 2} ${-75 - curvature1 * 2}, ${25 - roundness1 * 2} ${-75 - curvature1 * 2}, 75 -75
    C ${75 + curvature2 * 2} ${-25 + roundness2 * 2}, ${75 + curvature2 * 2} ${25 - roundness2 * 2}, 75 75
    C ${25 - roundness3 * 2} ${75 + curvature3 * 2}, ${-25 + roundness3 * 2} ${75 + curvature3 * 2}, -75 75
    C ${-75 - curvature4 * 2} ${25 - roundness4 * 2}, ${-75 - curvature4 * 2} ${-25 + roundness4 * 2}, -75 -75
  `;
  eyeStroke.setAttribute("d", newPath);
  eyeFill.setAttribute("d", newPath);
}


/**
 * Updates the SVG path of the iris using its curvature and roundness parameters.
 * @param {string} eye - The ID of the eye.
 */
function updateIrisShape(elements, state) {
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

  const irisPath = elements.irisPath;
  const newPath = `
    M -50 -50
    C ${-25 + roundness1 * 2} ${-50 - curvature1 * 2}, ${25 - roundness1 * 2} ${-50 - curvature1 * 2}, 50 -50
    C ${50 + curvature2 * 2} ${-25 + roundness2 * 2}, ${50 + curvature2 * 2} ${25 - roundness2 * 2}, 50 50
    C ${25 - roundness3 * 2} ${50 + curvature3 * 2}, ${-25 + roundness3 * 2} ${50 + curvature3 * 2}, -50 50
    C ${-50 - curvature4 * 2} ${25 - roundness4 * 2}, ${-50 - curvature4 * 2} ${-25 + roundness4 * 2}, -50 -50
  `;
  irisPath.setAttribute("d", newPath);
}


/**
 * Updates the stroke width of both eye stroke and fill paths.
 */
function updateEyeStrokeWidth(elements, state) {
  elements.eyeStroke.setAttribute('stroke-width', state.StrokeWidth);
  elements.eyeFill.setAttribute('stroke-width', state.StrokeWidth);
}


/**
 * Applies the color settings from the model to the SVG elements.
 */
function updateEyeColor(elements, state) {
  elements.eyeStroke.setAttribute('stroke', state.ColorStroke);
  elements.eyeFill.setAttribute('stroke', state.ColorStroke);
  elements.irisClipColor.setAttribute('stroke', state.Iris.ColorStroke);
  elements.eyeFill.setAttribute('fill', state.ColorFill);
  elements.irisClip.setAttribute('fill', state.Iris.ColorFill);
  elements.irisPath.setAttribute('fill', state.Iris.ColorFill);
  elements.irisClipColor.setAttribute('fill', state.Iris.ColorFill);
}


/**
 * Returns the center of the SVG path bounding box for the eye stroke.
 */
function getEyeCenter(element) {
  const path = element.eyeStroke;
  const bbox = path.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return { cx, cy };
}


/**
 * Returns the center of the SVG path bounding box for the iris path.
 * @param {string} eye - The ID of the eye.
 * @returns {{centerX: number, centerY: number}}
 */
function getIrisCenter(element) {
  const bbox = element.irisPath.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return { cx, cy };
}


/**
 * Updates transformation (position, rotation, scaling) of the eye and iris.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeTransform(elements, state, defaults) {
  const {
    TranslateX: translateX,
    TranslateY: translateY,
    ScaleX: scaleX,
    ScaleY: scaleY,
    Rotation: rotation,
  } = state;


  const { cx, cy } = getEyeCenter(elements);
  const eyeOffsetX = defaults.X_OFFSET + (1 - scaleX) * cx;
  const eyeOffsetY = defaults.Y_OFFSET + (1 - scaleY) * cy;
  const transform = `
    translate(${defaults.X_OFFSET_FACTOR * translateX + eyeOffsetX}, ${translateY + eyeOffsetY})
    rotate(${rotation}, ${cx}, ${cy})
    scale(${scaleX}, ${scaleY}) `;
  elements.eyeStroke.setAttribute('transform', transform);
  elements.eyeFill.setAttribute('transform', transform);
}


/**
 * Updates the transform for the iris based on its own and the eye's parameters.
 */
function updateIrisTransform(elements, state, defaults) {
  const {
    TranslateX: eyeTranslateX,
    TranslateY: eyeTranslateY,
    ScaleX: eyeScaleX,
    ScaleY: eyeScaleY,
    Iris: {
      TranslateX: irisTranslateX,
      TranslateY: irisTranslateY,
      ScaleX: irisScaleX,
      ScaleY: irisScaleY,
      Rotation: irisRotation,
    }
  } = state;

  // Get offsets for the iris based on its position in the eye
  const translateX = defaults.X_OFFSET_FACTOR * (irisTranslateX + eyeTranslateX);
  const translateY = irisTranslateY + eyeTranslateY;
  const scaleX = irisScaleX * eyeScaleX;
  const scaleY = irisScaleY * eyeScaleY;
  const rotation = irisRotation;

  const { cx: cxIris, cy: cyIris } = getIrisCenter(elements);

  const irisOffsetX = defaults.X_OFFSET + (1 - scaleX) * cxIris;
  const irisOffsetY = defaults.Y_OFFSET + (1 - scaleY) * cyIris;

  const transform = `
    translate(${translateX + irisOffsetX}, ${translateY + irisOffsetY})
    rotate(${rotation}, ${cxIris}, ${cyIris})
    scale(${scaleX}, ${scaleY})
  `;

  elements.irisPath.setAttribute('transform', transform);
}


/**
 * Update the eye based on the state parameters.
 *
 * @param {{ eyeFill: SVGElement, eyeStroke: SVGElement }} elements
 * @param {any} state
 * @param {any} defaults
 */
function updateEye(elements, state, defaults) {
  updateEyeVisibility(elements, state);
  updateEyeShape(elements, state);
  updateEyeStrokeWidth(elements, state);
  updateEyeColor(elements, state);
  updateEyeTransform(elements, state, defaults);
  updateIrisShape(elements, state.Iris);
  updateIrisTransform(elements, state, defaults);
}


/**
 * Update the eye elements based on the state parameters.
 *
 * @param {any} state
 * @param {Document} doc
 */
export function updateEyes(state, doc = document) {
  updateEye({
    eyeFill: doc.getElementById('EyeLeftFill'),
    eyeStroke: doc.getElementById('EyeLeftStroke'),
    irisClip: doc.getElementById('EyeLeftIrisClipContainerPath'),
    irisPath: doc.getElementById('EyeLeftIrisPath'),
    irisClipColor: doc.getElementById('EyeLeftIrisClipColor'),
  }, state.EyeLeft, DEFAULT_PARAMS.LEFT);

  updateEye({
    eyeFill: doc.getElementById('EyeRightFill'),
    eyeStroke: doc.getElementById('EyeRightStroke'),
    irisClip: doc.getElementById('EyeRightIrisClipContainerPath'),
    irisPath: doc.getElementById('EyeRightIrisPath'),
    irisClipColor: doc.getElementById('EyeRightIrisClipColor'),
  }, state.EyeRight, DEFAULT_PARAMS.RIGHT);
}

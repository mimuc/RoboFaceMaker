const DEFAULT_PARAMS = {
  LEFT: { X_OFFSET: 250, Y_OFFSET: 100, key: 'BrowLeft' },
  RIGHT: { X_OFFSET: 750, Y_OFFSET: 100, key: 'BrowRight' },
}

/**
 * Updates the visibility of an eyebrow element based on its "Enabled" property.
 */
function updateEyebrowVisibility(element, state) {
  const visible = state.Enabled;
  element.style.display = visible ? "block" : "none";
}


/**
 * Updates the SVG path of the eyebrow based on curvature, length, and thickness.
 */
function updateEyebrowPath(element, state) {
    const {
      Curvature: curvature,
      Length: length,
      Thickness: thickness,
      ColorStroke: colorStroke,
    } = state;

    const newPath = `
        M ${-length / 2} 0
        Q 0 ${-curvature}, ${length / 2} 0
    `;

    element.setAttribute("d", newPath);
    element.setAttribute("stroke-width", thickness);
    element.setAttribute("stroke", colorStroke);
}


/**
 * Applies transform operations (translate, rotate, scale) to the eyebrow element.
 * Uses the center of the path and default offset values for accurate positioning.
 */
function updateEyebrowTransform(element, state, defaults) {
  const {
    TranslateX: translateX,
    TranslateY: translateY,
    Rotation: rotation,
    ScaleX: scaleX,
    ScaleY: scaleY = 0,
  } = state;

  const { cx, cy } = getBrowCenter(element);

  const browOffsetX = defaults.X_OFFSET + (1 - scaleX) * cx;
  const browOffsetY = defaults.Y_OFFSET + (1 - scaleY) * cy;

  const transform = `
    translate(${translateX + browOffsetX}, ${translateY + browOffsetY})
    rotate(${rotation}, 0, 0)
    scale(${scaleX}, ${scaleY})
  `;

  element.setAttribute("transform", transform);
}


/**
 * Updates the stroke color of the eyebrow path.
 */
function updateEyebrowColor(element, state) {
    const color = state.ColorStroke;
    element.setAttribute("stroke", color);
}


/**
 * Calculates the center point of an SVG eyebrow path.
 */
function getBrowCenter(element) {
    const bbox = element.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return { cx, cy };
}


export function updateBrows (state, doc = document) {
  Object
    .values(DEFAULT_PARAMS)
    .map((params) => [ doc.getElementById(params.key), state[params.key], params ])
    .forEach((args) => {
      updateEyebrowVisibility(...args);
      updateEyebrowPath(...args);
      updateEyebrowTransform(...args);
      updateEyebrowColor(...args);
    });
}
/**
 * Updates the visibility of an eyebrow element based on its "Enabled" property.
 * @param {string} eyebrow - The ID of the eyebrow element (e.g., "BrowLeft", "BrowRight").
 */
function updateEyebrowVisibility(eyebrow) {
    const visible = paramsFace["Frames"][paramsTime["Time"]][eyebrow]["Enabled"];
    document.getElementById(eyebrow).style.display = visible ? "block" : "none";
}

/**
 * Updates the SVG path of the eyebrow based on curvature, length, and thickness.
 * @param {string} eyebrow - The ID of the eyebrow element.
 */
function updateEyebrowPath(eyebrow) {
    const params = paramsFace["Frames"][paramsTime["Time"]][eyebrow];
    const curvature = params["Curvature"];
    const length = params["Length"];
    const thickness = params["Thickness"];

    const newPath = `
        M ${-length / 2} 0 
        Q 0 ${-curvature}, ${length / 2} 0
    `;

    const path = document.getElementById(eyebrow);
    path.setAttribute("d", newPath);
    path.setAttribute("stroke-width", thickness);
    path.setAttribute("stroke", params["ColorStroke"]);
}

/**
 * Applies transform operations (translate, rotate, scale) to the eyebrow element.
 * Uses the center of the path and default offset values for accurate positioning.
 * @param {string} brow - The eyebrow ID.
 */
function updateEyebrowTransform(brow) {
    const params = paramsFace["Frames"][paramsTime["Time"]][brow];
    if (!params) return;

    const translateX = params["TranslateX"];
    const translateY = params["TranslateY"];
    const rotation = params["Rotation"] || 0;
    const scaleX = params["ScaleX"] || 1;
    const scaleY = params["ScaleY"] || 1;

    const { centerX: browCenterX, centerY: browCenterY } = getBrowSVGPathCenter(brow);

    const browOffsetX = paramsDefault[brow]?.StartOffsetX + (1 - scaleX) * browCenterX;
    const browOffsetY = paramsDefault[brow]?.StartOffsetY + (1 - scaleY) * browCenterY;

    const transform = `
        translate(${translateX + browOffsetX}, ${translateY + browOffsetY})
        rotate(${rotation}, 0, 0)
        scale(${scaleX}, ${scaleY})
    `;

    document.getElementById(brow).setAttribute("transform", transform);
}

/**
 * Updates the stroke color of the eyebrow path.
 * @param {string} eyebrow - The ID of the eyebrow element.
 */
function updateEyebrowColor(eyebrow) {
    const color = paramsFace["Frames"][paramsTime["Time"]][eyebrow]["ColorStroke"];
    document.getElementById(eyebrow).setAttribute("stroke", color);
}

/**
 * Calculates the center point of an SVG eyebrow path.
 * @param {string} brow - The ID of the SVG path element.
 * @returns {{ centerX: number, centerY: number }} The center coordinates.
 */
function getBrowSVGPathCenter(brow) {
    const path = document.getElementById(`${brow}`);
    if (!path) {
        console.warn(`getBrowSVGPathCenter: Kein Element gefunden für ${brow}`);
        return { centerX: 0, centerY: 0 };
    }
    const bbox = path.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    return { centerX, centerY };
}

/**
 * Mirrors eyebrow parameters from one side to the other if "Mirror" is enabled.
 * @param {string} eyebrow - The source eyebrow ID to mirror from.
 */
function updateEyebrowMirror(eyebrow) {
    const mirrorCheckbox = document.getElementById(`${eyebrow}_Mirror`);
    paramsFace["Frames"][paramsTime["Time"]][eyebrow]["Mirror"] = mirrorCheckbox.checked;

    const oppositeEyebrow = eyebrow === "BrowLeft" ? "BrowRight" : "BrowLeft";
    
    if (paramsFace["Frames"][paramsTime["Time"]][eyebrow]["Mirror"]) {
        Object.entries(paramsFace["Frames"][paramsTime["Time"]][eyebrow]).forEach(([key, value]) => {
            if (key === "TranslateX") {
                paramsFace["Frames"][paramsTime["Time"]][oppositeEyebrow]["TranslateX"] = -value;
            } else if (key === "Rotation") {
                paramsFace["Frames"][paramsTime["Time"]][oppositeEyebrow]["Rotation"] = -value;
            } else {
                paramsFace["Frames"][paramsTime["Time"]][oppositeEyebrow][key] = value;
            }
        });
        synchronizeEyebrowSliders();
    }
    refreshEyebrows();
}

/**
 * Synchronizes the slider UI values for both eyebrows.
 */
function synchronizeEyebrowSliders() {
    ["TranslateX", "TranslateY", "ScaleX", "ScaleY", "Rotation", "Curvature", "Thickness", "Length"].forEach(param => {
        const leftSlider = document.getElementById(`BrowLeft_${param}`);
        const rightSlider = document.getElementById(`BrowRight_${param}`);
        
        if (leftSlider && rightSlider) {
            rightSlider.value = leftSlider.value;
        }
    });
}

// Event listener to react to changes in eyebrow controls for mirroring
document.querySelectorAll('#sideArea input, #sideArea select').forEach(input => {
    input.addEventListener('input', function () {
        if (paramsFace["Frames"][paramsTime["Time"]]["BrowLeft"]["Mirror"]) {
            updateEyebrowMirror("BrowLeft");
        } else if (this.id.startsWith('BrowRight')) {
            updateEyeMirror("BrowRight");
        }
    });
}); 

/**
 * Refreshes all eyebrow-related properties (visibility, path, transform, color).
 */
function refreshEyebrows() {
    ["BrowLeft", "BrowRight"].forEach(eyebrow => {
        updateEyebrowVisibility(eyebrow);
        updateEyebrowPath(eyebrow);
        updateEyebrowTransform(eyebrow);
        updateEyebrowColor(eyebrow);
    });
}

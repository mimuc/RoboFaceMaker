/*
 * This file handles all visual updates and transformations for the eyes and irises in the face generator.
 * It includes control over visibility, shape, color, transform, symmetry (mirroring), and user-driven updates.
 * Dependencies: paramsFace, paramsTime, paramsDefault, DOM elements for SVG structure
 */

/**
 * Updates visibility of eye and iris components.
 * @param {string} eye - The ID of the eye (e.g., "EyeLeft").
 */
function updateEyeVisibility(eye) {
    if (paramsFace["Frames"][paramsTime["Time"]][eye]["Enabled"]) {
        document.getElementById(`${eye}Stroke`).style.display = 'block';
        document.getElementById(`${eye}Fill`).style.display = 'block';
        document.getElementById(`${eye}_Container`).style.display = 'block';
    } else {
        document.getElementById(`${eye}Stroke`).style.display = 'none';
        document.getElementById(`${eye}Fill`).style.display = 'none';
        document.getElementById(`${eye}_Container`).style.display = 'none';
    }

    // toggle iris visibility
    if (paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"]["Enabled"]) {
        document.getElementById(`${eye}IrisPath`).style.display = 'block';
        document.getElementById(`${eye}_Iris_Container`).style.display = 'block';
    } else {
        document.getElementById(`${eye}IrisPath`).style.display = 'none';
        document.getElementById(`${eye}_Iris_Container`).style.display = 'none';
    }
}

/**
 * Updates the SVG path of the eye using its curvature and roundness parameters.
 * @param {string} eye - The ID of the eye.
 */
function updateEyePath(eye) {
    const curvature1 = paramsFace["Frames"][paramsTime["Time"]][eye]["Curvature1"];
    const curvature2 = paramsFace["Frames"][paramsTime["Time"]][eye]["Curvature2"];
    const curvature3 = paramsFace["Frames"][paramsTime["Time"]][eye]["Curvature3"];
    const curvature4 = paramsFace["Frames"][paramsTime["Time"]][eye]["Curvature4"];
    const roundness1 = paramsFace["Frames"][paramsTime["Time"]][eye]["Roundness1"];
    const roundness2 = paramsFace["Frames"][paramsTime["Time"]][eye]["Roundness2"];
    const roundness3 = paramsFace["Frames"][paramsTime["Time"]][eye]["Roundness3"];
    const roundness4 = paramsFace["Frames"][paramsTime["Time"]][eye]["Roundness4"];

    const pathEyeStroke = document.getElementById(`${eye}Stroke`);
    const pathEyeFill = document.getElementById(`${eye}Fill`);

    // +/- different => for symmetry - find symmetrical curvature/roundness changes
    const newPath = `M -75 -75
                 C ${-25 + roundness1 * 2} ${-75 - curvature1 * 2}, ${25 - roundness1 * 2} ${-75 - curvature1 * 2}, 75 -75
                 C ${75 + curvature2 * 2} ${-25 + roundness2 * 2}, ${75 + curvature2 * 2} ${25 - roundness2 * 2}, 75 75
                 C ${25 - roundness3 * 2} ${75 + curvature3 * 2}, ${-25 + roundness3 * 2} ${75 + curvature3 * 2}, -75 75
                 C ${-75 - curvature4 * 2} ${25 - roundness4 * 2}, ${-75 - curvature4 * 2} ${-25 + roundness4 * 2}, -75 -75`;
    //set new path values
    pathEyeStroke.setAttribute("d", newPath);
    pathEyeFill.setAttribute("d", newPath);

    updateIrisPath(eye);
}

/**
 * Updates the SVG path of the iris using its curvature and roundness parameters.
 * @param {string} eye - The ID of the eye.
 */
function updateIrisPath(eye) {
    const irisParams = paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"];

    // Calculation of the new path data based on the iris parameters
    const curvature1 = irisParams["Curvature1"];
    const curvature2 = irisParams["Curvature2"];
    const curvature3 = irisParams["Curvature3"];
    const curvature4 = irisParams["Curvature4"];
    const roundness1 = irisParams["Roundness1"];
    const roundness2 = irisParams["Roundness2"];
    const roundness3 = irisParams["Roundness3"];
    const roundness4 = irisParams["Roundness4"];

    const pathIris = document.getElementById(`${eye}IrisPath`);
    const newPath = `M -50 -50
                     C ${-25 + roundness1 * 2} ${-50 - curvature1 * 2}, ${25 - roundness1 * 2} ${-50 - curvature1 * 2}, 50 -50
                     C ${50 + curvature2 * 2} ${-25 + roundness2 * 2}, ${50 + curvature2 * 2} ${25 - roundness2 * 2}, 50 50
                     C ${25 - roundness3 * 2} ${50 + curvature3 * 2}, ${-25 + roundness3 * 2} ${50 + curvature3 * 2}, -50 50
                     C ${-50 - curvature4 * 2} ${25 - roundness4 * 2}, ${-50 - curvature4 * 2} ${-25 + roundness4 * 2}, -50 -50`;
    pathIris.setAttribute("d", newPath);
}

/**
 * Updates the stroke width of both eye stroke and fill paths.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeStrokeWidth(eye) {
    var strokeWidth = paramsFace["Frames"][paramsTime["Time"]][eye]["StrokeWidth"];
    document.getElementById(`${eye}Stroke`).setAttribute('stroke-width', strokeWidth);
    document.getElementById(`${eye}Fill`).setAttribute('stroke-width', strokeWidth);
}

/**
 * Changes color values in the model for eye or iris and updates their fill and stroke.
 * @param {HTMLElement} obj - The color input element.
 * @param {string} eye - The ID of the eye.
 */
function changeEyeColor(obj, eye) {
    if (obj.type == "color") {
        var key = obj.id.replace(eye, "");
        if (key.startsWith("Iris")) {
            paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"][key.replace("Iris", "")] = obj.value
        } else {
            paramsFace["Frames"][paramsTime["Time"]][eye][key] = obj.value
        }
    } else {
        console.warn("Not the correct fucntion called");
    }
    updateEyeColor(eye)
}

/**
 * Applies the color settings from the model to the SVG elements.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeColor(eye) {
    document.getElementById(`${eye}Stroke`).setAttribute('stroke', paramsFace["Frames"][paramsTime["Time"]][eye]["ColorStroke"]);
    document.getElementById(`${eye}Fill`).setAttribute('stroke', paramsFace["Frames"][paramsTime["Time"]][eye]["ColorStroke"]);

    document.getElementById(`${eye}IrisClipColor`).setAttribute('fill', paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"]["ColorFill"]);
    document.getElementById(`${eye}Fill`).setAttribute('fill', paramsFace["Frames"][paramsTime["Time"]][eye]["ColorFill"]);
}

/**
 * Returns the center of the SVG path bounding box for the eye stroke.
 * @param {string} eye - The ID of the eye.
 * @returns {{centerX: number, centerY: number}}
 */
function getEyeSVGPathCenter(eye) {
    const path = document.getElementById(`${eye}Stroke`);
    const bbox = path.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    return { centerX, centerY };
}

/**
 * Returns the center of the SVG path bounding box for the iris path.
 * @param {string} eye - The ID of the eye.
 * @returns {{centerX: number, centerY: number}}
 */
function getEyeSVGPathCenterIris(eye) {
    const path = document.getElementById(`${eye}IrisPath`);
    const bbox = path.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    return { centerX, centerY };
}

/**
 * Updates transformation (position, rotation, scaling) of the eye and iris.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeTransform(eye) {
    var translateX = paramsFace["Frames"][paramsTime["Time"]][eye]["TranslateX"];
    var translateY = paramsFace["Frames"][paramsTime["Time"]][eye]["TranslateY"];
    var scaleX = paramsFace["Frames"][paramsTime["Time"]][eye]["ScaleX"];
    var scaleY = paramsFace["Frames"][paramsTime["Time"]][eye]["ScaleY"];
    var rotation = paramsFace["Frames"][paramsTime["Time"]][eye]["Rotation"];

    if (eye === "EyeLeft") {
        const { centerX: eyeCenterX, centerY: eyeCenterY } = getEyeSVGPathCenter(eye);
        var eyeOffsetX = paramsDefault[eye]["StartOffsetX"] + (1 - scaleX) * eyeCenterX;
        var eyeOffsetY = paramsDefault[eye]["StartOffsetY"] + (1 - scaleY) * eyeCenterY;
        var transform = `translate(${translateX + eyeOffsetX}, ${translateY + eyeOffsetY})
                    rotate(${rotation}, 0, 0)
                    scale(${scaleX}, ${scaleY}) `;
        document.getElementById(`${eye}Stroke`).setAttribute('transform', transform);
        document.getElementById(`${eye}Fill`).setAttribute('transform', transform);
    } else if (eye === "EyeRight") {
        const { centerX: eyeCenterX, centerY: eyeCenterY } = getEyeSVGPathCenter(eye);
        var eyeOffsetX = paramsDefault[eye]["StartOffsetX"] + (1 - scaleX) * eyeCenterX;
        var eyeOffsetY = paramsDefault[eye]["StartOffsetY"] + (1 - scaleY) * eyeCenterY;
        var transform = `translate(${-translateX + eyeOffsetX}, ${translateY + eyeOffsetY})
                        rotate(${rotation}, 0, 0)
                        scale(${scaleX}, ${scaleY}) `;
        document.getElementById(`${eye}Stroke`).setAttribute('transform', transform);
        document.getElementById(`${eye}Fill`).setAttribute('transform', transform);
    }

    //iris transformation
    if (paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"]["Enabled"]) {
        updateEyeIrisTransform(eye);
    }
}

/**
 * Updates the transform for the iris based on its own and the eye's parameters.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeIrisTransform(eye) {
    updateIrisPath(eye); // Update the Iris path before transformations

    // Get current parameters for the iris and the eye
    const eyeParams = paramsFace["Frames"][paramsTime["Time"]][eye];
    const irisParams = eyeParams["Iris"];

    // Calculate transformations for the iris relative to the eye
    const translateX = irisParams["TranslateX"] + eyeParams["TranslateX"];
    const translateY = irisParams["TranslateY"] + eyeParams["TranslateY"];
    const scaleX = irisParams["ScaleX"] * eyeParams["ScaleX"];
    const scaleY = irisParams["ScaleY"] * eyeParams["ScaleY"];
    const rotation = irisParams["Rotation"];

    // Get offsets for the iris based on its position in the eye
    const { centerX: irisCenterX, centerY: irisCenterY } = getEyeSVGPathCenterIris(eye);
    const irisOffsetX = paramsDefault[eye]["StartOffsetX"] + (1 - scaleX) * irisCenterX;
    const irisOffsetY = paramsDefault[eye]["StartOffsetY"] + (1 - scaleY) * irisCenterY;

    // Define the transformation depending on the eye (left or right)
    let transform;
    if (eye === "EyeLeft") {
        transform = `translate(${translateX + irisOffsetX}, ${translateY + irisOffsetY})
                     rotate(${rotation}, ${irisCenterX}, ${irisCenterY})
                     scale(${scaleX}, ${scaleY})`;
    } else if (eye === "EyeRight") {
        transform = `translate(${-translateX + irisOffsetX}, ${translateY + irisOffsetY})
                     rotate(${rotation}, ${irisCenterX}, ${irisCenterY})
                     scale(${scaleX}, ${scaleY})`;
    }

    // Apply the transformation to the Iris SVG
    document.getElementById(`${eye}IrisPath`).setAttribute('transform', transform);

    // Update the sliders with the current values to ensure synchronization
    ["TranslateX", "TranslateY", "ScaleX", "ScaleY", "Rotation"].forEach(param => {
        const slider = document.getElementById(`${eye}_Iris_${param}`);
        if (slider && slider.value != irisParams[param]) {
            slider.value = irisParams[param];
        }
    });
}

/**
 * Enables "Mimic" mode for the iris, copying and adapting geometry from the parent eye.
 * @param {string} eye - The ID of the eye.
 */
function updateEyeIrisMimic(eye) {
    const eyeParams = paramsFace["Frames"][paramsTime["Time"]][eye];
    const irisParams = eyeParams["Iris"];

    irisParams["Mimic"] = true;

    // Synchronization of the iris parameters with the eye
    irisParams["Rotation"] = eyeParams["Rotation"];
    irisParams["ScaleX"] = 1;
    irisParams["ScaleY"] = 1;

    // Calculation of the centered position
    const translateX = 0;
    const translateY = 0;

    // Calculation of the center of the eye
    const { centerX: eyeCenterX, centerY: eyeCenterY } = getEyeSVGPathCenter(eye);

    // Set the central position of the iris relative to the eye position
    irisParams["TranslateX"] = translateX - eyeCenterX;
    irisParams["TranslateY"] = translateY - eyeCenterY;

    // Synchronization of geometric parameters
    ["Curvature1", "Curvature2", "Curvature3", "Curvature4",
     "Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(param => {
        irisParams[param] = eyeParams[param] * 0.625; 
    });

    updateEyeIrisTransform(eye);
    updateIrisPath(eye);
    
    if (eyeParams["Mirror"]) {
        const oppositeEye = eye === "EyeLeft" ? "EyeRight" : "EyeLeft";
        updateEyeIrisMimic(oppositeEye); 
    }
}

/**
 * Modifies all curvature and roundness values together to morph the eye towards a circle.
 * @param {HTMLElement} obj - The range input element.
 * @param {string} eye - The ID of the eye.
 */
function changeEyeGlobalCurvature(obj, eye) {
    const globalValue = parseFloat(obj.value); 
    const maxGlobalValue = 20.5; 
    const eyeParams = paramsFace["Frames"][paramsTime["Time"]][eye];

    const maxCurvature = 20.5; 
    const minRoundness = -5;  

    const curvatureValue = (globalValue / maxGlobalValue) * maxCurvature;
    const roundnessValue = (globalValue / maxGlobalValue) * minRoundness;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        eyeParams[curvature] = curvatureValue;
    });

    ["Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(roundness => {
        eyeParams[roundness] = roundnessValue;
    });

    eyeParams["GlobalCurvature"] = globalValue;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        document.getElementById(`${eye}_${curvature}`).value = eyeParams[curvature];
    });

    updateEyePath(eye);
}

/**
 * Modifies all curvature and roundness values for the iris together to morph it towards a circle.
 * @param {HTMLElement} obj - The range input element.
 * @param {string} eye - The ID of the eye.
 */
function changeIrisGlobalCurvature(obj, eye) {
    const globalValue = parseFloat(obj.value);
    const maxGlobalValue = 20.5;
    const irisParams = paramsFace["Frames"][paramsTime["Time"]][eye]["Iris"];

    const maxCurvature = 20.5;
    const minRoundness = -5;

    const curvatureValue = (globalValue / maxGlobalValue) * maxCurvature;
    const roundnessValue = (globalValue / maxGlobalValue) * minRoundness;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        irisParams[curvature] = curvatureValue;
    });

    ["Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(roundness => {
        irisParams[roundness] = roundnessValue;
    });

    irisParams["GlobalCurvature"] = globalValue;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        document.getElementById(`${eye}_Iris_${curvature}`).value = irisParams[curvature];
    });

    updateIrisPath(eye);
}

/**
 * Mirrors one eye's data onto the opposite eye if the mirror checkbox is active.
 * @param {string} eye - The ID of the source eye.
 */
function updateEyeMirror(eye) {
    //Synchronize value of checkbox-status
    const mirrorCheckbox = document.getElementById(`${eye}_Mirror`);
    if (!mirrorCheckbox) {
        console.warn(`Mirror checkbox not found for ${eye}.`);
        return;
    }
    paramsFace["Frames"][paramsTime["Time"]][eye]["Mirror"] = mirrorCheckbox.checked;
    

    if (paramsFace["Frames"][paramsTime["Time"]][eye]["Mirror"]) {
        const oppositeEye = eye === "EyeLeft" ? "EyeRight" : "EyeLeft";
        // Copy the main properties of the eye
        Object.entries(paramsFace["Frames"][paramsTime["Time"]][eye]).forEach(([key, value]) => {
            if (key !== "Mirror") { // Do not mirror the mirror property itself
                paramsFace["Frames"][paramsTime["Time"]][oppositeEye][key] = value;
            }
        });

        // Additionally, copy the iris properties to ensure they are the same
        Object.entries(paramsFace["Frames"][paramsTime["Time"]][eye].Iris).forEach(([key, value]) => {
            paramsFace["Frames"][paramsTime["Time"]][oppositeEye].Iris[key] = value;
        });

        document.getElementById("EyeRight_Container").style.display = 'none';
        document.getElementById("EyeRight_Iris_Container").style.display = 'none';

    } else {

        document.getElementById("EyeRight_Container").style.display = 'block';
        document.getElementById("EyeRight_Iris_Container").style.display = 'block';
    }

    refreshEye()
}

// Synchronization listener for mirrored changes
// Listens for UI changes and mirrors eye values if enabled.
document.querySelectorAll('#sideArea input, #sideArea select').forEach(input => {
    input.addEventListener('input', function () {
        if (paramsFace["Frames"][paramsTime["Time"]]["EyeLeft"]["Mirror"]) {
            if (this.id.startsWith('EyeLeft')) {
                updateEyeMirror("EyeLeft");
            } else if (this.id.startsWith('EyeRight')) {
                updateEyeMirror("EyeRight");
            }
        }
    });
});

/**
 * Calls all update functions for both eyes and their irises.
 */
function refreshEye(){
    updateEyeVisibility("EyeLeft");
    updateEyeVisibility("EyeRight");
    updateEyeStrokeWidth("EyeLeft");
    updateEyeStrokeWidth("EyeRight");
    updateEyeColor("EyeLeft");
    updateEyeColor("EyeRight");
    updateEyePath("EyeLeft");
    updateEyePath("EyeRight");
    updateEyeTransform("EyeLeft");
    updateEyeTransform("EyeRight");

       // Only use Mimic during editing
    if (paramsFace["Frames"][paramsTime["Time"]]["EyeLeft"]["Iris"]["Mimic"]) {
        updateEyeIrisMimic("EyeLeft");
    }
    if (paramsFace["Frames"][paramsTime["Time"]]["EyeRight"]["Iris"]["Mimic"]) {
        updateEyeIrisMimic("EyeRight");
    }

    updateIrisPath("EyeLeft");
    updateIrisPath("EyeRight");
    updateEyeIrisTransform("EyeLeft");
    updateEyeIrisTransform("EyeRight");
}

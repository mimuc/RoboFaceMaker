/**
 * Updates visibility of mouth and tongue elements in the UI.
 */
function updateMouthVisibility() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const tongue = mouth["Tongue"];

    // Update visibility for mouth
    const mouthVisible = mouth["Enabled"];
    document.getElementById("MouthStroke").style.display = mouthVisible ? "block" : "none";
    document.getElementById("MouthFill").style.display = mouthVisible ? "block" : "none";

    // Update visibility for tongue
    const tongueVisible = tongue["Enabled"];
    document.getElementById("MouthTonguePath").style.display = tongueVisible ? "block" : "none";
}

// Mouth:

/**
 * Updates the SVG path for the mouth based on curvature and roundness parameters.
 */
function updateMouthPath() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const {
        Curvature1,
        Curvature2,
        Curvature3,
        Curvature4,
        Roundness1,
        Roundness2,
        Roundness3,
        Roundness4,
        GlobalCurvature,
    } = mouth;

    const newPath = `
        M -75 -75
        C ${-25 + Roundness1 * 2} ${-75 - (Curvature1 + GlobalCurvature) * 2},
          ${25 - Roundness1 * 2} ${-75 - (Curvature1 + GlobalCurvature) * 2}, 75 -75
        C ${75 + (Curvature2 + GlobalCurvature) * 2} ${-25 + Roundness2 * 2},
          ${75 + (Curvature2 + GlobalCurvature) * 2} ${25 - Roundness2 * 2}, 75 75
        C ${25 - Roundness3 * 2} ${75 + (Curvature3 + GlobalCurvature) * 2},
          ${-25 + Roundness3 * 2} ${75 + (Curvature3 + GlobalCurvature) * 2}, -75 75
        C ${-75 - (Curvature4 + GlobalCurvature) * 2} ${25 - Roundness4 * 2},
          ${-75 - (Curvature4 + GlobalCurvature) * 2} ${-25 + Roundness4 * 2}, -75 -75 Z`;

    const pathStroke = document.getElementById("MouthStroke");
    const pathFill = document.getElementById("MouthFill");
    pathStroke.setAttribute("d", newPath);
    pathFill.setAttribute("d", newPath);

    updateTonguePath();
}

/**
 * Applies transformation (position, scale, rotation) to the mouth element.
 */
function updateMouthTransform() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const translateX = mouth["TranslateX"];
    const translateY = mouth["TranslateY"];
    const scaleX = mouth["ScaleX"];
    const scaleY = mouth["ScaleY"];
    const rotation = mouth["Rotation"];

    const { centerX: mouthCenterX, centerY: mouthCenterY } = getMouthSVGPathCenter();
    const mouthOffsetX = paramsDefault["Mouth"]["StartOffsetX"] + (1 - scaleX) * mouthCenterX;
    const mouthOffsetY = paramsDefault["Mouth"]["StartOffsetY"] + (1 - scaleY) * mouthCenterY;

    const transform = `translate(${translateX + mouthOffsetX}, ${translateY + mouthOffsetY})
                       rotate(${rotation}, 0, 0)
                       scale(${scaleX}, ${scaleY})`;
                       
    document.getElementById(`MouthStroke`).setAttribute('transform', transform);
    document.getElementById(`MouthFill`).setAttribute('transform', transform);

    // Transform Tongue if enabled
    if (mouth["Tongue"]["Enabled"]) {
        updateMouthTongueTransform();
    }
}

/**
 * Updates the stroke width of the mouth path.
 */
function updateMouthStrokeWidth() {
    const strokeWidth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"]["StrokeWidth"];
    document.getElementById(`MouthStroke`).setAttribute('stroke-width', strokeWidth);
    document.getElementById(`MouthFill`).setAttribute('stroke-width', strokeWidth);
}

/**
 * Applies color changes to the mouth or tongue from a color input.
 * @param {HTMLElement} obj - The color input element.
 * @param {string} mouth - Identifier string for the mouth section.
 */
function changeMouthColor(obj, mouth) {
    if (obj.type == "color") {
        var key = obj.id.replace(mouth, "");
        if (key.startsWith("Tongue")) {
            paramsFace["Frames"][paramsTime["Time"]]["Mouth"]["Tongue"][key.replace("Tongue", "")] = obj.value
        } else {
            paramsFace["Frames"][paramsTime["Time"]]["Mouth"][key] = obj.value
        }
    } else {
        console.warn("Not the correct fucntion called");
    }
    updateMouthColor()
}

/**
 * Updates the fill and stroke color attributes of the mouth and tongue.
 */
function updateMouthColor() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const tongue = mouth["Tongue"];

    document.getElementById("MouthStroke").setAttribute('stroke', mouth["ColorStroke"]);
    document.getElementById("MouthFill").setAttribute('fill', mouth["ColorFill"]);
    document.getElementById("MouthTongueClipColor").setAttribute('fill', tongue["ColorFill"]);
}

/**
 * Adjusts curvature and roundness parameters for mouth globally using a slider.
 * @param {HTMLElement} obj - The slider input for global curvature.
 */
function changeMouthGlobalCurvature(obj) {
    const globalValue = parseFloat(obj.value); 
    const maxGlobalValue = 20.5; 
    const mouthParams = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];

    const maxCurvature = 20.5; 
    const minRoundness = -5;  

    const curvatureValue = (globalValue / maxGlobalValue) * maxCurvature;
    const roundnessValue = (globalValue / maxGlobalValue) * minRoundness;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        mouthParams[curvature] = curvatureValue;
    });

    ["Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(roundness => {
        mouthParams[roundness] = roundnessValue;
    });

    mouthParams["GlobalCurvature"] = globalValue;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        document.getElementById(`Mouth_${curvature}`).value = mouthParams[curvature];
    });

    updateMouthPath();
}

// Tongue:

/**
 * Updates the tongue SVG path based on current curvature and roundness values.
 */
function updateTonguePath() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const tongue = mouth["Tongue"];

    // Retrieve updated parameters
    const curvature1 = tongue["Curvature1"];
    const curvature2 = tongue["Curvature2"];
    const curvature3 = tongue["Curvature3"];
    const curvature4 = tongue["Curvature4"];
    const roundness1 = tongue["Roundness1"];
    const roundness2 = tongue["Roundness2"];
    const roundness3 = tongue["Roundness3"];
    const roundness4 = tongue["Roundness4"];

    // Update tongue path
    const pathTongue = document.getElementById("MouthTonguePath");
    const newPath = `
        M -50 -30
        C ${-25 + roundness1 * 2} ${-30 - curvature1 * 2}, ${25 - roundness1 * 2} ${-30 - curvature1 * 2}, 50 -30
        C ${50 + curvature2 * 2} ${-15 + roundness2 * 2}, ${50 + curvature2 * 2} ${15 - roundness2 * 2}, 50 30
        C ${25 - roundness3 * 2} ${30 + curvature3 * 2}, ${-25 + roundness3 * 2} ${30 + curvature3 * 2}, -50 30
        C ${-50 - curvature4 * 2} ${15 - roundness4 * 2}, ${-50 - curvature4 * 2} ${-15 + roundness4 * 2}, -50 -30
        Z`;
    pathTongue.setAttribute("d", newPath);
}

/**
 * Applies transformations to the tongue path.
 */
function updateMouthTongueTransform() {
    updateTonguePath();
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const tongue = mouth["Tongue"];

    const translateX = tongue["TranslateX"] + mouth["TranslateX"];
    const translateY = tongue["TranslateY"] + mouth["TranslateY"];
    const scaleX = tongue["ScaleX"] + mouth["ScaleX"] * 0.2;
    const scaleY = tongue["ScaleY"] + mouth["ScaleY"] * 0.2;
    const rotation = tongue["Rotation"];

    const { centerX: tongueCenterX, centerY: tongueCenterY } = getMouthSVGPathCenterTongue();
    const tongueOffsetX = paramsDefault["Mouth"]["StartOffsetX"] + (1 - scaleX) * tongueCenterX;
    const tongueOffsetY = paramsDefault["Mouth"]["StartOffsetY"] + (1 - scaleY) * tongueCenterY;

    let transform;
        transform = `translate(${translateX + tongueOffsetX}, ${translateY + tongueOffsetY})
                     rotate(${rotation}, ${tongueCenterX}, ${tongueCenterY})
                     scale(${scaleX}, ${scaleY})`;

    document.getElementById(`MouthTonguePath`).setAttribute('transform', transform);

    ["TranslateX", "TranslateY", "ScaleX", "ScaleY", "Rotation"].forEach(param => {
        const slider = document.getElementById(`Mouth_Tongue_${param}`);
        if (slider && slider.value != tongue[param]) {
            slider.value = tongue[param];
        }
    });
}

/**
 * Adjusts tongue curvature and roundness via global slider input.
 * @param {HTMLElement} obj - The input element for tongue global curvature.
 */
function updateTongueGlobalCurvature(obj) {
    const globalValue = parseFloat(obj.value);
    const maxGlobalValue = 20.5; 
    const tongueParams = paramsFace["Frames"][paramsTime["Time"]]["Mouth"]["Tongue"];

    const maxCurvature = 20.5; 
    const minRoundness = -5;  

    const curvatureValue = (globalValue / maxGlobalValue) * maxCurvature;
    const roundnessValue = (globalValue / maxGlobalValue) * minRoundness;

    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"].forEach(curvature => {
        tongueParams[curvature] = curvatureValue;

        const slider = document.getElementById(`Mouth_Tongue_${curvature}`);
        if (slider) slider.value = curvatureValue;
    });

    tongueParams["GlobalCurvature"] = globalValue;

    updateTonguePath();
}

/**
 * Enables mimic mode for tongue, syncing it to mouth transformations and geometry.
 */
function updateTongueMimic() {
    const mouth = paramsFace["Frames"][paramsTime["Time"]]["Mouth"];
    const tongue = paramsFace["Frames"][paramsTime["Time"]]["Mouth"]["Tongue"];

    tongue["Mimic"] = true;

    tongue["Rotation"] = mouth["Rotation"];
    tongue["ScaleX"] = mouth["ScaleX"];
    tongue["ScaleY"] = mouth["ScaleY"];

    const translateX = 0;
    const translateY = 0;

    // Center the tongue relative to the mouth
    const { centerX: mouthCenterX, centerY: mouthCenterY } = getMouthSVGPathCenter();
    tongue["TranslateX"] = translateX - mouthCenterX;
    tongue["TranslateY"] = translateY - mouthCenterY;

    // Adjusting the parameters for the tongue
    ["Curvature1", "Curvature2", "Curvature3", "Curvature4"/*,
     "Roundness1", "Roundness2", "Roundness3", "Roundness4"*/].forEach(param => {
        tongue[param] = mouth[param]; 
    });

    updateTonguePath();
    updateMouthTongueTransform();
}

/**
 * Computes the center point of the mouth stroke path.
 * @returns {{centerX: number, centerY: number}}
 */
function getMouthSVGPathCenter() {
    const path = document.getElementById(`MouthStroke`);
    const bbox = path.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    return { centerX, centerY };
}

/**
 * Computes the center point of the tongue path.
 * @returns {{centerX: number, centerY: number}}
 */
function getMouthSVGPathCenterTongue() {
    const path = document.getElementById(`MouthTonguePath`);
    const bbox = path.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    return { centerX, centerY };
}

/**
 * Calls all update functions related to mouth and tongue visuals.
 */
function refreshMouth() {
    updateMouthVisibility();
    updateMouthStrokeWidth();
    updateMouthPath();
    updateMouthTransform();
    updateMouthColor();

    const tongueParams = paramsFace["Frames"][paramsTime["Time"]]["Mouth"]["Tongue"];

    // Use mimic tool for editing only
    if (tongueParams["Mimic"]) {
        console.log("Mimic-Tool aktiv: Zunge wird an den Mund angepasst.");
        updateTongueMimic(); 
    }

    updateTonguePath();
    updateMouthTongueTransform();
}
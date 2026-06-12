/**
 * Linearly interpolates between two values.
 * @param {number|string} value1 - The first value.
 * @param {number|string} value2 - The second value.
 * @param {number} a - Interpolation factor between 0 and 1.
 * @returns {number|string} - Interpolated value if numeric, otherwise value1.
 */
function interpolation(value1, value2, a) {
    const lerp = (x, y, a) => x * (1 - a) + y * a;
    var value = value1;

    if (typeof value1 === "number" && typeof value2 === "number") {
        value = lerp(value1, value2, a);
    }

    return value
}

/**
 * Interpolates between two defined keyframes and generates an interpolated frame.
 * Supports nested interpolation (e.g. iris/tongue) and color blending.
 * @param {number[]} frames - Sorted array of keyframe indices.
 * @param {number} idx - Current index within the keyframes array.
 * @param {number} current - Target frame index to generate.
 * @returns {Object} - The resulting interpolated frame object.
 */
function interpolateBetweenTwoFrames(frames, idx, current) {
    const frame1idx = frames[idx];
    const frame2idx = frames[idx + 1];

    const frame1 = JSON.parse(JSON.stringify(paramsFace["Frames"][frame1idx])); // Deep copy
    const frame2 = JSON.parse(JSON.stringify(paramsFace["Frames"][frame2idx]));

    const interpolatedFrame = paramsFace["Frames"][current] || {};
    initializeFrame(interpolatedFrame);

    const a = (current - frame1idx) / (frame2idx - frame1idx);

    // Interpolation for BackgroundColor
    if (frame1.Settings?.BackgroundColor && frame2.Settings?.BackgroundColor) {
        const color1 = hexToRgb(frame1.Settings.BackgroundColor);
        const color2 = hexToRgb(frame2.Settings.BackgroundColor);
        interpolatedFrame.Settings.BackgroundColor = rgbToHex(
            Math.round(interpolation(color1.r, color2.r, a)),
            Math.round(interpolation(color1.g, color2.g, a)),
            Math.round(interpolation(color1.b, color2.b, a))
        );
    }

    // Interpolation for Eyes and Mouth (including nested parts)
    ["EyeLeft", "EyeRight", "Mouth", "BrowLeft", "BrowRight"].forEach(part => {
        if (frame1[part] && frame2[part]) {
            interpolatedFrame[part] = interpolatedFrame[part] || {};

            // Interpolate all properties
            Object.keys(frame1[part]).forEach(key => {
                if (frame2[part][key] !== undefined) {
                    if (typeof frame1[part][key] === "string" && frame1[part][key].startsWith("#")) {
                        // Handle color interpolation
                        const color1 = hexToRgb(frame1[part][key]);
                        const color2 = hexToRgb(frame2[part][key]);
                        interpolatedFrame[part][key] = rgbToHex(
                            Math.round(interpolation(color1.r, color2.r, a)),
                            Math.round(interpolation(color1.g, color2.g, a)),
                            Math.round(interpolation(color1.b, color2.b, a))
                        );
                    } else {
                        // Handle numerical interpolation
                        interpolatedFrame[part][key] = interpolation(frame1[part][key], frame2[part][key], a);
                    }
                }
            });

            // Handle nested components (Iris for Eye, Tongue for Mouth)
            const nestedPart = part === "Mouth" ? "Tongue" : "Iris";
            if (frame1[part][nestedPart] && frame2[part][nestedPart]) {
                interpolatedFrame[part][nestedPart] = interpolatedFrame[part][nestedPart] || {};

                Object.keys(frame1[part][nestedPart]).forEach(key => {
                    if (key === "Mimic") {
                        // Mimic is not interpolated
                        interpolatedFrame[part][nestedPart][key] = false;
                    } else if (frame1[part][nestedPart]["Mimic"] && frame2[part][nestedPart]["Mimic"]) {
                        // Mimic active: Iris follows the eye interpolation
                        if (typeof frame1[part][key] === "string" && frame1[part][key].startsWith("#")) {
                            const color1 = hexToRgb(frame1[part][key]);
                            const color2 = hexToRgb(frame2[part][key]);
                            interpolatedFrame[part][nestedPart][key] = rgbToHex(
                                Math.round(interpolation(color1.r, color2.r, a)),
                                Math.round(interpolation(color1.g, color2.g, a)),
                                Math.round(interpolation(color1.b, color2.b, a))
                            );
                        } else {
                            interpolatedFrame[part][nestedPart][key] = interpolation(
                                frame1[part][key],
                                frame2[part][key],
                                a
                            );
                        }
                    } else {
                        // Normal interpolation of iris values
                        if (typeof frame1[part][nestedPart][key] === "string" && frame1[part][nestedPart][key].startsWith("#")) {
                            const color1 = hexToRgb(frame1[part][nestedPart][key]);
                            const color2 = hexToRgb(frame2[part][nestedPart][key]);
                            interpolatedFrame[part][nestedPart][key] = rgbToHex(
                                Math.round(interpolation(color1.r, color2.r, a)),
                                Math.round(interpolation(color1.g, color2.g, a)),
                                Math.round(interpolation(color1.b, color2.b, a))
                            );
                        } else {
                            interpolatedFrame[part][nestedPart][key] = interpolation(
                                frame1[part][nestedPart][key],
                                frame2[part][nestedPart][key],
                                a
                            );
                        }
                    }
                });
            }
        }
    });

    return interpolatedFrame;
}

/**
 * Converts a hexadecimal color string to an RGB object.
 * @param {string} hex - Hexadecimal color string (e.g. "#FF00FF").
 * @returns {{r: number, g: number, b: number}} - RGB components.
 */
function hexToRgb(hex) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, "");

    // Parse r, g, b values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}

/**
 * Converts RGB components to a hexadecimal color string.
 * @param {number} r - Red channel (0–255).
 * @param {number} g - Green channel (0–255).
 * @param {number} b - Blue channel (0–255).
 * @returns {string} - Hexadecimal color string.
 */
function rgbToHex(r, g, b) {
    return (
        "#" +
        ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}

/**
 * Regenerates all frames between existing keyframes using interpolation.
 * Ensures frame 0 and trailing frames are initialized if missing.
 * Writes the results into `paramsFace["Frames"]`.
 */
function createFramesFromKeyFrames() {
    const keyFrames = [];
    Object.entries(paramsFace["Frames"]).forEach(([i, frame]) => {
        if (frame["IsKeyFrame"]) keyFrames.push(Number(i));
    });
    keyFrames.sort((a, b) => a - b);

    // Interpolate frames between keyframes
    if (keyFrames.length > 1) {
        for (let i = 0; i < keyFrames.length - 1; i++) {
            for (let j = Number(keyFrames[i]) + 1; j < keyFrames[i + 1]; j++) {
                paramsFace["Frames"][j] = initializeFrame(
                    interpolateBetweenTwoFrames(keyFrames, i, j)
                );
                paramsFace["Frames"][j]["IsKeyFrame"] = false;
            }
        }
    }

    // Initialize frame 0 explicitly if missing
    if (!paramsFace["Frames"][0]) {
        paramsFace["Frames"][0] = initializeFrame(
            JSON.parse(JSON.stringify(paramsFace["Frames"][keyFrames[0]]))
        );
        paramsFace["Frames"][0]["IsKeyFrame"] = false;
    }

    ["BrowLeft", "BrowRight"].forEach(eyebrow => {
        if (!paramsFace["Frames"][0][eyebrow]) {
            paramsFace["Frames"][0][eyebrow] = JSON.parse(JSON.stringify(paramsFace["Frames"][keyFrames[0]][eyebrow]));
        }
    });

    // Fill up end
    if (keyFrames[keyFrames.length - 1] != paramsFace["Settings"]["TimeMax"]) {
        for (let j = Number(keyFrames[keyFrames.length - 1]) + 1; j < Number(paramsFace["Settings"]["TimeMax"]); j++) {
            paramsFace["Frames"][j] = initializeFrame(
                JSON.parse(JSON.stringify(paramsFace["Frames"][keyFrames[keyFrames.length - 1]]))
            );
            paramsFace["Frames"][j]["IsKeyFrame"] = false;
        }
    }

    //console.log("Frames recreated:", paramsFace["Frames"]);
}

/**
 * Switches the active model to the one stored at a specific time step.
 * Triggers `loadModel()` if the frame exists.
 * @param {number} time - Time step to load the frame from.
 */
function changeModelOnTime(time) {
    if (Object.keys(paramsFace["Frames"]).includes(String(time))) {
        loadModel(time, paramsFace)
    }
    else {
        console.warn("There exists no model for this timestep")
    }
}

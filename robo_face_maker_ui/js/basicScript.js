/**
 * Updates the SVG viewBox dimensions based on the current face settings.
 */
function updateSettings(){
    const width = paramsFace.Settings.Size.Width;
    const height = paramsFace.Settings.Size.Height;

    // Keep the face layout proportional to the configured canvas size.
    paramsDefault.EyeLeft.StartOffsetX = width * 0.25;
    paramsDefault.EyeRight.StartOffsetX = width * 0.75;
    paramsDefault.Mouth.StartOffsetX = width * 0.5;
    paramsDefault.BrowLeft.StartOffsetX = width * 0.25;
    paramsDefault.BrowRight.StartOffsetX = width * 0.75;
    paramsDefault.EyeLeft.StartOffsetY = height * (270 / 700);
    paramsDefault.EyeRight.StartOffsetY = height * (270 / 700);
    paramsDefault.Mouth.StartOffsetY = height - 175;
    paramsDefault.BrowLeft.StartOffsetY = height * (187 / 700) - 87;
    paramsDefault.BrowRight.StartOffsetY = height * (187 / 700) - 87;

    const svgBackground = document.getElementById('svg');
    document.getElementById("svg").viewBox.baseVal.width = paramsFace["Settings"]["Size"]["Width"];
    document.getElementById("svg").viewBox.baseVal.height = paramsFace["Settings"]["Size"]["Height"];
}

/**
 * Updates the background color of the SVG based on the current frame.
 */
function updateBackgroundColor() {
    const svgBackground = document.getElementById('svg');
    const currentFrame = initializeFrame(paramsFace["Frames"][paramsTime["Time"]]);

    svgBackground.style.backgroundColor = paramsFace["Frames"][paramsTime["Time"]]["Settings"]["BackgroundColor"];
}

/**
 * Serializes the current SVG and downloads it as a PNG image.
 */
function downloadImage() {

    // Export at the configured face size, independent of the responsive UI size.
    const svg = document.getElementById('svg');
    const width = paramsFace.Settings.Size.Width;
    const height = paramsFace.Settings.Size.Height;
    const exportSvg = svg.cloneNode(true);
    exportSvg.setAttribute('width', width);
    exportSvg.setAttribute('height', height);
    const svgData = new XMLSerializer().serializeToString(exportSvg);

    // Create a canvas and context for drawing the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // Fill the canvas background with the defined color
    ctx.fillStyle = paramsFace["Frames"][paramsTime["Time"]]["Settings"]["BackgroundColor"];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create an image to render the SVG onto the canvas
    const img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, width, height);
        // Save the canvas content as an image
        canvas.toBlob(function (blob) {
            const imageUrl = URL.createObjectURL(blob);
            triggerDownload(imageUrl, 'face.png');
        }, 'image/png');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

/**
 * Downloads the current face settings as a JSON file.
 * @param {string} [filename='faceSettings.json'] - Name of the downloaded file.
 */
function downloadJson(filename = 'faceSettings.json') {
    // Preparing settings for the JSON file
    const settings = paramsFace;

    // Convert settings object to a JSON string
    const settingsStr = JSON.stringify(settings, null, 2); // Pretty-print for readability

    // Trigger a download of the JSON file
    const blob = new Blob([settingsStr], { type: 'application/json' });
    const settingsUrl = URL.createObjectURL(blob);
    triggerDownload(settingsUrl, filename); // Use the provided filename
}

/**
 * Triggers a file download for a given URL and filename.
 * @param {string} url - The object URL of the file to download.
 * @param {string} filename - The desired filename.
 */
function triggerDownload(url, filename) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url); // Clean up
}

/**
 * Loads face settings from an uploaded JSON file and updates the interface.
 * @param {Event} event - The file input change event.
 */
function loadSettingsFromJson(event) {
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (fileEvent) {
            try {
                // Parse and validate the JSON content
                const settings = JSON.parse(fileEvent.target.result);
                if (!validateSettings(settings)) {
                    throw new Error("Invalid JSON structure.");
                }

                // Merge settings with defaults and initialize frames
                paramsFace = mergeWithDefaults(settings);
                addKeyFrameFlags();
                refreshSettings();
                refreshKeyFrameMarkers();
                alert("Settings loaded successfully.");
            } catch (error) {
                console.error("Error loading or parsing file:", error);
                alert("Error loading or parsing file. Please ensure you're uploading a valid JSON file.");
            }
        };
        reader.readAsText(input.files[0]);
    }
}

/**
 * Validates the basic structure of a loaded JSON settings object.
 * @param {Object} settings - The settings object to validate.
 * @returns {boolean} - True if valid, otherwise false.
 */
function validateSettings(settings) {
    if (!settings || typeof settings !== "object" || !settings.Frames) {
        return false;
    }
    // Further validation rules can be added here
    return true;
}

/**
 * Merges loaded settings with default values, ensuring all frames are initialized.
 * @param {Object} settings - The loaded settings object.
 * @returns {Object} - The merged and initialized settings object.
 */
function mergeWithDefaults(settings) {
    const defaultSettings = {
        Frames: {},
        Settings: {
            BackgroundColor: "#ffffff",
            TimeMax: 100
        }
    };

    const merged = { ...defaultSettings, ...settings };

    // Initialize each frame
    Object.keys(merged.Frames).forEach(frameKey => {
        merged.Frames[frameKey] = initializeFrame(merged.Frames[frameKey]);
    });

    return merged;
}

/**
 * Creates a new model entry for a given keyframe based on the closest existing one.
 * @param {number} targetFrame - The frame index to create the keyframe at.
 */
function createModelForNewKeyFrame(targetFrame) {
    if (paramsFace["Frames"][targetFrame]) return; // Falls Keyframe existiert, nichts tun

    const frames = paramsFace.Frames;
    const frameNumbers = Object.keys(frames).map(Number);
    let closestFrame = frameNumbers[0];

    for (let i = 1; i < frameNumbers.length; i++) {
        if (Math.abs(frameNumbers[i] - targetFrame) < Math.abs(closestFrame - targetFrame)) {
            closestFrame = frameNumbers[i];
        }
    }

    paramsFace["Frames"][targetFrame] = JSON.parse(JSON.stringify(frames[closestFrame]));
    delete paramsFace["Frames"][closestFrame]; // Alten Keyframe entfernen
}

/**
 * Changes a value in the model and triggers appropriate UI and SVG updates.
 * @param {HTMLElement} obj - The UI element that triggered the change.
 */
function changeValue(obj) {
    saveStateForUndo(obj);

    activeKeyFrame = paramsTime["Time"];
    let newValue = "-1";

    if (obj.type === "range") {
        newValue = parseFloat(obj.value);
    } else if (obj.type === "checkbox") {
        newValue = obj.checked;
    } else if (obj.type === "select-one" || obj.type === "color") {
        newValue = obj.value;
    } else if (obj.type === "button") {
        newValue = obj.value;
    } else {
        console.warn("Not a supported input");
        return;
    }

    const frames = paramsFace.Frames;
    const keyInfo = obj.id.split("_");

    // Update nested or parent properties
    if (keyInfo.length > 2) {
        const parent = frames[activeKeyFrame][keyInfo[0]];
        const nested = parent[keyInfo[1]];

        if (nested[keyInfo[2]] !== newValue) {
            nested[keyInfo[2]] = newValue;

            // Disable Mimic for Iris or Tongue if manually modified
            if (keyInfo[1] === "Iris" && keyInfo[0].startsWith("Eye")) {
                nested["Mimic"] = false;
            } else if (keyInfo[1] === "Tongue" && keyInfo[0] === "Mouth") {
                nested["Mimic"] = false;
            }
        }
    } else {
        const parent = frames[activeKeyFrame][keyInfo[0]];
        if (parent[keyInfo[1]] !== newValue) {
            parent[keyInfo[1]] = newValue;
        }
    }

    createFramesFromKeyFrames();

    paramsFace["Frames"][paramsTime["Time"]] = paramsFace["Frames"][activeKeyFrame];

    // Call appropriate update functions
    if (keyInfo[0].startsWith("Eye")) {
        if (keyInfo[1] == "Iris") {
            key = keyInfo[keyInfo.length - 1];
            if (key == "Rotation" | key == "ScaleX" | key == "ScaleY" | key == "TranslateX" | key == "TranslateY") {
                updateEyeIrisTransform(keyInfo[0]);
            } else if (key == "Enabled") {
                updateEyeVisibility(keyInfo[0]);
            } else if (key == "Mimic") {
                updateEyeIrisMimic(keyInfo[0]);
            } else if (key == "GlobalCurvature") {
                changeIrisGlobalCurvature(obj, keyInfo[0]);
            } else if (key.startsWith("Curvature") | key.startsWith("Roundness")) {
                updateIrisPath(keyInfo[0])
            } else if (key == "ColorFill") {
                updateEyeColor(keyInfo[0]);
            }
            else {
                console.warn("Key not handeled: " + keyInfo);
            }
        } else {
            key = keyInfo[1];
            if (key == "Rotation"| key == "ScaleX" | key == "ScaleY" | key == "TranslateX" | key == "TranslateY") {
                updateEyeTransform(keyInfo[0]);
            } else if (key == "Enabled") {
                updateEyeVisibility(keyInfo[0]);
            } else if (key == "StrokeWidth") {
                updateEyeStrokeWidth(keyInfo[0]);
            } else if (key == "ColorFill" | key == "ColorStroke") {
                updateEyeColor(keyInfo[0]);
            } else if (key.startsWith("Curvature") | key.startsWith("Roundness")) {
                updateEyePath(keyInfo[0]);
            } else if (key == "Mirror") {
                updateEyeMirror(keyInfo[0]);
            } else if (key == "GlobalCurvature") {
                changeEyeGlobalCurvature(obj, keyInfo[0]);
            }else {
                console.warn("Key not handeled: " + keyInfo);
            }
        }
    } else if (keyInfo[0] == "Mouth") {
        if (keyInfo[1] == "Tongue") {
            key = keyInfo[2];
            if (key == "Rotation" | key == "ScaleX" | key == "ScaleY" | key == "TranslateX" | key == "TranslateY") {
                updateMouthTongueTransform();
            } else if (key == "Enabled") {
                updateMouthVisibility();
            } else if (key == "Mimic") {
                updateTongueMimic();
            } else if (key == "ColorFill") {
                updateMouthColor();
            } else if (key.startsWith("Curvature") | key.startsWith("Roundness")) {
                updateTonguePath()
            } else if (key == "GlobalCurvature") {
                updateTongueGlobalCurvature(obj);
            } else {
                console.warn("Key not handled: " + keyInfo);
            }
        } else {
            key = keyInfo[1];
            if (key == "Rotation" | key == "ScaleX" | key == "ScaleY" | key == "TranslateX" | key == "TranslateY") {
                updateMouthTransform();
            } else if (key == "Enabled") {
                updateMouthVisibility();
            } else if (key == "StrokeWidth") {
                updateMouthStrokeWidth();
            } else if (key == "ColorFill" | key == "ColorStroke") {
                updateMouthColor();
            } else if (key.startsWith("Curvature") | key.startsWith("Roundness")) {
                updateMouthPath();
            } else if (key.startsWith("GlobalCurvature")) {
                changeMouthGlobalCurvature(obj);
            } else {
                console.warn("Key not handeled: " + keyInfo);
            }
        }    
    } else if (keyInfo[0].startsWith("Brow")) {
        key = keyInfo[1];
        if (key == "Rotation" | key == "ScaleX" | key == "ScaleY" | key == "TranslateX" | key == "TranslateY") {
            updateEyebrowTransform(keyInfo[0]);
        } else if (key == "Enabled") {
            updateEyebrowVisibility(keyInfo[0]);
        } else if (key == "Mirror") {
            updateEyebrowMirror(keyInfo[0]);
        }    else if (key == "ColorStroke") {
            updateEyebrowColor(keyInfo[0]);
        } else if (key == "Curvature" | key == "Thickness" | key == "Length") {
            updateEyebrowPath(keyInfo[0]);
        } else {
            console.warn("Key not handled: " + keyInfo);
        }
    } else if (keyInfo[0] == "Settings") {
        if (keyInfo[1] == "BackgroundColor") {
            updateBackgroundColor();
        } else {
            console.warn("Key not handeled: " + keyInfo);
        }
    }
}

/**
 * Scrolls the UI to the corresponding element based on the source element ID.
 * @param {Event} event - The triggered event from UI.
 */
function scrollToUi(event) {
    if (event.srcElement.id.startsWith("EyeLeftIris")) {
        document.getElementById("EyeLeft_Iris_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("EyeRightIris")) {
        document.getElementById("EyeRight_Iris_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("EyeLeft")) {
        document.getElementById("EyeLeft_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("EyeRight")) {
        document.getElementById("EyeRight_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("Mouth")) {
        document.getElementById("Mouth_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("BrowLeft")) {  
        document.getElementById("BrowLeft_Container").scrollIntoView();
    } else if (event.srcElement.id.startsWith("BrowRight")) { 
        document.getElementById("BrowRight_Container").scrollIntoView();
    }
}

/**
 * Refreshes and updates the entire settings UI based on frame 0.
 */
function refreshSettings() {
    console.debug("Refreshing settings for frame:", paramsFace["Frames"]["0"]);

    Object.entries(paramsFace["Frames"]["0"]).forEach(([id, elements]) => {
        Object.entries(elements).forEach(([key, value]) => {
            if (key === "Iris" || key === "Tongue") {
                Object.entries(value).forEach(([key2, value2]) => {
                    const element = document.getElementById(`${id}_${key}_${key2}`);
                    if (element) {
                        if (element.type === "checkbox") {
                            element.checked = value2;
                        } else if (element.type === "range" || element.type === "color" || element.type === "select-one") {
                            element.value = value2;
                        } else if (element.type === "button") {
                            // Buttons do not need a value setting
                            console.debug(`Button element: ${id}_${key}_${key2}`);
                        }
                        console.debug(`Updated element: ${id}_${key}_${key2} = ${value2}`);
                    } else {
                        console.warn(`Element not found: ${id}_${key}_${key2}`);
                    }
                });
            } else {
                const element = document.getElementById(`${id}_${key}`);
                if (element) {
                    if (element.type === "checkbox") {
                        element.checked = value;
                    } else if (element.type === "range" || element.type === "color" || element.type === "select-one") {
                        element.value = value;
                    } else if (element.type === "button") {
                        console.debug(`Button element: ${id}_${key}`);
                    }
                    console.debug(`Updated element: ${id}_${key} = ${value}`);
                } else {
                    console.warn(`Element not found: ${id}_${key}`);
                }
            }
        });
    });

    // Update the display
    updateSettings();
    refreshEye();
    refreshMouth();
    refreshEyebrows(); 
    updateBackgroundColor();
    refreshTime();
    createFramesFromKeyFrames();

    console.debug("Settings refreshed successfully.");
}

/**
 * Loads a given frame into the current model and updates the UI.
 * @param {number} keyframe - The frame index to load.
 * @param {Object} params - The complete model parameters to pull from.
 */
function loadModel(keyframe, params) {
    if (!params["Frames"][keyframe]) {
        console.error(`Frame ${keyframe} does not exist.`);
        return;
    }

    if (paramsFace["Frames"][paramsTime["Time"]] && paramsTime["Time"] !== keyframe) {
        delete paramsFace["Frames"][paramsTime["Time"]];
    }

    paramsFace["Frames"][keyframe] = initializeFrame(params["Frames"][keyframe]);
    paramsTime["Time"] = keyframe;

    const currentFrame = paramsFace["Frames"][keyframe];

    Object.entries(currentFrame).forEach(([id, elements]) => {
        Object.entries(elements).forEach(([key, value]) => {
            if ((key === "Iris") || (key === "Tongue")) {
                Object.entries(value).forEach(([key2, value2]) => {
                    const element = document.getElementById(`${id}_${key}_${key2}`);
                    if (element) {
                        if (element.type === "checkbox") {
                            element.checked = value2;
                        } else if (element.type === "range" || element.type === "color" || element.type === "select-one") {
                            element.value = value2;
                        } else if (element.type === "button") {
                            console.debug(`Button element: ${id}_${key}_${key2}`);
                        }
                    }
                });
            } else {
                // Handle direct properties of elements
                const element = document.getElementById(`${id}_${key}`);
                if (element) {
                    if (element.type === "checkbox") {
                        element.checked = value;
                    } else if (element.type === "range" || element.type === "color" || element.type === "select-one") {
                        element.value = value;
                    } else if (element.type === "button") {
                        console.debug(`Button element: ${id}_${key}`);
                    }
                }
            }
        });
    });

    refreshEye();
    refreshEyebrows();
    refreshMouth();
    updateBackgroundColor();
    refreshTime();
    refreshKeyFrameMarkers(); 
}

/**
 * Toggles visibility of facial components based on checkbox inputs.
 * @param {string} component - Name of the component ("Mouth" or "Brows").
 */
function toggleComponentVisibility(component) {
    const currentFrame = paramsTime["Time"];
    if (component === "Mouth") {
        const isChecked = document.getElementById("Toggle_Mouth").checked;
        paramsFace.Frames[currentFrame].Mouth.Enabled = isChecked;
        paramsFace.Frames[currentFrame].Mouth.Tongue.Enabled = isChecked;
        updateMouthVisibility();
    } else if (component === "Brows") {
        const isChecked = document.getElementById("Toggle_Brows").checked;
        paramsFace.Frames[currentFrame].BrowLeft.Enabled = isChecked;
        paramsFace.Frames[currentFrame].BrowRight.Enabled = isChecked;
        updateEyebrowVisibility("BrowLeft");
        updateEyebrowVisibility("BrowRight");
    }
}




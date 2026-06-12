// This file manages keyframe timeline control, undo/redo logic, animation states and interactions
// between user input and model parameters.

paramsTime = {
    "Status": "pause",
    "Time": 0,
    getTime: function() {
        return this.Time;
    },
    setTime: function(time) {
        changeModelOnTime(paramsTime["Time"])
        this.Time = time;
    }
}

let undoStack = [];
let isChanging = false;
let lastChange = {}; // Stores the last value per element to avoid duplicates

/**
 * Saves the current state of an input element before it changes,
 * used for undo functionality.
 * @param {Event|HTMLElement} input - The input element or event object triggering the change.
 */
function saveStateForUndo(input) {
    let element = input;

    if (input instanceof Event) {
        element = input.target;
    }

    if (!element || !element.id) return;

    const currentFrame = paramsTime["Time"];
    const frame = paramsFace["Frames"][currentFrame];
    if (!paramsFace["Frames"][currentFrame]) return;

    const keyInfo = element.id.split("_");
    if (keyInfo.length < 2) return;

    let section = keyInfo[0];  
    let param = keyInfo.slice(1).join(".");  

    if (param === "GlobalCurvature") {  // Special case: GlobalCurvature - also save all derived values
        const frame = paramsFace["Frames"][currentFrame];
        const sectionParams = frame[section];
    
        const derivedParams = ["Curvature1", "Curvature2", "Curvature3", "Curvature4", 
                               "Roundness1", "Roundness2", "Roundness3", "Roundness4"];
    
        if (!lastChange[section]) lastChange[section] = {};
    
        derivedParams.forEach(derived => {
            if (!(derived in lastChange[section])) {
                lastChange[section][derived] = sectionParams[derived];
            }
        });
    }

    if ((section === "EyeLeft" || section === "EyeRight") &&
        param === "GlobalCurvature" &&
        frame[section]["Iris"]["Mimic"]) {

        if (!lastChange[section]) lastChange[section] = {};
        if (!lastChange[section]["Iris"]) lastChange[section]["Iris"] = {};

        ["Curvature1", "Curvature2", "Curvature3", "Curvature4",
        "Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(key => {
            if (!(key in lastChange[section]["Iris"])) {
                lastChange[section]["Iris"][key] = frame[section]["Iris"][key];
            }
        });
        }

    let isNested = param.includes(".");  // Check if this is a nested element like "Iris.TranslateX"

    if (isNested) {
        let [nestedParent, nestedParam] = param.split("."); 

        if (!(nestedParent in paramsFace["Frames"][currentFrame][section])) return;

        if (!lastChange[section]) {
            lastChange[section] = {};
        }
        if (!lastChange[section][nestedParent]) {
            lastChange[section][nestedParent] = {};
        }
        if (!(nestedParam in lastChange[section][nestedParent])) {
            lastChange[section][nestedParent][nestedParam] = paramsFace["Frames"][currentFrame][section][nestedParent][nestedParam];
        }
    } else {
        if (!(param in paramsFace["Frames"][currentFrame][section])) return;

        if (!lastChange[section]) {
            lastChange[section] = {};
        }
        if (!(param in lastChange[section])) {
            lastChange[section][param] = paramsFace["Frames"][currentFrame][section][param]; 
        }
    }

    isChanging = true;
}

/**
 * Commits a stored change from saveStateForUndo into the undo stack.
 * @param {Event|HTMLElement} input - The input element or event object completing the change.
 */
function commitUndoState(input) {
    if (!isChanging || Object.keys(lastChange).length === 0) return;

    let element = input;
    if (input instanceof Event) {
        element = input.target;
    }

    if (!element || !element.id) return;

    const currentFrame = paramsTime["Time"];
    const keyInfo = element.id.split("_");

    if (keyInfo.length < 2) return;

    let section = keyInfo[0];
    let param = keyInfo.slice(1).join(".");
    let isNested = param.includes(".");
    const groupId = Date.now(); 

    const pushEntry = (entry) => {
        entry.groupId = groupId;
        undoStack.push(entry);
    };

    if (isNested) {
        let [nestedParent, nestedParam] = param.split(".");
        if (!(nestedParent in paramsFace["Frames"][currentFrame][section])) return;

        pushEntry({
            frame: currentFrame,
            section: section,
            nestedParent: nestedParent,
            param: nestedParam,
            oldValue: lastChange[section][nestedParent][nestedParam],
            newValue: paramsFace["Frames"][currentFrame][section][nestedParent][nestedParam],
            mirrorActive: paramsFace["Frames"][currentFrame][section]["Mirror"] || false,
            isNested: true
        });
    } else {
        if (!(param in paramsFace["Frames"][currentFrame][section])) return;

        pushEntry({
            frame: currentFrame,
            section: section,
            param: param,
            oldValue: lastChange[section][param],
            newValue: paramsFace["Frames"][currentFrame][section][param],
            mirrorActive: paramsFace["Frames"][currentFrame][section]["Mirror"] || false,
            isNested: false
        });

        if (param === "GlobalCurvature") {
            const derivedParams = ["Curvature1", "Curvature2", "Curvature3", "Curvature4",
                                   "Roundness1", "Roundness2", "Roundness3", "Roundness4"];

            derivedParams.forEach(derived => {
                if (lastChange[section]?.[derived] !== undefined) {
                    pushEntry({
                        frame: currentFrame,
                        section: section,
                        param: derived,
                        oldValue: lastChange[section][derived],
                        newValue: paramsFace["Frames"][currentFrame][section][derived],
                        mirrorActive: paramsFace["Frames"][currentFrame][section]["Mirror"] || false,
                        isNested: false
                    });
                }
            });
        }

        if ((section === "EyeLeft" || section === "EyeRight") &&
        param === "GlobalCurvature" &&
        paramsFace["Frames"][currentFrame][section]["Iris"]["Mimic"]) {

        const irisParams = paramsFace["Frames"][currentFrame][section]["Iris"];
        const irisLast = lastChange[section]?.Iris || {};

        ["Curvature1", "Curvature2", "Curvature3", "Curvature4",
        "Roundness1", "Roundness2", "Roundness3", "Roundness4"].forEach(key => {
            if (irisLast[key] !== undefined) {
                undoStack.push({
                    frame: currentFrame,
                    section: section,
                    nestedParent: "Iris",
                    param: key,
                    oldValue: irisLast[key],
                    newValue: irisParams[key],
                    mirrorActive: paramsFace["Frames"][currentFrame][section]["Mirror"] || false,
                    isNested: true,
                    groupId: groupId
                });
            }
        });
        }
    }

    if (undoStack.length > 50) {
        undoStack.shift();
    }

    lastChange = {};
    isChanging = false;
}

/**
 * Restores the last committed change from the undo stack.
 */
function undoLastChange() {
    if (undoStack.length === 0) {
        console.warn("No previous state available.");
        return;
    }

    const last = undoStack.pop();
    const groupId = last.groupId;
    const groupedChanges = [last, ...undoStack.filter(change => change.groupId === groupId)];

    undoStack = undoStack.filter(change => change.groupId !== groupId);

    const currentFrame = last.frame;

    groupedChanges.forEach(change => {
        if (!paramsFace["Frames"][currentFrame][change.section]) return;

        if (
            (change.section === "Mouth" && (change.param?.startsWith("Curvature") || change.param?.startsWith("Roundness") || change.param === "GlobalCurvature")) ||
            (change.section === "Mouth" && change.nestedParent === "Tongue")
        ) {
            paramsFace["Frames"][currentFrame]["Mouth"]["Tongue"]["Mimic"] = false;
        }

        if (
            (change.section.startsWith("Eye") && (change.param?.startsWith("Curvature") || change.param?.startsWith("Roundness") || change.param === "GlobalCurvature")) ||
            (change.section.startsWith("Eye") && change.nestedParent === "Iris")
        ) {
            paramsFace["Frames"][currentFrame][change.section]["Iris"]["Mimic"] = false;
        }

        if (change.isNested) {
            paramsFace["Frames"][currentFrame][change.section][change.nestedParent][change.param] = change.oldValue;
        } else {
            paramsFace["Frames"][currentFrame][change.section][change.param] = change.oldValue;
        }

        if (change.mirrorActive) {
            const mirroredSection = getMirroredSection(change.section);
            if (mirroredSection && paramsFace["Frames"][currentFrame][mirroredSection]) {
                let mirroredValue = change.oldValue;

                const mirrorKeys = ["TranslateX", "Rotation"];
                if (!change.isNested && mirrorKeys.includes(change.param)) {
                    mirroredValue = -mirroredValue;
                }

                if (change.isNested) {
                    paramsFace["Frames"][currentFrame][mirroredSection][change.nestedParent][change.param] = mirroredValue;
                } else {
                    paramsFace["Frames"][currentFrame][mirroredSection][change.param] = mirroredValue;
                }

                syncSliders(mirroredSection, change.param);
            }
        }

        syncSliders(change.section, change.param);

    });

    refreshEye();
    refreshMouth();
    refreshEyebrows();
    refreshTime();
}

/**
 * Synchronizes an HTML input slider to match the model's current parameter value.
 * @param {string} section - The model section name (e.g., "EyeLeft").
 * @param {string} param - The parameter name (e.g., "TranslateX").
 */
function syncSliders(section, param) {
    const slider = document.getElementById(`${section}_${param}`);
    if (slider) {
        slider.value = paramsFace["Frames"][paramsTime["Time"]][section][param];
    }
}

/**
 * Clears the undo history and resets change tracking.
 */
function resetUndoStack() {
    undoStack = [];
    lastChangedValues = {};
    isChanging = false;
    console.log("Undo-Stack zurückgesetzt, da Keyframe gewechselt wurde.");
}

/**
 * Returns the mirrored section name for symmetry operations.
 * @param {string} section - Original section name.
 * @returns {string|null} - Mirrored section name or null if none.
 */
function getMirroredSection(section) {
    if (section === "EyeLeft") return "EyeRight";
    if (section === "EyeRight") return "EyeLeft";
    if (section === "BrowLeft") return "BrowRight";
    if (section === "BrowRight") return "BrowLeft";
    return null;
}

/**
 * Handles time and keyframe control through input changes (slider, number, checkbox).
 * @param {HTMLElement} obj - The UI element triggering the change.
 */
function frameChange(obj) {
    var newValue = "-1";
    if (obj.type == "range" || obj.type == "number") {
        newValue = parseFloat(obj.value);
    } else if (obj.type == "checkbox") {
        newValue = obj.checked;
    } else if (obj.type == "select-one" || obj.type == "color") {
        newValue = obj.value;
    }

    if (obj.id == "InputCurrentTime") {
        paramsTime.setTime(newValue);
    } else if (obj.id == "SettingsTimeMax") {
       
    } else if (obj.id == "time") {
        paramsTime.setTime(newValue);
        setCurrentKeyFrame();
    } else {
        console.warn("Input not handled:", obj.id, obj.type, newValue);
    }
}

/**
 * Returns the currently active keyframe.
 * @returns {number} - Current keyframe index.
 */
function getActiveKeyFrame() {
    return paramsTime["Time"];
}

/**
 * Activates a given keyframe and prepares the undo stack.
 * @param {number|null} keyframe - Frame index to activate, or null to reuse current.
 */
function setActiveKeyFrame(keyframe) {
    resetUndoStack(); 

    if (keyframe == null) {
        paramsTime.setTime(paramsTime["Time"]);
        paramsFace["Frames"][paramsTime["Time"]]["IsKeyFrame"] = true;
    } else {
        paramsTime.setTime(keyframe);
    }

    if (!Object.keys(paramsFace["Frames"]).includes(paramsTime["Time"])) {
        // Create a new keyframe if it does not exist
        createModelForNewKeyFrame(paramsTime["Time"]);
    } else if (paramsTime["Time"] !== keyframe) {
        if (paramsFace["Frames"][keyframe]) {
            paramsFace["Frames"][paramsTime["Time"]] = JSON.parse(JSON.stringify(paramsFace["Frames"][keyframe]));
            delete paramsFace["Frames"][keyframe]; 
        }
    }

    paramsFace["Frames"][paramsTime["Time"]]["IsKeyFrame"] = true;

    refreshKeyFrameMarkers(); 
    highlightKeyFrame(paramsTime["Time"]); 
}

/**
 * Activates a keyframe selected from the timeline.
 * @param {HTMLElement} obj - The timeline marker element.
 */
function setAsActiveKeyFrame(obj) {
    const clickedKeyFrame = parseInt(obj.id.split("-")[1]);

    if (!paramsFace["Frames"][clickedKeyFrame]) {
        console.warn(`Keyframe ${clickedKeyFrame} existiert nicht.`);
        return;
    }

    paramsTime.setTime(clickedKeyFrame);
    refreshTime();

    setActiveKeyFrame(clickedKeyFrame);
}

/**
 * Updates the time input field to match the internal state.
 */
function setCurrentKeyFrame() {
    const inputElement = document.getElementById("InputCurrentTime");

    if (inputElement) {
        inputElement.value = paramsTime["Time"];
    } else {
        console.warn("InputCurrentTime Element nicht gefunden.");
    }
}

/**
 * Steps forward/backward by a number of frames and loads appropriate model.
 * @param {number} value - Frame step offset (+1 or -1).
 */
async function frameChangeFrameStep(value) {
    const newTime = Number(paramsTime["Time"]) + Number(value); // Ensure that newTime is a number

    // Check whether newTime is within the valid limits
    if (newTime < 0 || newTime >= paramsFace["Settings"]["TimeMax"]) {
        console.warn("Frame out of bounds:", newTime);
        stopAnimation();
        return;
    }

    await createFramesFromKeyFrames(); // Interpolate frames

    // Check and set frame
    if (paramsFace["Frames"].hasOwnProperty(newTime)) {
        paramsTime.setTime(newTime);
    } else {
        console.warn("Frame does not exist at time:", newTime);
        stopAnimation();
    }

    refreshTime();
}

// Keyframe navigation via keyboard shortcuts (space, left, right)
document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        frameToggleAnimation();
    } else if (e.keyCode == 37){
        frameChangeFrameStep(-1);
    } else if (e.keyCode == 39){
        frameChangeFrameStep(1);
    }
    setCurrentKeyFrame();
}

/**
 * Deletes the currently active keyframe from model and UI.
 */
async function deleteKeyframe() {
    const currentKeyframe = paramsTime["Time"];

    // Prevent deletion when only one keyframe is left
    if (Object.keys(paramsFace["Frames"]).length <= 1) {
        alert("You cannot delete the only existing keyframe.");
        return;
    }

    if (currentKeyframe in paramsFace["Frames"]) {
        delete paramsFace["Frames"][currentKeyframe]; // delete Keyframe
        console.log(`Keyframe ${currentKeyframe} deleted.`);

        // Remove the marker from the timeline
        const marker = document.getElementById(`rec-${currentKeyframe}`);
        if (marker) marker.remove();

        // Select the next or previous keyframe as active
        const remainingFrames = Object.keys(paramsFace["Frames"]).map(Number).sort((a, b) => a - b);
        const closestFrame = remainingFrames.find(frame => frame > currentKeyframe) || remainingFrames[0];
        paramsTime["Time"] = closestFrame;

        console.log(`New active keyframe: ${paramsTime["Time"]}`);

        // Update Frames and UI
        createFramesFromKeyFrames(); // Regenerate frames
        initializeAllFrames(); // Make sure that all frames are fully initialized
        refreshKeyFrameMarkers(); // Synchronize marker 
        refreshSettings(); // Update UI
        refreshTime(); // Update timeline
        highlightKeyFrame(paramsTime["Time"]); // Highlight active keyframe
    } else {
        alert("Keyframe does not exist.");
    }
}

/**
 * Ensures all frames in paramsFace.Frames are initialized correctly.
 */
function initializeAllFrames() {
    Object.keys(paramsFace["Frames"]).forEach(key => {
        paramsFace["Frames"][key] = initializeFrame(paramsFace["Frames"][key]);
    });
    console.log("All frames initialized:", paramsFace["Frames"]);
}

/**
 * Refreshes keyframe markers in the UI and rebinds event listeners.
 */
function refreshKeyFrameMarkers() {
    // Remove all existing markers
    document.querySelectorAll('.rectangle').forEach(rectangle => rectangle.remove());

    // Create markers for all keyframes
    Object.keys(paramsFace["Frames"]).forEach(key => {
        if (paramsFace["Frames"][key]["IsKeyFrame"]) {
            createKeyFrameMarker(Number(key));
        }
    });

    document.querySelectorAll('.rectangle').forEach(keyframe => {
        keyframe.addEventListener('mousedown', (event) => {
            selectedKeyframe = event.target;
            initialTime = parseInt(selectedKeyframe.id.split("-")[1]);
            document.addEventListener('mousemove', moveKeyframe);
            document.addEventListener('mouseup', dropKeyframe);
        });
    });
}

/**
 * Initializes a frame object with default parameters for all facial parts.
 * @param {Object} frame - The frame object to initialize.
 * @returns {Object} - Fully initialized frame object.
 */
function initializeFrame(frame) {
    if (!frame) {
        frame = {};
    }

    // Initialize Settings
    frame["Settings"] = frame["Settings"] || {};
    frame["Settings"]["BackgroundColor"] = frame["Settings"]["BackgroundColor"] || '#ffffff'; // Default color
    frame["Settings"]["Size"] = frame["Settings"]["Size"] || { Width: 1000, Height: 700 };

    // Initialize EyeLeft
    frame["EyeLeft"] = frame["EyeLeft"] || {};
    frame["EyeLeft"]["Iris"] = frame["EyeLeft"]["Iris"] || {};
    frame["EyeLeft"]["Enabled"] = frame["EyeLeft"]["Enabled"] ?? true;
    frame["EyeLeft"]["ColorFill"] = frame["EyeLeft"]["ColorFill"] || "#000000";
    frame["EyeLeft"]["ColorStroke"] = frame["EyeLeft"]["ColorStroke"] || "#000000";
    frame["EyeLeft"]["Rotation"] = frame["EyeLeft"]["Rotation"] || 0;

    // Initialize EyeRight
    frame["EyeRight"] = frame["EyeRight"] || {};
    frame["EyeRight"]["Iris"] = frame["EyeRight"]["Iris"] || {};
    frame["EyeRight"]["Enabled"] = frame["EyeRight"]["Enabled"] ?? true;
    frame["EyeRight"]["ColorFill"] = frame["EyeRight"]["ColorFill"] || "#000000";
    frame["EyeRight"]["ColorStroke"] = frame["EyeRight"]["ColorStroke"] || "#000000";
    frame["EyeRight"]["Rotation"] = frame["EyeRight"]["Rotation"] || 0;

    // Initialize Mouth
    frame["Mouth"] = frame["Mouth"] || {};
    frame["Mouth"]["Tongue"] = frame["Mouth"]["Tongue"] || {};
    frame["Mouth"]["Enabled"] = frame["Mouth"]["Enabled"] ?? true;
    frame["Mouth"]["ColorFill"] = frame["Mouth"]["ColorFill"] || "#FF0000";
    frame["Mouth"]["ColorStroke"] = frame["Mouth"]["ColorStroke"] || "#000000";

    // Initialize Tongue
    frame["Mouth"]["Tongue"] = frame["Mouth"]["Tongue"] || {};
    frame["Mouth"]["Tongue"]["Mimic"] = frame["Mouth"]["Tongue"]["Mimic"] ?? false;
    frame["Mouth"]["Tongue"]["Enabled"] = frame["Mouth"]["Tongue"]["Enabled"] ?? true;
    frame["Mouth"]["Tongue"]["TranslateX"] = frame["Mouth"]["Tongue"]["TranslateX"] || 0;
    frame["Mouth"]["Tongue"]["TranslateY"] = frame["Mouth"]["Tongue"]["TranslateY"] || 0;
    frame["Mouth"]["Tongue"]["ScaleX"] = frame["Mouth"]["Tongue"]["ScaleX"] || 1;
    frame["Mouth"]["Tongue"]["ScaleY"] = frame["Mouth"]["Tongue"]["ScaleY"] || 1;

    // Initialize EyebrowLeft 
    frame["BrowLeft"] = frame["BrowLeft"] || {};
    frame["BrowLeft"]["Enabled"] = frame["BrowLeft"]["Enabled"] ?? true;
    frame["BrowLeft"]["Mirror"] = frame["BrowLeft"]["Mirror"] ?? false;
    frame["BrowLeft"]["TranslateX"] = frame["BrowLeft"]["TranslateX"] || 0;
    frame["BrowLeft"]["TranslateY"] = frame["BrowLeft"]["TranslateY"] || -50;
    frame["BrowLeft"]["ScaleX"] = frame["BrowLeft"]["ScaleX"] || 1;
    frame["BrowLeft"]["ScaleY"] = frame["BrowLeft"]["ScaleY"] || 1;


    // Initialize EyebrowRight 
    frame["BrowRight"] = frame["BrowRight"] || {};
    frame["BrowRight"]["Enabled"] = frame["BrowRight"]["Enabled"] ?? true;
    frame["BrowRight"]["TranslateX"] = frame["BrowRight"]["TranslateX"] || 0;
    frame["BrowRight"]["TranslateY"] = frame["BrowRight"]["TranslateY"] || -50;
    frame["BrowRight"]["ScaleX"] = frame["BrowRight"]["ScaleX"] || 1;
    frame["BrowRight"]["ScaleY"] = frame["BrowRight"]["ScaleY"] || 1;
    


    return frame;
}

/**
 * Adds "IsKeyFrame" property to all frames.
 */
function addKeyFrameFlags() {
    Object.keys(paramsFace["Frames"]).forEach(key => {
        const frame = paramsFace["Frames"][key];
        frame["IsKeyFrame"] = frame["IsKeyFrame"] ?? true; // Mark as keyframe
    });
}

/**
 * Starts or pauses playback of the animation sequence.
 */
async function frameToggleAnimation() {
    await createFramesFromKeyFrames();
    document.getElementById("time").classList.remove("active");

    if (paramsTime["Status"] === "pause") {
        paramsTime["Status"] = "play";
        document.getElementById("playButton").innerHTML = "❚❚";

        if (paramsTime["Time"] === 0) {
            updateBackgroundColor();
            loadModel(0, paramsFace);
        }

        timerClock();
    } else {
        paramsTime["Status"] = "pause";
        document.getElementById("playButton").innerHTML = "▶";

        // If Time is set to Max, show the end face correctly
        if (paramsTime["Time"] >= paramsFace["Settings"]["TimeMax"]) {
            paramsTime.setTime(paramsFace["Settings"]["TimeMax"]);
            refreshTime();
        }
    }
    updateFrameTime();
}

/**
 * Stops the animation playback.
 */
function stopAnimation() {
    paramsTime["Status"] = "pause"; // Stop animation
    document.getElementById("playButton").innerHTML = "▶"; // Update play button status
    refreshTime(); // Update timeline slider
}

/**
 * Resets the animation to frame 0 and updates the UI.
 */
function restartAnimation() {
    paramsTime["Status"] = "pause"; // Stop animation
    paramsTime.setTime(0); // Reset to frame 0
    refreshTime(); // Update slider
    updateBackgroundColor(); // Ensure background is updated
    loadModel(0, paramsFace); // Load the first frame
    document.getElementById("playButton").innerHTML = "▶"; // Update play button status
}

/**
 * Updates the visual state of the play button.
 */
function updateFrameTime(){
    if (paramsTime["Status"] == "pause" && document.getElementById("playButton").innerHTML != "▶" ){
        document.getElementById("playButton").innerHTML = "▶";
    } else if (paramsTime["Status"] == "play" && document.getElementById("playButton").innerHTML != "❚❚" ){
        document.getElementById("playButton").innerHTML = "❚❚";
    }
    setCurrentKeyFrame();
}

/**
 * Syncs UI time slider and updates play button state.
 */
function refreshTime(){
    document.getElementById("time").value = paramsTime["Time"];
    updateFrameTime();
}

/**
 * Creates a visual marker for a keyframe on the timeline.
 * @param {number} newKeyFrame - Frame index to mark.
 */
function createKeyFrameMarker(newKeyFrame) {
    const maxValue = Number(paramsFace["Settings"]["TimeMax"]);
    const sliderContainer = document.querySelector('.slider-container');
    const sliderWidth = sliderContainer.clientWidth;

    const position = newKeyFrame;
    // Calculate the left position based on percentage
    const leftPosition = (Number(position) / maxValue) * 100; // Convert to percentage
    // Prevent duplicate markers
    if (document.getElementById(`rec-${newKeyFrame}`)) return;

    // Create a new rectangle div
    const rectangle = document.createElement('div');
    rectangle.className = 'rectangle';
    rectangle.id = `rec-${newKeyFrame}`;
    rectangle.setAttribute("onclick", "setAsActiveKeyFrame(this)");
    rectangle.style.left = `${leftPosition}%`; // Set the left position
    sliderContainer.appendChild(rectangle); // Append to the slider container
}

/**
 * Visually highlights the currently active keyframe.
 * @param {number} activeKeyFrame - Frame index to highlight.
 */
function highlightKeyFrame(activeKeyFrame) {
    const rectangles = document.querySelectorAll('.rectangle');
    rectangles.forEach(rectangle => {
        rectangle.classList.remove('active'); // Remove active class from all rectangles
        if (rectangle.id.split("-")[1] == activeKeyFrame) {
            rectangle.classList.add('active'); // Add active class to the matching rectangle
        }
    });
}

/**
 * Animates forward in time, advancing frames based on speed setting.
 */
function timerClock() {
    if (paramsTime["Status"] === "play") {
        const delay = 1000 / paramsFace["Settings"]["TimeSpeed"];
        const maxFrame = paramsFace["Settings"]["TimeMax"] - 1;

        if (paramsTime["Time"] < maxFrame) {
            frameChangeFrameStep(1); // Move to the next frame
        } else {
            stopAnimation(); // Stop at the last frame
        }

        setTimeout(timerClock, delay);
    }
}

// Drag and drop handling for keyframe repositioning
let selectedKeyframe = null;
let initialTime = null;

document.querySelectorAll('.rectangle').forEach(keyframe => {
    keyframe.addEventListener('mousedown', (event) => {
        selectedKeyframe = event.target;
        initialTime = parseInt(selectedKeyframe.id.split("-")[1]);
        document.addEventListener('mousemove', moveKeyframe);
        document.addEventListener('mouseup', dropKeyframe);
    });
});

/**
 * Updates position of a keyframe during drag.
 * @param {MouseEvent} event
 */
function moveKeyframe(event) {
    if (!selectedKeyframe) return;

    const sliderContainer = document.querySelector('.slider-container');
    const rect = sliderContainer.getBoundingClientRect();
    const maxFrames = paramsFace["Settings"]["TimeMax"];

    let newTime = Math.round(((event.clientX - rect.left) / rect.width) * maxFrames);

    newTime = Math.max(0, Math.min(maxFrames - 1, newTime));

    selectedKeyframe.style.left = `${(newTime / maxFrames) * 100}%`;
}

/**
 * Finalizes new position for a dragged keyframe.
 * @param {MouseEvent} event
 */
function dropKeyframe(event) {
    if (!selectedKeyframe) return;

    document.removeEventListener('mousemove', moveKeyframe);
    document.removeEventListener('mouseup', dropKeyframe);

    const sliderContainer = document.querySelector('.slider-container');
    const rect = sliderContainer.getBoundingClientRect();
    const maxFrames = paramsFace["Settings"]["TimeMax"];
    let newTime = Math.round(((event.clientX - rect.left) / rect.width) * maxFrames);

    newTime = Math.max(0, Math.min(maxFrames - 1, newTime));

    if (newTime === initialTime) {
        selectedKeyframe = null;
        return;
    }

    if (paramsFace["Frames"][newTime] && paramsFace["Frames"][newTime]["IsKeyFrame"] !== true) {
        console.warn(`Frame ${newTime} ist KEIN Keyframe. Setze es jetzt als Keyframe.`);
        paramsFace["Frames"][newTime]["IsKeyFrame"] = true;
    }

    if (paramsFace["Frames"][newTime] && paramsFace["Frames"][newTime]["IsKeyFrame"] === true) {
        console.warn(`Keyframe bei ${newTime} wird überschrieben.`);
        delete paramsFace["Frames"][newTime];
    }

    if (paramsFace["Frames"][initialTime] && paramsFace["Frames"][initialTime]["IsKeyFrame"] === true) {
        const copiedFrame = JSON.parse(JSON.stringify(paramsFace["Frames"][initialTime]));
        paramsFace["Frames"][newTime] = initializeFrame(copiedFrame); 
        paramsFace["Frames"][newTime]["IsKeyFrame"] = true;
        delete paramsFace["Frames"][initialTime];
    }

    paramsTime.setTime(newTime);
    selectedKeyframe.style.left = `${(newTime / maxFrames) * 100}%`;
    selectedKeyframe.id = `rec-${newTime}`;

    refreshKeyFrameMarkers();
    highlightKeyFrame(newTime);
    refreshSettings(); 

    selectedKeyframe = null;
}

createKeyFrameMarker(0); // Initialize first keyframe marker on page load

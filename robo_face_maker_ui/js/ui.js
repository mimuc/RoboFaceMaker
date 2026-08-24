/*
 * This file handles the generation and management of dynamic UI components
 * for facial parameter manipulation within the Robo Face Generator.
 */

/**
 * Retrieves a translated label for a given nested parameter key path.
 * Falls back to concatenated key string if no translation is available.
 * @param {string[]} keys - Array of key strings indicating the hierarchy.
 * @returns {string} - Translated name or joined key string.
 */
function getTranslation(keys) {
    let translation = nameMapping;
    keys.forEach(key => {
        translation = translation[key];
    });
    if (translation == undefined){
        console.warn("No translation for ", keys.join("_"));
        return keys.join("_");
    } else {
        return translation;
    }
}

/**
 * Retrieves a static UI label translation.
 * @param {string} key - The key for the static translation.
 * @returns {string} - Translated static label.
 */
function getStaticTranslation(key) {
    if (nameMapping["STATIC"][key] == undefined){
        console.warn("No translation for ", key);
        return key;
    }
    return nameMapping["STATIC"][key];
}

/**
 * Creates an HTML element with specified attributes and optional inner content.
 * @param {string} tag - The HTML tag for the element to create (e.g., 'div', 'input').
 * @param {Object} attributes - Key-value pairs of attributes to set on the element.
 * @param {string} [content] - Optional inner HTML content to set within the element.
 * @returns {HTMLElement} - The created HTML element with specified attributes and content.
 */
function createElement(tag, attributes, content) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (content) element.innerHTML = content;
    return element;
}

/**
 * Generates a control input element based on the provided data type and settings.
 * @param {string} info - The data model object containing the control type and settings.
 * @param {string[]} keys - Array of strings representing the hierarchy of keys in the data model.
 * @returns {HTMLElement} - The created control input element.
 */
function generateControl(info, keys) {
    const fullKey = keys.join('_');
    let input;
    switch (info["type"]) {
        case 'checkbox':
            input = createElement('input', {
                type: 'checkbox',
                id: fullKey,
                onchange: `changeValue(this)`,
                onclick: `changeValue(this)`,
                class: 'form-check-input' 
            });
            break;
            case 'button':
                // Decides which function is called based on the second level of the key
                input = createElement('button', {
                    id: fullKey,
                    onclick: keys[1] === "Iris" ? `updateEyeIrisMimic('${keys[0]}')` : (keys[1] === "Tongue" ? `updateTongueMimic()` : `console.warn('Unknown Mimic Button')`),
                    class: 'btn btn-primary'
                }, "Mimic to Parent");
                break;           
        case 'color':
            input = createElement('input', {
                type: 'color',
                id: fullKey,
                onchange: `changeValue(this)`,
                oninput: `changeValue(this)`,
                class: 'form-control form-control-color form-control-color-custom'
            });
            break;
        case 'range':

            if (info["min"] == undefined) {
                console.error("No default UI for ", keys, "min");
            } 

            if (info["max"] == undefined) {
                console.error("No default UI for ", keys, "max");
            } 

            if (info["step"] == undefined) {
                console.error("No default UI for ", keys, "step");
            } 

            input = createElement('input', {
                type: 'range',
                id: fullKey,
                min: info["min"],
                max: info["max"],
                step: info["step"],
                onchange: `changeValue(this)`,
                oninput: `changeValue(this)`,
                class : "form-range"
            });
            break;
        case 'dropdown':
            input = createElement('select', {
                id: fullKey,
                onchange: `applyPreset(event.target.value)`,
                class: 'form-select'
            });
    
            // Add options dynamically
            info["options"].forEach(option => {
                const optionElement = createElement('option', { value: option }, option);
                input.appendChild(optionElement);
            });
            break;    
        default:
            input = document.createTextNode(value);
    }
    return input;
}


/**
 * Recursively generates a menu structure based on a data model and mapping, appending it to a container.
 * @param {HTMLElement} container - The container element to which the menu structure will be appended.
 * @param {Object} data - The data model containing menu items and settings.
 * @param {string[]} [keys=[]] - Array of strings representing the hierarchy of keys in the data model.
 * @param {number} [depth=0] - The current depth level of the menu hierarchy.
 */
function generateMenu(container, data, keys = [], depth = 0) {
    // Sortiere Keys: "Enabled" kommt immer zuerst
    const sortedKeys = Object.keys(data).sort((a, b) => {
        if (a === "Enabled") return -1;
        if (b === "Enabled") return 1;
        return 0;
    });

    sortedKeys.forEach(key => {
        if (key === "IsKeyFrame" || key === "IsMenu") {
            return;
        }

        const value = data[key];
        let fullKey = keys.length > 0 ? `${keys.join('_')}_${key}` : key;
        keys.push(key);

        if (data[key]?.IsMenu === "true") {
            const accordionId = `${fullKey}_Accordion`;
            const accordionItemId = `${fullKey}_AccordionItem`;
            const accordionButtonId = `${fullKey}_AccordionButton`;
            const accordionBodyId = `${fullKey}_AccordionBody`;

            const nestedAccordion = createElement('div', { class: 'accordion', id: accordionId });
            const accordionItem = createElement('div', { class: 'accordion-item', id: accordionItemId });
            const accordionButton = createElement('button', {
                class: 'accordion-button collapsed',
                id: `${fullKey}_Header`,
                type: 'button',
                'data-bs-toggle': 'collapse',
                'data-bs-target': `#${accordionBodyId}`,
                'aria-expanded': 'false',
                'aria-controls': accordionBodyId
            }, getTranslation([...keys, "NAME"]));

            const accordionBody = createElement('div', {
                id: accordionBodyId,
                class: 'accordion-collapse collapse',
                'aria-labelledby': `${fullKey}_Header`
            });

            const accordionBodyContainer = createElement('div', { class: 'accordion-body', id: `${fullKey}_Container` });

            // Combine accordion elements
            accordionBody.appendChild(accordionBodyContainer);
            accordionItem.appendChild(accordionButton);
            accordionItem.appendChild(accordionBody);
            nestedAccordion.appendChild(accordionItem);
            container.appendChild(nestedAccordion);

            // Rekursiv aufbauen
            generateMenu(accordionBodyContainer, value, keys, depth + 1);

            keys.pop();
        } else {
            const displayName = getTranslation(keys);
            const controlWrapper = createElement('div', { class: 'form-group mb-3', id: `${fullKey}_Container` });

            // Label + Steuerung
            controlWrapper.appendChild(createElement('label', { for: fullKey, class: "form-label" }, displayName));
            const control = generateControl(value, keys);
            controlWrapper.appendChild(control);

            // Element in Container einfügen
            container.appendChild(controlWrapper);

            keys.pop();
        }
    });
}

// Initialization of the accordion structure
const sideAreaContainer = document.getElementById('sideArea');
// const accordionContainer = createElement('div', { class: 'accordion', id: 'sideAccordion' });
// sideAreaContainer.appendChild(accordionContainer);

// Generate menu structure
generateMenu(sideAreaContainer, paramsDefaultUI, []);

// Activating the tooltip
document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});


// Listen for save requests
window.addEventListener('message', (event) => {
    if (event.data.action === 'save') {
        const filename = event.data.filename;
        downloadJson(filename); // Pass the filename to downloadJson
        window.parent.postMessage({ action: 'saveConfirmed', filename }, '*');
    }
});

// Enable undo/redo support by saving changes on interaction
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[type="range"], input[type="color"], select').forEach(input => {
        input.addEventListener("mousedown", function (event) { saveStateForUndo(event); });
        input.addEventListener("mouseup", function (event) { commitUndoState(event); });
    });
});




/**
 * Opens the settings modal and populates it with current settings.
 */
function openSettingsPanel() {
    // Show the settings modal
    const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
    document.getElementById('SettingsPanelFaceWidth').value = paramsFace["Settings"]["Size"]["Width"] || 200;
    document.getElementById('SettingsPanelFaceHeight').value = paramsFace["Settings"]["Size"]["Height"] || 200;
    document.getElementById('SettingsPanelTimeMax').value = paramsFace["Settings"]["TimeMax"] || 100;
    document.getElementById('SettingsPanelTimeSpeed').value = paramsFace["Settings"]["TimeSpeed"] || 30;
    settingsModal.show();
}

/**
 * Closes the settings modal.
 */
function closeSettingsPanel() {
    // Close the settings modal
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    if (settingsModal) {
        settingsModal.hide();
    }
}

/** 
 * Save the current settings.
 */
function saveSettingsPanel() {
    // Get the values from the settings inputs
    const width = document.getElementById('SettingsPanelFaceWidth').value;
    const height = document.getElementById('SettingsPanelFaceHeight').value;
    console.log("Saving settings: ", width, height);
    // Update the paramsFace object with the new settings
    paramsFace["Settings"]["Size"]["Width"] = parseInt(width, 10) || 1000;
    paramsFace["Settings"]["Size"]["Height"] = parseInt(height, 10 ) || 500;
    document.getElementById('SettingsPanelFaceWidth').value = paramsFace["Settings"]["Size"]["Width"];
    document.getElementById('SettingsPanelFaceHeight').value = paramsFace["Settings"]["Size"]["Height"];

    paramsFace["Settings"]["TimeMax"] = parseInt(document.getElementById('SettingsPanelTimeMax').value, 10) || 100;
    document.getElementById("time").max = paramsFace["Settings"]["TimeMax"] - 1; 
    document.getElementById('SettingsPanelTimeMax').value = paramsFace["Settings"]["TimeMax"];

    paramsFace["Settings"]["TimeSpeed"] = parseInt(document.getElementById('SettingsPanelTimeSpeed').value, 10) || 30;
    document.getElementById('SettingsPanelTimeSpeed').value = paramsFace["Settings"]["TimeSpeed"];
    
    updateSettings();
    refreshEye();
    refreshMouth();
    refreshEyebrows();

}

function isMacOS() {
    if (navigator.userAgentData && navigator.userAgentData.platform) {
        return navigator.userAgentData.platform.toLowerCase().includes('mac');
    }
    // Fallback for older browsers
    return navigator.userAgent.toLowerCase().includes('mac');
}

document.addEventListener('DOMContentLoaded', () => {
    const shortcutLabel = document.getElementById('menuUndoShortcutLabel');
    shortcutLabel.textContent = isMacOS() ? '⌘Z' : 'Ctrl+Z';
});

document.addEventListener('keydown', function (e) {
    const isUndo =
        (e.ctrlKey && e.key.toLowerCase() === 'z') || // Ctrl+Z
        (e.metaKey && e.key.toLowerCase() === 'z');   // ⌘Z

    if (isUndo) {
        e.preventDefault(); // stop browser's default undo
        undoLastChange();
    }
});

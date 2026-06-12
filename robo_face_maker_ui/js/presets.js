/**
 * Initializes an empty container for temporary presets (session only).
 * Populated by `saveCurrentFrameAsPreset`.
 * @type {Object.<string, Object>}
 */
let tempPresets = {};

/**
 * Study-related identifiers, set via postMessage (e.g. for filename generation).
 * @type {string}
 */
let studyPID = "PID";
let studyTask = "Task";

/**
 * Handles external messages to set study IDs (e.g. for logging or filenames).
 */
window.addEventListener("message", (event) => {
    if (event.data.action === "setStudyInfo") {
        studyPID = event.data.pid || "PID";
        studyTask = event.data.task || "Task";
        console.log("Empfangen von StudyProcedure:", studyPID, studyTask);
    }
});

/**
 * Saves a temporary preset of the current keyframe and triggers the download of a JSON file.
 */
function saveCurrentFrameAsPreset() {
  const currentTime = paramsTime["Time"];
  const currentFrame = paramsFace["Frames"][currentTime];

  if (!currentFrame) {
      console.warn("Kein Keyframe gefunden.");
      return;
  }

  const presetName = prompt("Enter a name for the preset:");
  if (!presetName) {
      console.warn("Speichern abgebrochen.");
      return;
  }

  tempPresets[presetName] = JSON.parse(JSON.stringify(currentFrame));
  updatePresetDropdown();
  console.log(`Preset "${presetName}" erfolgreich gespeichert.`);

  const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
  const filename = `${studyPID}_${studyTask}_${presetName}_${timestamp}.json`;
  const jsonContent = JSON.stringify(currentFrame, null, 2);

  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  console.log(`Preset auch als Datei "${filename}" heruntergeladen.`);
}

/**
 * Updates the preset dropdown menu in the UI with both temporary and default presets.
 */
function updatePresetDropdown() {
  const presetDropdown = document.getElementById("Settings_PresetSelector");

  while (presetDropdown.firstChild) {
      presetDropdown.removeChild(presetDropdown.firstChild);
  }

  Object.keys(facePresets).forEach(presetName => {
      const option = document.createElement("option");
      option.value = presetName;
      option.textContent = presetName;
      presetDropdown.appendChild(option);
  });

  Object.keys(tempPresets).forEach(presetName => {
      const option = document.createElement("option");
      option.value = `temp-${presetName}`; 
      option.textContent = `${presetName} (Temp)`;
      presetDropdown.appendChild(option);
  });
}

/**
 * Applies a preset to the current keyframe. Supports both standard and temporary presets.
 * @param {string} selectedPreset - The name of the preset to apply.
 */
function applyPreset(selectedPreset) {
  console.log("applyPreset aufgerufen mit:", selectedPreset);
  console.log("Verfügbare tempPresets:", Object.keys(tempPresets));

  let preset;

  if (selectedPreset.startsWith("temp-")) {
      const name = selectedPreset.replace("temp-", "");
      console.log("Versuche temp preset zu laden:", name);
      preset = tempPresets[name];
  } else {
      preset = facePresets[selectedPreset];
  }

  if (!preset) {
      console.warn(`Preset "${selectedPreset}" nicht gefunden.`);
      return;
  }

  const currentFrame = paramsFace["Frames"][paramsTime["Time"]];

  if (preset.EyeLeft) {
      Object.assign(currentFrame.EyeLeft, preset.EyeLeft);
  }
  if (preset.EyeRight) {
      Object.assign(currentFrame.EyeRight, preset.EyeRight);
  }
  if (preset.Mouth) {
      Object.assign(currentFrame.Mouth, preset.Mouth);
  }
  if (preset.BrowLeft) {
      Object.assign(currentFrame.BrowLeft, preset.BrowLeft);
  }
  if (preset.BrowRight) {
      Object.assign(currentFrame.BrowRight, preset.BrowRight);
  }
  if (preset.Settings) {
      Object.assign(currentFrame.Settings, preset.Settings);
  }

  currentFrame["IsKeyFrame"] = true;

  refreshSettings();
  refreshEye();
  refreshMouth();
  refreshEyebrows();
  updateBackgroundColor();

  console.log(`Preset "${selectedPreset}" angewendet.`);
}

/**
 * Predefined presets with facial expressions (Neutral, Happy, Sad).
 * @type {Object.<string, Object>}
 */
const facePresets = {
    "Neutral": {
        "Settings": {
            "BackgroundColor": "#F2E6CF",
            "Size": {
              "Width": 1000,
              "Height": 700
            }
          },
          "BrowLeft": {
            "Enabled": true,
            "Mirror": false,
            "TranslateX": 35,  // Leicht nach außen versetzt
            "TranslateY": -40, // Position leicht über den Augen
            "ScaleX": 1.2,  // Etwas breiter für ausdrucksstarke Augenbrauen
            "ScaleY": 0.8,  // Flacher, um zur Augenform zu passen
            "Rotation": -5, // Leichte Neigung für natürliche Form
            "Curvature": 20, // Leichte Biegung für sanfte Krümmung
            "Thickness": 5,  // Passend zur Augenlinie, nicht zu dick
            "Length": 85, // Soll breiter als das Auge sein
            "ColorStroke": "#000000" // Schwarze Farbe für Kontrast
        },

        "BrowRight": {
            "Enabled": true,
            "TranslateX": 35,  // Spiegelung der linken Augenbraue
            "TranslateY": -40,
            "ScaleX": 1.2,
            "ScaleY": 0.8,
            "Rotation": 5,  // Spiegelung der linken Rotation
            "Curvature": 20,
            "Thickness": 5,
            "Length": 85,
            "ColorStroke": "#000000"
        },
          "EyeLeft": {
            "Enabled": true,
            "Mirror": false,
            "Rotation": 0,
            "TranslateX": 39,
            "TranslateY": 0,
            "ScaleX": 0.9,
            "ScaleY": 1.1999999999999997,
            "ColorFill": "#3C8AD3",
            "ColorStroke": "#000000",
            "StrokeWidth": 8,
            "GlobalCurvature": 20,
            "Curvature1": 16.91891891891892,
            "Curvature2": 20,
            "Curvature3": 16,
            "Curvature4": 20,
            "Roundness1": -4.878048780487804,
            "Roundness2": -4.878048780487804,
            "Roundness3": -4.878048780487804,
            "Roundness4": -4.878048780487804,
            "Iris": {
              "Enabled": true,
              "Mimic": true,
              "Rotation": 0,
              "TranslateX": 0,
              "TranslateY": 1.7837837837837835,
              "ScaleX": 1,
              "ScaleY": 1,
              "ColorFill": "#FFFFFF",
              "GlobalCurvature": 0,
              "Curvature1": 10.574324324324325,
              "Curvature2": 12.5,
              "Curvature3": 10,
              "Curvature4": 12.5,
              "Roundness1": -3.0487804878048776,
              "Roundness2": -3.0487804878048776,
              "Roundness3": -3.0487804878048776,
              "Roundness4": -3.0487804878048776
            }
          },
          "EyeRight": {
            "Enabled": true,
            "Rotation": 0,
            "TranslateX": 39,
            "TranslateY": 0,
            "ScaleX": 0.9,
            "ScaleY": 1.1999999999999997,
            "ColorFill": "#3C8AD3",
            "ColorStroke": "#000000",
            "StrokeWidth": 8,
            "GlobalCurvature": 20,
            "Curvature1": 16.91891891891892,
            "Curvature2": 20,
            "Curvature3": 16,
            "Curvature4": 20,
            "Roundness1": -4.878048780487804,
            "Roundness2": -4.878048780487804,
            "Roundness3": -4.878048780487804,
            "Roundness4": -4.878048780487804,
            "Iris": {
              "Enabled": true,
              "Mimic": true,
              "Rotation": 0,
              "TranslateX": 0,
              "TranslateY": 1.7837837837837835,
              "ScaleX": 1,
              "ScaleY": 1,
              "ColorFill": "#FFFFFF",
              "GlobalCurvature": 0,
              "Curvature1": 10.574324324324325,
              "Curvature2": 12.5,
              "Curvature3": 10,
              "Curvature4": 12.5,
              "Roundness1": -3.0487804878048776,
              "Roundness2": -3.0487804878048776,
              "Roundness3": -3.0487804878048776,
              "Roundness4": -3.0487804878048776
            }
          },
          "Mouth": {
            "Enabled": true,
            "Shape": "rectangle",
            "Rotation": 0,
            "TranslateX": 0,
            "TranslateY": 51,
            "ScaleX": 2.65,
            "ScaleY": 0.4,
            "ColorFill": "#FF9999",
            "ColorStroke": "#000000",
            "StrokeWidth": 12,
            "GlobalCurvature": 10,
            "Curvature1": 13.243243243243244,
            "Curvature2": 8.864864864864865,
            "Curvature3": 13.243243243243244,
            "Curvature4": 9.027027027027028,
            "Roundness1": -2.439024390243902,
            "Roundness2": -2.439024390243902,
            "Roundness3": -2.439024390243902,
            "Roundness4": -2.439024390243902,
            "Tongue": {
              "Enabled": true,
              "Mimic": true,
              "TranslateX": 0.12162162162162163,
              "TranslateY": 0,
              "ScaleX": 2.65,
              "ScaleY": 0.4,
              "Rotation": 0,
              "GlobalCurvature": 0,
              "Curvature1": 13.243243243243244,
              "Curvature2": 8.864864864864865,
              "Curvature3": 13.243243243243244,
              "Curvature4": 9.027027027027028,
              "Roundness1": -2.439024390243902,
              "Roundness2": -2.439024390243902,
              "Roundness3": -2.439024390243902,
              "Roundness4": -2.439024390243902,
              "ColorFill": "#C4371D"
            }
          }
    },
    "Happy": {
        "Settings": {
        "BackgroundColor": "#f5cfcc",
        "Size": {
          "Width": 1000,
          "Height": 700
        }
      },
      "BrowLeft": {
        "Enabled": true,
        "Mirror": false,
        "TranslateX": 35,  // Leicht nach außen versetzt
        "TranslateY": -40, // Position leicht über den Augen
        "ScaleX": 1.2,  // Etwas breiter für ausdrucksstarke Augenbrauen
        "ScaleY": 0.8,  // Flacher, um zur Augenform zu passen
        "Rotation": -5, // Leichte Neigung für natürliche Form
        "Curvature": 20, // Leichte Biegung für sanfte Krümmung
        "Thickness": 5,  // Passend zur Augenlinie, nicht zu dick
        "Length": 85, // Soll breiter als das Auge sein
        "ColorStroke": "#000000" // Schwarze Farbe für Kontrast
    },

    "BrowRight": {
        "Enabled": true,
        "TranslateX": 35,  // Spiegelung der linken Augenbraue
        "TranslateY": -40,
        "ScaleX": 1.2,
        "ScaleY": 0.8,
        "Rotation": 5,  // Spiegelung der linken Rotation
        "Curvature": 20,
        "Thickness": 5,
        "Length": 85,
        "ColorStroke": "#000000"
    },
      "EyeLeft": {
        "Enabled": true,
        "Mirror": true,
        "Rotation": 0,
        "TranslateX": 39,
        "TranslateY": 0,
        "ScaleX": 0.9,
        "ScaleY": 1.2,
        "ColorFill": "#3c8ad3",
        "ColorStroke": "#000000",
        "StrokeWidth": 8,
        "GlobalCurvature": 20,
        "Curvature1": 20,
        "Curvature2": 20,
        "Curvature3": -7,
        "Curvature4": 20,
        "Roundness1": -4.878048780487805,
        "Roundness2": -4.878048780487805,
        "Roundness3": -4.878048780487805,
        "Roundness4": -4.878048780487805,
        "Iris": {
          "Enabled": true,
          "Mimic": true,
          "Rotation": 0,
          "TranslateX": 0,
          "TranslateY": 15,
          "ScaleX": 1,
          "ScaleY": 1,
          "ColorFill": "#FFFFFF",
          "GlobalCurvature": 0,
          "Curvature1": 12.5,
          "Curvature2": 12.5,
          "Curvature3": -4.375,
          "Curvature4": 12.5,
          "Roundness1": -3.048780487804878,
          "Roundness2": -3.048780487804878,
          "Roundness3": -3.048780487804878,
          "Roundness4": -3.048780487804878
        }
      },
      "EyeRight": {
        "Enabled": true,
        "Rotation": 0,
        "TranslateX": 39,
        "TranslateY": 0,
        "ScaleX": 0.9,
        "ScaleY": 1.2,
        "ColorFill": "#3c8ad3",
        "ColorStroke": "#000000",
        "StrokeWidth": 8,
        "GlobalCurvature": 20,
        "Curvature1": 20,
        "Curvature2": 20,
        "Curvature3": -7,
        "Curvature4": 20,
        "Roundness1": -4.878048780487805,
        "Roundness2": -4.878048780487805,
        "Roundness3": -4.878048780487805,
        "Roundness4": -4.878048780487805,
        "Iris": {
          "Enabled": true,
          "Mimic": true,
          "Rotation": 0,
          "TranslateX": 0,
          "TranslateY": 15,
          "ScaleX": 1,
          "ScaleY": 1,
          "ColorFill": "#FFFFFF",
          "GlobalCurvature": 0,
          "Curvature1": 12.5,
          "Curvature2": 12.5,
          "Curvature3": -4.375,
          "Curvature4": 12.5,
          "Roundness1": -3.048780487804878,
          "Roundness2": -3.048780487804878,
          "Roundness3": -3.048780487804878,
          "Roundness4": -3.048780487804878
        }
      },
      "Mouth": {
        "Enabled": true,
        "Shape": "rectangle",
        "Rotation": 0,
        "TranslateX": 0,
        "TranslateY": 51,
        "ScaleX": 3.7,
        "ScaleY": 0.5,
        "ColorFill": "#ff9999",
        "ColorStroke": "#000000",
        "StrokeWidth": 12,
        "GlobalCurvature": 10,
        "Curvature1": -32,
        "Curvature2": 0,
        "Curvature3": 20,
        "Curvature4": 2,
        "Roundness1": -2.4390243902439024,
        "Roundness2": -2.4390243902439024,
        "Roundness3": -2.4390243902439024,
        "Roundness4": -2.4390243902439024,
        "Tongue": {
          "Enabled": true,
          "Mimic": false,
          "TranslateX": 1.5,
          "TranslateY": 18,
          "ScaleX": 5.5,
          "ScaleY": 0.6,
          "Rotation": 0,
          "GlobalCurvature": 0,
          "Curvature1": -32,
          "Curvature2": 4,
          "Curvature3": 20,
          "Curvature4": 2,
          "Roundness1": -2.4390243902439024,
          "Roundness2": -2.4390243902439024,
          "Roundness3": -2.4390243902439024,
          "Roundness4": -2.4390243902439024,
          "ColorFill": "#c4371d"
        }
      }
    },
    "Sad": {
        "Settings": {
        "BackgroundColor": "#cce3f5",
        "Size": {
          "Width": 1000,
          "Height": 700
        }
      },
      "BrowLeft": {
        "Enabled": true,
        "Mirror": false,
        "TranslateX": 35,  // Leicht nach außen versetzt
        "TranslateY": -40, // Position leicht über den Augen
        "ScaleX": 1.2,  // Etwas breiter für ausdrucksstarke Augenbrauen
        "ScaleY": 0.8,  // Flacher, um zur Augenform zu passen
        "Rotation": -5, // Leichte Neigung für natürliche Form
        "Curvature": 20, // Leichte Biegung für sanfte Krümmung
        "Thickness": 5,  // Passend zur Augenlinie, nicht zu dick
        "Length": 85, // Soll breiter als das Auge sein
        "ColorStroke": "#000000" // Schwarze Farbe für Kontrast
    },

    "BrowRight": {
        "Enabled": true,
        "TranslateX": 35,  // Spiegelung der linken Augenbraue
        "TranslateY": -40,
        "ScaleX": 1.2,
        "ScaleY": 0.8,
        "Rotation": 5,  // Spiegelung der linken Rotation
        "Curvature": 20,
        "Thickness": 5,
        "Length": 85,
        "ColorStroke": "#000000"
    },
      "EyeLeft": {
        "Enabled": true,
        "Mirror": true,
        "Rotation": 0,
        "TranslateX": 39,
        "TranslateY": 0,
        "ScaleX": 0.9,
        "ScaleY": 1.2,
        "ColorFill": "#3c8ad3",
        "ColorStroke": "#000000",
        "StrokeWidth": 8,
        "GlobalCurvature": 20,
        "Curvature1": -18,
        "Curvature2": 20,
        "Curvature3": 16,
        "Curvature4": 20,
        "Roundness1": -4.878048780487805,
        "Roundness2": -4.878048780487805,
        "Roundness3": -4.878048780487805,
        "Roundness4": -4.878048780487805,
        "Iris": {
          "Enabled": true,
          "Mimic": true,
          "Rotation": 0,
          "TranslateX": 0,
          "TranslateY": -12,
          "ScaleX": 1,
          "ScaleY": 1,
          "ColorFill": "#FFFFFF",
          "GlobalCurvature": 0,
          "Curvature1": -11.25,
          "Curvature2": 12.5,
          "Curvature3": 10,
          "Curvature4": 12.5,
          "Roundness1": -3.048780487804878,
          "Roundness2": -3.048780487804878,
          "Roundness3": -3.048780487804878,
          "Roundness4": -3.048780487804878
        }
      },
      "EyeRight": {
        "Enabled": true,
        "Rotation": 0,
        "TranslateX": 39,
        "TranslateY": 0,
        "ScaleX": 0.9,
        "ScaleY": 1.2,
        "ColorFill": "#3c8ad3",
        "ColorStroke": "#000000",
        "StrokeWidth": 8,
        "GlobalCurvature": 20,
        "Curvature1": -18,
        "Curvature2": 20,
        "Curvature3": 16,
        "Curvature4": 20,
        "Roundness1": -4.878048780487805,
        "Roundness2": -4.878048780487805,
        "Roundness3": -4.878048780487805,
        "Roundness4": -4.878048780487805,
        "Iris": {
          "Enabled": true,
          "Mimic": true,
          "Rotation": 0,
          "TranslateX": 0,
          "TranslateY": -12,
          "ScaleX": 1,
          "ScaleY": 1,
          "ColorFill": "#FFFFFF",
          "GlobalCurvature": 0,
          "Curvature1": -11.25,
          "Curvature2": 12.5,
          "Curvature3": 10,
          "Curvature4": 12.5,
          "Roundness1": -3.048780487804878,
          "Roundness2": -3.048780487804878,
          "Roundness3": -3.048780487804878,
          "Roundness4": -3.048780487804878
        }
      },
      "Mouth": {
        "Enabled": true,
        "Shape": "rectangle",
        "Rotation": 0,
        "TranslateX": 0,
        "TranslateY": 51,
        "ScaleX": 2.65,
        "ScaleY": 0.4,
        "ColorFill": "#ff9999",
        "ColorStroke": "#000000",
        "StrokeWidth": 12,
        "GlobalCurvature": 10,
        "Curvature1": 50,
        "Curvature2": -4,
        "Curvature3": 50,
        "Curvature4": -2,
        "Roundness1": -2.4390243902439024,
        "Roundness2": -2.4390243902439024,
        "Roundness3": -2.4390243902439024,
        "Roundness4": -2.4390243902439024,
        "Tongue": {
          "Enabled": true,
          "Mimic": true,
          "TranslateX": 1.5,
          "TranslateY": 0,
          "ScaleX": 2.65,
          "ScaleY": 0.4,
          "Rotation": 0,
          "GlobalCurvature": 0,
          "Curvature1": 50,
          "Curvature2": -4,
          "Curvature3": 50,
          "Curvature4": -2,
          "Roundness1": -2.4390243902439024,
          "Roundness2": -2.4390243902439024,
          "Roundness3": -2.4390243902439024,
          "Roundness4": -2.4390243902439024,
          "ColorFill": "#c4371d"
        }
      }
    }
};
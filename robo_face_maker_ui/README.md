# RoboFaceMaker UI

Browser-based editor for creating and animating SVG robot faces. Produces face JSON files that can be played back by the `ros2_roboface` display node.

## Usage

Open `index.html` directly in a browser — no build step or server required.

## Features

- SVG face editor with real-time preview
- Keyframe-based animation timeline
- Configurable eyes, eyebrows, and mouth (shape, color, position, scale, rotation)
- Playback speed and canvas size settings
- Export face animations as JSON via **File → Save as JSON**

## Face JSON format

Exported files follow this structure:

```json
{
  "Settings": {
    "TimeMax": 5000,
    "TimeSpeed": 30,
    "Size": { "Width": 1024, "Height": 768 }
  },
  "Frames": {
    "0": {
      "IsKeyFrame": true,
      "Settings": { "BackgroundColor": "#333333" },
      "BrowLeft": { ... },
      "BrowRight": { ... },
      "EyeLeft": { ... },
      "EyeRight": { ... },
      "Mouth": { ... }
    }
  }
}
```

Save exported files to `../presets/` to make them available to the `ros2_roboface` node.

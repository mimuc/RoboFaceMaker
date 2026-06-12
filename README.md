# RoboFaceMaker

System for designing, animating, and displaying SVG-based robot faces driven by ROS2 commands.

## Repository structure

```
RoboFaceMaker/
├── robo_face_maker_ui/   # Browser-based face animation editor
├── presets/              # Face JSON files (exported from the editor)
└── ros2_roboface/        # Node.js display node (rosbridge WebSocket client)
```

## Workflow

1. **Design faces** in `robo_face_maker_ui/` — open `index.html` in a browser, animate, then export via *File → Save as JSON*.
2. **Store presets** in `presets/` — each file is named `{face-id}.json`.
3. **Run the display node** from `ros2_roboface/`:
   ```bash
   npm install
   npm start
   ```
   Open `http://localhost:3000` on the robot display. Configure the rosbridge URL via the `?rosbridge=` query param if the ROS2 bridge is on a different host.
4. **Control via ROS2 topics** published by your robot's behaviour layer:

   | Topic | Type | Effect |
   |---|---|---|
   | `/roboface/load_face` | `std_msgs/String` | Load a face by ID |
   | `/roboface/play` | `std_msgs/String` | `"once"` or `"loop"` |
   | `/roboface/pause` | `std_msgs/Empty` | Pause playback |
   | `/roboface/stop` | `std_msgs/Empty` | Stop and reset to frame 0 |

## Requirements

- Browser (face editor — no server needed)
- Node.js 18+ (display node)
- ROS2 with [rosbridge_suite](https://github.com/RobotWebTools/rosbridge_suite) running on port 9090

## Authors

<!-- Add author information here -->

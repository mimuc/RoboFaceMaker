# ros2_roboface

JavaScript-based ROS2 face display node. Serves a fullscreen SVG face in the browser and responds to ROS commands via rosbridge.

## Prerequisites

- Node.js 18+
- A running [rosbridge_suite](https://github.com/RobotWebTools/rosbridge_suite) WebSocket server (default port 9090)
- Face JSON files in the `../presets/` folder (export from the `robo_face_maker_ui` editor)

## Install and start

```bash
npm install
npm start
```

The server starts at `http://localhost:3000`. Open that URL in a browser on the robot display.

| Page | URL | Purpose |
|---|---|---|
| Display | `http://localhost:3000` | Fullscreen face display for the robot screen |
| Admin | `http://localhost:3000/admin.html` | Control panel — load faces, trigger playback commands |

## Configuration

Append URL query params to override defaults:

| Param | Default | Example |
|---|---|---|
| `rosbridge` | `ws://localhost:9090` | `?rosbridge=ws://192.168.1.10:9090` |
| `db` | `/presets/` | `?db=/presets/` |

Example: `http://localhost:3000?rosbridge=ws://robot.local:9090`

## ROS topic interface

| Topic | Type | Direction | Payload |
|---|---|---|---|
| `/roboface/load_face` | `std_msgs/String` | → node | Face ID — filename without `.json` (e.g. `"happy"`) |
| `/roboface/play` | `std_msgs/String` | → node | `"once"` or `"loop"` |
| `/roboface/pause` | `std_msgs/Empty` | → node | — |
| `/roboface/stop` | `std_msgs/Empty` | → node | — |
| `/roboface/list_faces` | `std_msgs/Empty` | → node | Triggers a faces list response |
| `/roboface/faces_list` | `std_msgs/String` | ← node | JSON array of available face IDs, e.g. `["happy","sad"]` |

### Example commands

```bash
# Load a face
ros2 topic pub --once /roboface/load_face std_msgs/String "data: 'happy'"

# Play once
ros2 topic pub --once /roboface/play std_msgs/String "data: 'once'"

# Play looping
ros2 topic pub --once /roboface/play std_msgs/String "data: 'loop'"

# Pause
ros2 topic pub --once /roboface/pause std_msgs/Empty "{}"

# Stop and reset to first frame
ros2 topic pub --once /roboface/stop std_msgs/Empty "{}"

# Request list of available faces (response arrives on /roboface/faces_list)
ros2 topic pub --once /roboface/list_faces std_msgs/Empty "{}"
ros2 topic echo --once /roboface/faces_list
```

## Face JSON format

Face files live in `../presets/` and are exported from the `robo_face_maker_ui` editor via `File → Save as Json`. Each file must be named `{id}.json` where `{id}` is the face ID used in `/roboface/load_face`.

## Run tests

```bash
npm test
```

## Port override

```bash
PORT=8080 npm start
```

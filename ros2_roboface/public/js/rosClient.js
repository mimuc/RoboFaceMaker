/**
 * Connects to rosbridge and wires ROS topics to the state machine.
 *
 * @param {object} sm - State machine returned by createStateMachine()
 * @param {string} rosbridgeUrl - WebSocket URL, e.g. 'ws://localhost:9090'
 */
function connectRosBridge(sm, rosbridgeUrl) {
  const ros = new ROSLIB.Ros({ url: rosbridgeUrl });

  ros.on('connection', () => {
    console.log('Connected to rosbridge:', rosbridgeUrl);
    document.body.dataset.rosStatus = 'connected';
  });

  ros.on('error', (err) => {
    console.error('rosbridge error:', err);
    document.body.dataset.rosStatus = 'error';
  });

  ros.on('close', () => {
    console.log('rosbridge connection closed');
    if (document.body.dataset.rosStatus !== 'error') {
      document.body.dataset.rosStatus = 'disconnected';
    }
    setTimeout(() => connectRosBridge(sm, rosbridgeUrl), 3000);
  });

  const loadFaceTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/load_face',
    messageType: 'std_msgs/String',
  });

  const playTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/play',
    messageType: 'std_msgs/String',
  });

  const pauseTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/pause',
    messageType: 'std_msgs/Empty',
  });

  const stopTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/stop',
    messageType: 'std_msgs/Empty',
  });

  const listFacesTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/list_faces',
    messageType: 'std_msgs/Empty',
  });

  const facesListTopic = new ROSLIB.Topic({
    ros,
    name: '/roboface/faces_list',
    messageType: 'std_msgs/String',
  });

  loadFaceTopic.subscribe((msg) => {
    console.log('loadFace:', msg.data);
    sm.loadFace(msg.data);
  });

  playTopic.subscribe((msg) => {
    const mode = msg.data === 'loop' ? 'loop' : 'once';
    console.log('play:', mode);
    sm.play(mode);
  });

  pauseTopic.subscribe(() => {
    console.log('pause');
    sm.pause();
  });

  stopTopic.subscribe(() => {
    console.log('stop');
    sm.stop();
  });

  listFacesTopic.subscribe(() => {
    fetch('/presets/')
      .then(r => r.json())
      .then(faces => {
        console.log('list_faces:', faces);
        facesListTopic.publish(new ROSLIB.Message({ data: JSON.stringify(faces) }));
      })
      .catch(err => console.error('list_faces error:', err));
  });
}

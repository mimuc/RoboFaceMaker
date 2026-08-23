/**
 * Connects the player state machine to the local Node server.
 *
 * @param {object} sm - State machine returned by createStateMachine()
 */
function connectStandalone(sm) {
  const events = new EventSource('/events');

  events.onopen = () => {
    console.log('Connected to standalone server');
    document.body.dataset.rosStatus = 'connected';
  };

  events.onerror = () => {
    document.body.dataset.rosStatus = 'disconnected';
  };

  events.onmessage = (event) => {
    const command = JSON.parse(event.data);
    if (command.type === 'loadFace') sm.loadFace(command.data);
    if (command.type === 'play') sm.play(command.data === 'loop' ? 'loop' : 'once');
    if (command.type === 'pause') sm.pause();
    if (command.type === 'stop') sm.stop();
  };
}

function createStateMachine({ onRender, fetchFace }) {
  let status = 'idle';   // 'idle' | 'loaded' | 'playing' | 'paused' | 'stopped'
  let frames = [];
  let currentFrame = 0;
  let intervalId = null;
  let timeSpeed = 30;
  let loadGeneration = 0;

  function clearInterval_() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  async function loadFace(id) {
    clearInterval_();
    const generation = ++loadGeneration;
    let data;
    try {
      data = await fetchFace(id);
    } catch (err) {
      console.error('fetchFace failed:', err);
      status = 'idle';
      return;
    }
    if (generation !== loadGeneration) return; // stale response
    frames = Object.values(data.Frames ?? {});
    if (frames.length === 0) {
      status = 'idle';
      return;
    }
    timeSpeed = data.Settings?.TimeSpeed || 30;
    currentFrame = 0;
    status = 'loaded';
    onRender(frames[0]);
  }

  function play(mode) {
    if (status === 'idle') return;
    clearInterval_();
    status = 'playing';
    const delay = 1000 / timeSpeed;

    intervalId = setInterval(() => {
      onRender(frames[currentFrame]);
      currentFrame++;

      if (currentFrame >= frames.length) {
        if (mode === 'loop') {
          currentFrame = 0;
        } else {
          currentFrame = frames.length - 1;
          clearInterval_();
          status = 'stopped';
        }
      }
    }, delay);
  }

  function pause() {
    if (status !== 'playing') return;
    clearInterval_();
    status = 'paused';
  }

  function stop() {
    if (status === 'idle') return;
    clearInterval_();
    currentFrame = 0;
    status = 'stopped';
    if (frames.length > 0) {
      onRender(frames[0]);
    }
  }

  function getStatus() {
    return status;
  }

  return { loadFace, play, pause, stop, getStatus };
}

// Support both CommonJS (Jest) and ES module (browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createStateMachine };
} else {
  window.createStateMachine = createStateMachine;
}

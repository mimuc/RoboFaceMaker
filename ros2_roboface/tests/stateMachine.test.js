/**
 * @jest-environment jsdom
 */

const { createStateMachine } = require('../public/js/stateMachine.js');

describe('StateMachine', () => {
  let sm;
  let renderCalls;

  beforeEach(() => {
    renderCalls = [];
    sm = createStateMachine({
      onRender: (frame) => renderCalls.push(frame),
      fetchFace: async (id) => ({
        Settings: { TimeSpeed: 10 },
        Frames: {
          '0': { id: 'frame0' },
          '1': { id: 'frame1' },
          '2': { id: 'frame2' },
        },
      }),
    });
  });

  afterEach(() => {
    sm.stop();
    jest.useRealTimers();
  });

  test('initial status is idle', () => {
    expect(sm.getStatus()).toBe('idle');
  });

  test('loadFace sets status to loaded and renders first frame', async () => {
    await sm.loadFace('happy');
    expect(sm.getStatus()).toBe('loaded');
    expect(renderCalls).toHaveLength(1);
    expect(renderCalls[0]).toEqual({ id: 'frame0' });
  });

  test('loadFace while playing stops old interval before loading new face', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('loop');
    await sm.loadFace('sad');
    expect(sm.getStatus()).toBe('loaded');
  });

  test('play sets status to playing', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('once');
    expect(sm.getStatus()).toBe('playing');
  });

  test('play with "once" stops at last frame', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('once');
    // 3 frames at 10fps = 100ms per frame
    jest.advanceTimersByTime(400);
    expect(sm.getStatus()).toBe('stopped');
  });

  test('play with "loop" wraps around', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('loop');
    jest.advanceTimersByTime(350); // 3+ frames
    expect(sm.getStatus()).toBe('playing');
    // renderCalls should have looped beyond frame index 2
    expect(renderCalls.length).toBeGreaterThan(3);
  });

  test('pause freezes current frame', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('once');
    jest.advanceTimersByTime(150);
    sm.pause();
    const callCount = renderCalls.length;
    jest.advanceTimersByTime(300);
    expect(renderCalls.length).toBe(callCount);
    expect(sm.getStatus()).toBe('paused');
  });

  test('stop resets to frame 0 and sets status to stopped', async () => {
    jest.useFakeTimers();
    await sm.loadFace('happy');
    sm.play('once');
    jest.advanceTimersByTime(150);
    sm.stop();
    expect(sm.getStatus()).toBe('stopped');
    // Last render call should be frame 0
    expect(renderCalls[renderCalls.length - 1]).toEqual({ id: 'frame0' });
  });

  test('play before loadFace does nothing', () => {
    sm.play('once');
    expect(sm.getStatus()).toBe('idle');
  });

  test('pause before loadFace does nothing', () => {
    sm.pause();
    expect(sm.getStatus()).toBe('idle');
  });
});

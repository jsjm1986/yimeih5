import { describe, it, expect } from 'vitest';
import { getDeviceId, addTaskId, getTaskIds } from '../src/device.js';

describe('device', () => {
  it('getDeviceId 首次生成并持久化，二次相同', () => {
    const id1 = getDeviceId();
    expect(id1).toBeTruthy();
    const id2 = getDeviceId();
    expect(id2).toBe(id1);
  });

  it('addTaskId 累积，最新在前，去重', () => {
    addTaskId('a');
    addTaskId('b');
    addTaskId('a'); // 重复
    expect(getTaskIds()).toEqual(['a', 'b']);
  });

  it('无历史时 getTaskIds 返回空数组', () => {
    expect(getTaskIds()).toEqual([]);
  });
});

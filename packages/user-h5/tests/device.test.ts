import { describe, it, expect } from 'vitest';
import { getDeviceId } from '../src/device.js';

describe('device', () => {
  it('getDeviceId 首次生成并持久化，二次相同', () => {
    const id1 = getDeviceId();
    expect(id1).toBeTruthy();
    const id2 = getDeviceId();
    expect(id2).toBe(id1);
  });
});

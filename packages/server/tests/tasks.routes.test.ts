import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeTestApp, PNG } from './helpers.js';

describe('POST /api/tasks', () => {
  it('成功提交返回 201 与 pending 任务', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .post('/api/tasks')
      .field('prompt', '瘦脸')
      .field('deviceId', 'dev-1')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.id).toBeTruthy();
  });

  it('缺图片返回 400', async () => {
    const { app } = makeTestApp();
    const res = await request(app).post('/api/tasks').field('prompt', 'x').field('deviceId', 'd');
    expect(res.status).toBe(400);
  });

  it('缺提示词返回 400', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .post('/api/tasks')
      .field('deviceId', 'd')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
  });

  it('不支持的图片类型返回 400', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .post('/api/tasks')
      .field('prompt', 'x')
      .field('deviceId', 'd')
      .attach('image', Buffer.from('gif'), { filename: 'a.gif', contentType: 'image/gif' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks/:id 与历史', () => {
  it('轮询返回任务详情与 originalUrl', async () => {
    const { app } = makeTestApp();
    const created = await request(app)
      .post('/api/tasks')
      .field('prompt', '瘦脸')
      .field('deviceId', 'dev-1')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    const res = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.originalUrl).toMatch(/^\/uploads\/.+\.png$/);
    expect(res.body.resultUrl).toBeNull();
  });

  it('不存在任务返回 404', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/api/tasks/nope');
    expect(res.status).toBe(404);
  });

  it('按 deviceId 查历史，缺参数 400', async () => {
    const { app } = makeTestApp();
    await request(app)
      .post('/api/tasks')
      .field('prompt', '瘦脸')
      .field('deviceId', 'dev-1')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    const list = await request(app).get('/api/tasks?deviceId=dev-1');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect((await request(app).get('/api/tasks')).status).toBe(400);
  });
});

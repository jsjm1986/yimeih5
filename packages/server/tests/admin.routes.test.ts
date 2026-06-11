import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { makeTestApp, seedAdmin, PNG } from './helpers.js';

async function loginAgent(app: any, db: any) {
  const { username, password } = seedAdmin(db);
  const agent = request.agent(app);
  const res = await agent.post('/api/admin/login').send({ username, password });
  expect(res.status).toBe(200);
  return agent;
}

describe('admin 鉴权', () => {
  it('正确凭证登录成功并下发 cookie', async () => {
    const { app, db } = makeTestApp();
    const { username, password } = seedAdmin(db);
    const res = await request(app).post('/api/admin/login').send({ username, password });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/sid=/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  it('错误密码 401', async () => {
    const { app, db } = makeTestApp();
    seedAdmin(db);
    const res = await request(app).post('/api/admin/login').send({ username: 'alice', password: 'bad' });
    expect(res.status).toBe(401);
  });

  it('未登录访问受保护接口 401', async () => {
    const { app } = makeTestApp();
    expect((await request(app).get('/api/admin/tasks')).status).toBe(401);
    expect((await request(app).get('/api/admin/settings')).status).toBe(401);
  });
});

describe('admin 任务处理流程', () => {
  it('看 pending 列表 → 上传结果 → 任务变 done', async () => {
    const { app, db } = makeTestApp();
    // 用户先提交一个任务
    const created = await request(app)
      .post('/api/tasks')
      .field('prompt', '瘦脸')
      .field('deviceId', 'dev-1')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    const taskId = created.body.id;

    const agent = await loginAgent(app, db);

    const pending = await agent.get('/api/admin/tasks?status=pending');
    expect(pending.status).toBe(200);
    expect(pending.body).toHaveLength(1);

    const upload = await agent
      .post(`/api/admin/tasks/${taskId}/result`)
      .attach('image', PNG, { filename: 'r.png', contentType: 'image/png' });
    expect(upload.status).toBe(200);
    expect(upload.body.status).toBe('done');
    expect(upload.body.resultUrl).toMatch(/^\/uploads\/.+\.png$/);
    expect(upload.body.handledBy).toBe('alice');

    // 用户端轮询此时应看到 done
    const poll = await request(app).get(`/api/tasks/${taskId}`);
    expect(poll.body.status).toBe('done');
    expect(poll.body.resultUrl).toBeTruthy();
  });

  it('给不存在任务上传结果 404', async () => {
    const { app, db } = makeTestApp();
    const agent = await loginAgent(app, db);
    const res = await agent
      .post('/api/admin/tasks/nope/result')
      .attach('image', PNG, { filename: 'r.png', contentType: 'image/png' });
    expect(res.status).toBe(404);
  });

  it('重传结果图删除旧文件，避免孤儿文件泄漏', async () => {
    const { app, db, uploadsDir } = makeTestApp();
    const created = await request(app)
      .post('/api/tasks')
      .field('prompt', '瘦脸')
      .field('deviceId', 'dev-1')
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    const taskId = created.body.id;
    const agent = await loginAgent(app, db);

    const first = await agent
      .post(`/api/admin/tasks/${taskId}/result`)
      .attach('image', PNG, { filename: 'r1.png', contentType: 'image/png' });
    const firstFile = first.body.resultUrl.replace('/uploads/', '');
    expect(fs.existsSync(path.join(uploadsDir, firstFile))).toBe(true);

    const second = await agent
      .post(`/api/admin/tasks/${taskId}/result`)
      .attach('image', PNG, { filename: 'r2.png', contentType: 'image/png' });
    const secondFile = second.body.resultUrl.replace('/uploads/', '');

    expect(secondFile).not.toBe(firstFile);
    expect(fs.existsSync(path.join(uploadsDir, firstFile))).toBe(false); // 旧文件已删
    expect(fs.existsSync(path.join(uploadsDir, secondFile))).toBe(true); // 新文件在
  });
});

describe('admin 设置', () => {
  it('读默认 30，写入后读回', async () => {
    const { app, db } = makeTestApp();
    const agent = await loginAgent(app, db);
    expect((await agent.get('/api/admin/settings')).body.retentionDays).toBe(30);
    const put = await agent.put('/api/admin/settings').send({ retentionDays: 7 });
    expect(put.status).toBe(200);
    expect((await agent.get('/api/admin/settings')).body.retentionDays).toBe(7);
  });

  it('非法留存天数 400', async () => {
    const { app, db } = makeTestApp();
    const agent = await loginAgent(app, db);
    expect((await agent.put('/api/admin/settings').send({ retentionDays: 0 })).status).toBe(400);
    expect((await agent.put('/api/admin/settings').send({ retentionDays: -3 })).status).toBe(400);
  });
});

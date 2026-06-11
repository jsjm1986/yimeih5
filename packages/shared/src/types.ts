export type TaskStatus = 'pending' | 'done' | 'expired';

/** 用户端历史列表中的任务摘要（不含图片 URL，列表轻量） */
export interface TaskSummary {
  id: string;
  status: TaskStatus;
  prompt: string;
  createdAt: number;
  completedAt: number | null;
}

/** 用户端轮询/详情：含图片 URL */
export interface TaskDetail extends TaskSummary {
  originalUrl: string | null;
  resultUrl: string | null;
}

/** POST /api/tasks 的响应 */
export interface CreateTaskResponse {
  id: string;
  status: TaskStatus;
  createdAt: number;
}

/** 管理后台看到的任务（含处理人，含两张图 URL） */
export interface AdminTaskSummary {
  id: string;
  status: TaskStatus;
  prompt: string;
  originalUrl: string | null;
  resultUrl: string | null;
  createdAt: number;
  completedAt: number | null;
  handledBy: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
}

export interface SettingsResponse {
  retentionDays: number;
}

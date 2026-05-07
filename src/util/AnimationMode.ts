export const AnimationMode = {
  IDLE: 'idle',
  UPDATE: 'update',
  QUERY: 'query',
} as const; // 'as const' makes it read-only and literal

export type AnimationModeType = typeof AnimationMode[keyof typeof AnimationMode];
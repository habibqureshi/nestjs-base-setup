export const extractStack = (error: unknown): string => {
  return error instanceof Error ? (error.stack ?? 'No stack') : String(error);
};

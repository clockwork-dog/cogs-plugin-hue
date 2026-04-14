export type LogLevel = "info" | "warning" | "error";

export type LogMessage = {
  level: LogLevel;
  datetime: number;
  message: string;
};

export type LogMessageWithId = {
  level: LogLevel;
  datetime: number;
  message: string;
  id: number;
};

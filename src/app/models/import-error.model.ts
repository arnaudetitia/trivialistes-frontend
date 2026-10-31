export interface ImportError {
  ligne: number;
  type: 'error' | 'warning';
  message: string;
}

export {}

declare global {
  interface Window {
    claude?: {
      use: (name: string) => Promise<unknown>
    }
  }
}

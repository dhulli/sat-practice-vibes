export type MockSession = {
  user: { name: string; email: string };
};

export function getMockSession(): MockSession | null {
  // For now: always logged-in.
  // Later: switch to a real auth provider or cookies.
  return { user: { name: "Raj", email: "raj@example.com" } };
}

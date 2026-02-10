export default function ExamRootLayout({ children }: { children: React.ReactNode }) {
  // IMPORTANT: nested layouts must NOT render <html> or <body>
  return <>{children}</>;
}

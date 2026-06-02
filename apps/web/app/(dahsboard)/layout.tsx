export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The root layout already provides the <main> landmark and page padding;
  // this group layout is a passthrough to avoid a nested <main>.
  return children;
}

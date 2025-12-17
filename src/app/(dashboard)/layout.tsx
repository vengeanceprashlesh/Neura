export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Layout is minimal since the page handles the full layout
    // This keeps the layout as a server component
    return <>{children}</>;
}

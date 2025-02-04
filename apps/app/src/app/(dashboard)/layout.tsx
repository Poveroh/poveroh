type LoginLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function DashboardLayout({ children }: LoginLayoutProps) {
    return (
        <>
            <p>dashboard layout</p>
            {children}
        </>
    );
}

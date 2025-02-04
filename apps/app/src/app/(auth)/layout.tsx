type LoginLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function LoginLayout({ children }: LoginLayoutProps) {
    return (
        <>
            <p>login layout</p>
            {children}
        </>
    );
}

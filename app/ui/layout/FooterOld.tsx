
export default function Footer({ children, }: Readonly<{ children: React.ReactNode; }>) {

    return (
        <div className="app-footer w-full">
            {children}
        </div>
    )

}
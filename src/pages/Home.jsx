import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to Accounts</h1>
                <p className="text-muted-foreground mb-8">
                    Manage your accounts and finances efficiently
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}

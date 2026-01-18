import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/assets/styles/globals.css";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
// import { ErrorWrapper } from "./error-wrapper";

const roboto = Roboto({
    weight: ['300', '700'],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Shoes Store',
        default: `${APP_NAME}`,
    },
    description: `${APP_DESCRIPTION}`,
    metadataBase: new URL(SERVER_URL)
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${roboto.className}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {/* <ErrorWrapper> */}
                    {children}
                    <Toaster richColors />
                    {/* </ErrorWrapper> */}

                </ThemeProvider>

            </body>
        </html>
    );
}

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./global.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider>
          <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

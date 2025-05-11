import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/my-workspaces") ||
    req.nextUrl.pathname.startsWith("/bookings");

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isLoggedIn) {
    if (isProtectedRoute || isAdminRoute) {
      const redirectUrl = new URL("/login", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAdminRoute && req.auth?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/my-workspaces/:path*",
    "/bookings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

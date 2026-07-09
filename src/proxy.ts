import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/** WUA-8: `/login` es la única ruta pública — todo lo demás exige sesión. */
const isLoginPage = createRouteMatcher(["/login"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();
  if (isLoginPage(request)) {
    if (authenticated) return nextjsMiddlewareRedirect(request, "/hoy");
    return;
  }
  if (!authenticated) return nextjsMiddlewareRedirect(request, "/login");
});

export const config = {
  // Excluye archivos estáticos y de Next.js internos, como recomienda Convex Auth.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

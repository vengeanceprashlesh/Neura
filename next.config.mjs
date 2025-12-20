/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob: data:; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' blob: data: https: http:; font-src 'self' data: https: http:; connect-src 'self' https: http: ws: wss:; frame-src 'self' https: http: data: blob: *.codesandbox.io;"
                    },
                ],
            },
        ];
    },
};

console.log("----------------------------------------");
console.log("   Loading next.config.mjs with CSP     ");
console.log("----------------------------------------");

export default nextConfig;

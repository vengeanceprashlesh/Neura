/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Disable CSP for development to avoid Sandpack CORS issues
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' blob: data:; style-src * 'unsafe-inline'; img-src * blob: data:; font-src * data:; connect-src *; frame-src *; worker-src * blob:;"
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

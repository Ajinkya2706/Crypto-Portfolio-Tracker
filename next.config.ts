import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        child_process: false,
        dns: false,
        aws4: false,
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        snappy: false,
        socks: false,
        'mongodb-client-encryption': false,
        'timers/promises': false,
      };
    }
    return config;
  },
};

export default nextConfig;
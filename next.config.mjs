const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repository = process.env.GITHUB_REPOSITORY || 'lloredia/Gods-Of-The-Realms-War-of-Worlds';
const repoName = repository.split('/')[1] || 'Gods-Of-The-Realms-War-of-Worlds';
const basePath = isGithubPages ? `/${repoName}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The game ships one raster logo. Unoptimized images keep `next export` valid
  // without a custom loader, and they still work for `next dev` / `next start`.
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

if (isGithubPages) {
  nextConfig.output = 'export';
  nextConfig.basePath = basePath;
  nextConfig.trailingSlash = true;
}

export default nextConfig;

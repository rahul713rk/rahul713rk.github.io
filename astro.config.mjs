import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isPages = process.env.GITHUB_ACTIONS === 'true';
const isUserSite = repo.toLowerCase().endsWith('.github.io');
const base = isPages ? (isUserSite ? '/' : `/${repo}/`) : '/';

export default defineConfig({
  site: 'https://rahul713rk.github.io',
  base,
  output: 'static',
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: 'shiki'
  }
});

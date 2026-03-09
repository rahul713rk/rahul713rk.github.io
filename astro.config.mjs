import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://rahul713rk.github.io',
  base: isPages && repo ? `/${repo}` : '/',
  output: 'static',
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: 'shiki'
  }
});

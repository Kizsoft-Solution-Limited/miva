import { describe, expect, it } from 'vitest';
import { parseGithubHtmlFallback, parseGithubRepoUrl } from './github-repo.js';

describe('parseGithubRepoUrl', () => {
  it('parses owner/repo from github.com', () => {
    expect(parseGithubRepoUrl('https://github.com/nestjs/nest')).toEqual({
      owner: 'nestjs',
      repo: 'nest',
    });
  });

  it('strips .git and ignores www', () => {
    expect(
      parseGithubRepoUrl('https://www.github.com/vuejs/core.git'),
    ).toEqual({ owner: 'vuejs', repo: 'core' });
  });

  it('rejects non-github hosts', () => {
    expect(parseGithubRepoUrl('https://gitlab.com/foo/bar')).toBeNull();
  });

  it('rejects incomplete paths', () => {
    expect(parseGithubRepoUrl('https://github.com/nestjs')).toBeNull();
  });
});


describe('parseGithubHtmlFallback', () => {
  it('extracts a release tag from public HTML', () => {
    const html = `
      <a href="/nestjs/nest/releases/tag/v11.0.1">v11.0.1</a>
      <span>nestjs/nest</span>
    `;
    const parsed = parseGithubHtmlFallback('nestjs', 'nest', html, html);
    expect(parsed.pageLooksPublic).toBe(true);
    expect(parsed.latestReleaseTag).toBe('v11.0.1');
    expect(parsed.latestReleaseUrl).toContain('/releases/tag/v11.0.1');
  });
});

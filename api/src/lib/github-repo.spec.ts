import { describe, expect, it } from 'vitest';
import { parseGithubRepoUrl } from './github-repo.js';

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

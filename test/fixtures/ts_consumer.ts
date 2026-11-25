// TypeScript consumer fixture to verify type stripping and execution
import { barstileMiddleware, createBarstile, generateSecret } from '../../src/server/index.js';
import { parseChallengeToken } from '../../src/client/index.js';

interface TestConfig {
  difficulty: number;
  secret: string;
}

const config: TestConfig = {
  difficulty: 3,
  secret: generateSecret(32)
};

const engine = createBarstile({ difficulty: config.difficulty, secret: config.secret });
const token: string = engine.issueChallenge();
const parsed = parseChallengeToken(token);

if (parsed.difficulty !== 3) {
  throw new Error(`Expected difficulty 3, got ${parsed.difficulty}`);
}

console.log('TS_FIXTURE_SUCCESS');

import { validateBotCredentials, validateDevConfig, validateProdConfig } from '../../src/lib/validation/config';

describe('validating credentials', () => {
  it('accepts proper values', () => {
    expect(validateBotCredentials({
      token: 'foo',
      applicationId: 'bar',
    })).toBeNull();
  });

  it('rejects missing values', () => {
    expect(typeof validateBotCredentials({
      applicationId: 'foo',
    })).toBe('string');

    expect(typeof validateBotCredentials({
      token: 'foo',
    })).toBe('string');
  });
});

describe('validating dev config', () => {
  it('accepts proper values', () => {
    expect(validateDevConfig({
      credentials: {
        token: 'foo',
        applicationId: 'bar',
      },
      devServer: 'qux',
      intents: [],
    })).toBeNull();

    expect(validateDevConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
      devServer: '',
      intents: [],
      client: {
        config: {},
      },
    })).toBeNull();
  });

  it('rejects missing credentials', () => {
    expect(typeof validateDevConfig({
      devServer: '',
      intents: [],
    })).toBe('string');
  });

  it('rejects missing intents', () => {
    expect(typeof validateDevConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
      devServer: '',
    })).toBe('string');
  });

  it('rejects missing dev server', () => {
    expect(typeof validateDevConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
      intents: [],
    })).toBe('string');
  });
});

describe('validating prod config', () => {
  it('accepts proper values', () => {
    expect(validateProdConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
      intents: [],
    })).toBeNull();

    expect(validateProdConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
      devServer: '',
      intents: [],
      client: {
        config: {},
      },
    })).toBeNull();
  });

  it('rejects missing credentials', () => {
    expect(typeof validateProdConfig({
      intents: [],
    })).toBe('string');
  });

  it('rejects missing intents', () => {
    expect(typeof validateProdConfig({
      credentials: {
        token: '',
        applicationId: '',
      },
    })).toBe('string');
  });
});

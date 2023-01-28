import { Kind0Event } from '../src/lib/NostrEvents';

let event = {
  id: 'foo',
  sig: 'bar',
  kind: 0,
  pubkey: 'baz',
  content: '',
  tags: [['foo', 'bar']],
  created_at: Date.now(),
};

describe('NostrEvent', () => {
  it('Kind 0', () => {
    let kind0 = new Kind0Event(event);
    expect(kind0.parsedContent).toEqual({}); // Empty content string parses to {}
    // NOTE: Parsing doesn't actually validate what fields are valid.
    kind0 = new Kind0Event({
      ...event,
      content: JSON.stringify({ foo: 'bar' }),
    });
    // Unknown fields are ignored
    expect(kind0.parsedContent).toEqual({});
    kind0 = new Kind0Event({
      ...event,
      content: JSON.stringify({ name: 'alice' }),
    });
    // Unknown fields are ignored
    expect(kind0.parsedContent).toEqual({ name: 'alice' });
  });
});

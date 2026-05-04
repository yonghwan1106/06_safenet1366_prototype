// 실행: node --import tsx --test __tests__/maskPII.test.ts
// (tsx 미설치 시 node --test --experimental-strip-types 도 가능, Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maskPII, hasPII } from '../lib/triage/maskPII';

test('masks Korean mobile number', () => {
  const r = maskPII('제 번호는 010-1234-5678 입니다');
  assert.equal(r.text, '제 번호는 [휴대폰] 입니다');
  assert.equal(r.hits.mobile, 1);
});

test('masks phone number', () => {
  const r = maskPII('02-1234-5678 로 연락주세요');
  assert.match(r.text, /\[전화\]/);
});

test('masks RRN', () => {
  const r = maskPII('주민번호 901231-1234567');
  assert.match(r.text, /\[주민번호\]/);
  assert.equal(r.hits.rrn, 1);
});

test('masks email', () => {
  const r = maskPII('연락 abc@example.com');
  assert.match(r.text, /\[이메일\]/);
});

test('masks address', () => {
  const r = maskPII('서울특별시 종로구 종로1길 30');
  assert.match(r.text, /\[주소\]/);
});

test('returns false for clean text', () => {
  assert.equal(hasPII('남편이 화내고 욕을 해요'), false);
});

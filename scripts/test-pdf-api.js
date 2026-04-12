// 간단한 테스트용 PDF 생성 후 API 테스트
const http = require('http');
const https = require('https');

// 최소한의 PDF 바이너리 생성 (텍스트 포함)
function createTestPdf(text) {
  const streamContent = `BT /F1 12 Tf 100 700 Td (${text}) Tj ET`;
  const stream = `stream\n${streamContent}\nendstream`;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamContent.length} >>\n${stream}\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
  ];

  let body = '%PDF-1.4\n';
  const offsets = [];

  for (const obj of objects) {
    offsets.push(body.length);
    body += obj + '\n';
  }

  const xrefStart = body.length;
  body += 'xref\n';
  body += `0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (const offset of offsets) {
    body += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  body += 'trailer\n';
  body += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += 'startxref\n';
  body += `${xrefStart}\n`;
  body += '%%EOF';

  return Buffer.from(body, 'binary');
}

async function testApi() {
  const pdfBuffer = createTestPdf('Hello PDF Test - Python SQL Data Analysis');

  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="file"; filename="test.pdf"\r\n`,
    `Content-Type: application/pdf\r\n\r\n`,
  ];

  const bodyStart = Buffer.from(bodyParts.join(''));
  const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([bodyStart, pdfBuffer, bodyEnd]);

  const options = {
    hostname: 'localhost',
    port: 3099,
    path: '/api/parse-pdf',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('Response:', JSON.stringify(json, null, 2));
        } catch {
          console.log('Raw response:', data.substring(0, 500));
        }
        resolve();
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 빈 요청 테스트
async function testNoFile() {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const body = Buffer.from(`--${boundary}--\r\n`);

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 3099, path: '/api/parse-pdf', method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n[No file test] Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== PDF API Test ===\n');
  console.log('[Valid PDF test]');
  await testApi();
  await testNoFile();
})();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// [수정] Render 배포 후 실제 URL로 변경하세요.
const REMOTE_URL = process.env.REMOTE_URL || 'https://weekly-report-ezfi.onrender.com';
const LOCAL_REPORTS = path.join(__dirname, 'reports');

if (!fs.existsSync(LOCAL_REPORTS)) fs.mkdirSync(LOCAL_REPORTS, { recursive: true });

const client = REMOTE_URL.startsWith('https') ? https : http;

function fetch(url) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function sync() {
    console.log(`동기화 시작: ${REMOTE_URL}`);

    const res = await fetch(`${REMOTE_URL}/api/reports`);
    const { files } = JSON.parse(res.body);

    if (!files || files.length === 0) {
        console.log('서버에 저장된 파일 없음.');
        return;
    }

    let downloaded = 0;
    for (const fileName of files) {
        const localPath = path.join(LOCAL_REPORTS, fileName);

        // 이미 로컬에 있으면 건너뛰기
        if (fs.existsSync(localPath)) continue;

        const fileRes = await fetch(`${REMOTE_URL}/api/reports/${encodeURIComponent(fileName)}`);
        fs.writeFileSync(localPath, fileRes.body, 'utf-8');
        console.log(`  다운로드: ${fileName}`);
        downloaded++;
    }

    console.log(downloaded > 0 ? `완료: ${downloaded}개 파일 동기화됨.` : '모든 파일이 최신 상태입니다.');
}

sync().catch(err => console.error('동기화 실패:', err.message));

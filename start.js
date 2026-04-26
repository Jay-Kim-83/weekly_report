const { spawn, exec } = require('child_process');
const http = require('http');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

// 1. 서버 실행
const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

server.on('error', (err) => {
    console.error('서버 실행 실패:', err.message);
    process.exit(1);
});

// 2. 서버 응답 대기 후 Chrome 열기
let attempts = 0;
const maxAttempts = 20;

const check = setInterval(() => {
    attempts++;
    http.get(URL, (res) => {
        if (res.statusCode === 200) {
            clearInterval(check);
            console.log(`브라우저 열기: ${URL}`);
            const startCommand = process.platform === 'win32' ? 'start ""' :
                               process.platform === 'darwin' ? 'open' :
                               'xdg-open';
            exec(`${startCommand} "${URL}"`, (err) => {
                if (err) {
                    console.error(`브라우저 실행 실패: ${err.message}`);
                }
            });
        }
    }).on('error', () => {
        if (attempts >= maxAttempts) {
            clearInterval(check);
            console.error('서버 응답 없음. 시간 초과.');
            server.kill();
            process.exit(1);
        }
    });
}, 300);

// Ctrl+C로 종료 시 서버도 함께 종료
process.on('SIGINT', () => {
    server.kill();
    process.exit();
});

Node.js 프록시 서버를 Docker 이미지로 만들어 사용하는 방법

### 1. Node.js 프록시 서버 코드 준비

**index.js**
```javascript
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8082;

app.use(express.json());

app.use('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('URL is required');
        
        const response = await axios({
            url: targetUrl,
            method: req.method,
            headers: req.headers,
            data: req.body,
        });

        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send('Error while fetching data from target URL');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
```

### 2. Dockerfile 작성

Node.js 애플리케이션을 위한 Dockerfile을 작성합니다. 이 파일은 Docker 이미지가 어떻게 빌드될지를 지정합니다.

**Dockerfile**
```dockerfile
# Node.js 이미지를 베이스로 사용
FROM node:18

# 애플리케이션 디렉토리 생성
WORKDIR /usr/src/app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 앱 소스 복사
COPY . .

# 서버 실행 포트 열기
EXPOSE 8082

# 서버 시작 명령
CMD ["node", "index.js"]
```

### 3. package.json 준비

`package.json` 파일은 의존성 설치와 스크립트 실행을 위해 필요합니다. 필요한 경우 파일을 생성하고 다음과 같이 설정합니다:

**package.json**
```json
{
  "name": "proxy-server",
  "version": "1.0.0",
  "description": "Node.js proxy server",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "axios": "^0.21.1"
  }
}
```

### 4. Docker 이미지 빌드

준비가 끝나면 Docker 이미지를 빌드합니다. 터미널에서 다음 명령어를 실행하세요:

```bash
docker build -t node-proxy-server .
```

위 명령어는 현재 디렉토리에서 `Dockerfile`을 읽어 `node-proxy-server`라는 이름의 이미지를 생성합니다.

### 5. Docker 컨테이너 실행

이미지를 빌드한 후 컨테이너를 생성하고 실행합니다:

```bash
docker run -d -p 8082:8082 --name my-proxy-server node-proxy-server
```

이 명령어는 `8082` 포트를 외부로 노출하여 컨테이너가 백그라운드에서 실행됩니다.

### 6. Nginx 설정에서 Docker 프록시 서버로 연결

Nginx 설정 파일에서 Docker 컨테이너에서 실행 중인 프록시 서버로 연결하도록 합니다.

```nginx
location /proxy/ {
    proxy_pass http://localhost:8082;  # Docker 컨테이너의 프록시 서버로 연결
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 7. 테스트

설정이 완료되었으면 다음과 같이 프록시 서버를 호출할 수 있습니다:

```plaintext
http://your_domain_or_IP/proxy/?url=something.com?asdfa=123
```

이제 Node.js 프록시 서버가 Docker 컨테이너 내에서 실행 중이며, Nginx를 통해 접근 가능합니다.
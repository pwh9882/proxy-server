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

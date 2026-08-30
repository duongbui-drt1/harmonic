# 🌐 Hướng Dẫn Deploy Trang Web & Cấu Hình GitHub Actions

Tài liệu này hướng dẫn chi tiết cách triển khai (deploy) ứng dụng **HarmonicX Music Theory & Learning Workstation** thành một trang web trực tuyến và tự động hóa qua GitHub Actions.

---

## 🚀 Cách 1: Tự Động Deploy Lên GitHub Pages (Khuyên Dùng - Miễn Phí 100%)

Dự án đã được tích hợp sẵn quy trình CI/CD **GitHub Actions** tại `.github/workflows/deploy-pages.yml`. Mỗi khi bạn `git push` code lên nhánh `main` hoặc `master`, GitHub Actions sẽ tự động kiểm tra code, chạy test và deploy lên GitHub Pages.

### Các bước kích hoạt trên GitHub:

1. **Đẩy mã nguồn lên GitHub Repo:**
   ```bash
   git init
   git add .
   git commit -m "feat: setup project with github actions"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```

2. **Kích hoạt GitHub Pages trong Settings:**
   - Truy cập vào repository của bạn trên GitHub.
   - Chọn tab **Settings** (Cài đặt) > Mục **Pages** ở menu bên trái.
   - Tại mục **Build and deployment** > **Source**, chọn: **`GitHub Actions`**.
   - Lưu lại.

3. **Xem trang web sau khi deploy:**
   - Vào tab **Actions** trên GitHub để theo dõi tiến trình chạy workflow `Deploy to GitHub Pages`.
   - Khi hoàn thành (dấu tích xanh ✅), đường link trang web của bạn sẽ xuất hiện tại mục Pages:
     `https://<USERNAME>.github.io/<REPO_NAME>/`

---

## ⚡ Cách 2: Deploy Nhanh Lên Vercel / Netlify / Cloudflare Pages

### Deploy lên Vercel:
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Chọn **Add New Project** > Import repository chứa dự án này.
3. Cấu hình Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist`
4. Bấm **Deploy**. Trang web sẽ hoạt động ngay lập tức với SSL miễn phí và CDN toàn cầu.

### Deploy lên Netlify:
1. Truy cập [netlify.com](https://netlify.com) > **Add new site** > **Import an existing project**.
2. Chọn kho chứa GitHub của bạn.
3. Cấu hình:
   - **Build command**: `npm run build:client`
   - **Publish directory**: `dist`
4. Bấm **Deploy site**.

---

## 🐳 Cách 3: Deploy Full-Stack Node.js Container (Render / Cloud Run / Railway / Fly.io)

Nếu bạn muốn chạy cả Backend Server Express với API AI Gemini & ACE-Step:

### 1. Cấu hình Biến Môi Trường (Environment Variables):
- `GEMINI_API_KEY`: Khóa API Google Gemini của bạn (lấy tại Google AI Studio).
- `NODE_ENV`: `production`

### 2. Deploy với Dockerfile:
Dự án đã có sẵn `Dockerfile` chuẩn multi-stage tối ưu dung lượng:
```bash
# Build Docker image
docker build -t harmonicx-app .

# Chạy container
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" harmonicx-app
```

### 3. Deploy 1-Click trên Render:
- Tạo mới **Web Service** trên [Render.com](https://render.com).
- Chọn repo GitHub của bạn > Runtime: **Node** hoặc **Docker**.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Thêm biến môi trường `GEMINI_API_KEY`.

---

## 🧪 Kiểm Tra Quy Trình Tự Động Hóa (GitHub Actions Workflows)

Dự án gồm 2 workflows tự động:
1. **`CI - Continuous Integration`** (`.github/workflows/ci.yml`):
   - Chạy trên Node 18.x, 20.x, 22.x.
   - Kiểm tra linter, type-check TypeScript và chạy toàn bộ unit tests (`npm run test`).
2. **`Deploy to GitHub Pages`** (`.github/workflows/deploy-pages.yml`):
   - Tự động build production client và xuất bản lên GitHub Pages khi có code mới trên nhánh chính.

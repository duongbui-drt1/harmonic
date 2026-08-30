# 🎵 HARMONICS v3.0 - AI Music Chord Studio & Analyzer

> **HARMONICS v3.0** là một ứng dụng web studio sáng tác, phân tích lý thuyết hòa âm và tạo chuỗi hợp âm thông minh tích hợp **Google Gemini AI** cùng bàn phím Piano, đồ họa thế tay Guitar, khuông nhạc VexFlow và máy gõ nhịp Metronome tương tác.

![Powered by Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-7c5cbf?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-emerald?style=for-the-badge)

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 🤖 1. Trợ Lý AI Google Gemini (AI Music Composer & Analyzer)
- **Sáng Tác Theo Yêu Cầu**: Mô tả ý tưởng, cảm xúc, câu chuyện hoặc thể loại nhạc bằng ngôn ngữ tự nhiên (VD: *"Vòng hòa âm mưa buồn đêm khuya C Cải lương"*, *"Điệp khúc J-Pop sôi động"*, *"Jazz turnaround"*) để Gemini tự động tạo chuỗi hợp âm phù hợp.
- **Phân Tích Hòa Âm Chuyên Sâu**: Tự động phân tích lý thuyết âm nhạc, thang âm (scales), tính chất hòa âm, chuyển điệu và đề xuất cách phối khí dựa trên vòng hợp âm hiện tại.

### 🎹 2. Bàn Phím Piano & Đồ Họa Thế Tay Guitar Tương Tác
- **Interactive Piano Keyboard**: Nhận diện vị trí phím đàn, phát âm thanh chân thực bằng Web Audio API với hiệu ứng phát sáng đa giác quan.
- **Guitar Chord Diagram**: Hiển thị sơ đồ bấm hợp âm Guitar chính xác từng phím (fretboard matrix).

### 🎼 3. Khuông Nhạc Động VexFlow & Phân Tích Chuỗi (Chord Sequence Ribbon)
- **Sheet Music Renderer**: Tự động render khuông nhạc khóa Sol (Treble Clef) chuẩn hóa quốc tế với thư viện VexFlow.
- **Pattern Recognition**: Tự động nhận diện các vòng hòa âm kinh điển thế giới (*Pop 4 Hợp Âm Quốc Dân*, *J-Pop Royal Road*, *Jazz ii-V-I*, *Pachelbel Canon*, *Andalusian Cadence*...).
- **Harmonic Balance**: Thống kê tỉ lệ các bậc hợp âm **Chủ Âm (Tonic)**, **Hạ Thống Lĩnh (Subdominant)** và **Thống Lĩnh (Dominant)**.

### 🎧 4. Engine Âm Thanh Web Audio & Metronome
- **Tổng Hợp Âm Thanh Kỹ Thuật Số**: Phát âm thanh polyphonic chất lượng cao không cần nhạc cụ phần cứng ngoài.
- **Máy Gõ Nhịp Metronome**: Tự động giữ nhịp với âm lượng chuẩn xác (+20% độ rõ) giúp việc tập luyện trở nên dễ dàng.

### ♿ 5. Hỗ Trợ Tiếp Cận Người Khuyết Tật (WCAG 2.1 AA Compliant)
- **Điều Hướng Bàn Phím Toàn Diện**:
  - `Space`: Phát / Tạm dừng
  - `←` / `→`: Duyệt từng hợp âm trên Dòng thời gian
  - `↑` / `↓`: Tăng / Giảm nhịp độ Tempo (BPM)
  - `Ctrl + Z` / `Ctrl + Y`: Hoàn tác (Undo) & Làm lại (Redo)
  - `Shift + ?` (hoặc phím `H`): Mở bảng Hướng Dẫn Tiếp Cận
- **Screen Reader Friendly**: Đầy đủ thuộc tính `aria-label`, `role` và `aria-live` giúp người khiếm thị nhận biết nốt nhạc và giọng hát.
- **Tương Tác Thị Giác Cho Người Khiếm Thính**: Phím đàn và dòng thời gian nhấp nháy phát sáng theo nhịp điệu.

### 📚 6. Thư Viện 160+ Presets & Quản Lý Dự Án
- Tích hợp sẵn 160+ vòng hòa âm mẫu đa dạng thể loại (Pop, Ballad, J-Pop, Rock, R&B, Lo-Fi, Jazz, Cổ Điển...).
- Hỗ trợ Lưu / Tải dự án, Xuất định dạng MIDI, JSON, Sheet Music PDF và Audio.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Audio & Notation**: Web Audio API, VexFlow
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Backend Server**: Node.js, Express, tsx, esbuild

---

## 🚀 Cài Đặt & Chạy Dự Án (Getting Started)

### Yêu cầu hệ thống:
- Node.js version 18.x trở lên
- npm hoặc yarn

### 1. Cloned kho chứa git:
```bash
git clone <URL_KHO_CHỨA_GIT_CỦA_BẠN>
cd harmonics-chord-studio
```

### 2. Cài đặt các gói phụ thuộc (Dependencies):
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường (Environment Variables):
Tạo file `.env` tại thư mục gốc dựa trên mẫu `.env.example`:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Chạy ở chế độ Phát Triển (Development Mode):
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

### 5. Biên dịch Production Build:
```bash
npm run build
```

### 6. Khởi chạy Production Server:
```bash
npm start
```

---

## 🌐 Triển Khai & GitHub Actions CI/CD (Deployment)

Dự án đã được thiết lập sẵn **GitHub Actions**:
- **`.github/workflows/deploy-pages.yml`**: Tự động build và deploy trang web lên **GitHub Pages** miễn phí mỗi khi bạn push code lên nhánh `main`/`master`.
- **`.github/workflows/ci.yml`**: Tự động kiểm tra cú pháp, linter, TypeScript và chạy Unit Test trên các phiên bản Node.js 18, 20, 22.
- **`Dockerfile`**: Hỗ trợ đóng gói container cho Google Cloud Run, Render, Railway, Fly.io hoặc máy chủ VPS riêng.

👉 Xem hướng dẫn chi tiết từng bước tại [**DEPLOYMENT.md**](./DEPLOYMENT.md).

---

## 📜 Giấy Phép (License)

Dự án được phát hành theo giấy phép MIT License.

---

<p center>
  Crafted with ❤️ powered by <b>Google Gemini AI</b>
</p>

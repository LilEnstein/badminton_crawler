# BadmintonFinder — App Specification

**Version:** 0.1 
**Ngày:** April 2026  
**Tác giả:** Turin-Nguyen Anh Sang
**Trạng thái:** In progress

---

## 1. Tổng quan sản phẩm

### 1.1 Vấn đề

Người chơi cầu lông muốn tìm buổi giao lưu phù hợp thường phải:

- Vào thủ công hàng chục nhóm Facebook khác nhau
- Đọc từng bài đăng, tự lọc bằng mắt theo trình độ / khu vực / giờ / budget
- Nhắn tin hỏi thêm thông tin rồi nhiều khi đã đầy người
- Lặp lại mỗi ngày và vẫn hay bỏ lỡ sân phù hợp

### 1.2 Giải pháp

**BadmintonFinder** dùng mô hình Centralized Scraper: phía server duy trì một tài khoản Facebook bot đã join sẵn các nhóm giao lưu cầu lông, tự động crawl bài đăng bằng Playwright, phân tích bằng AI, rồi lưu vào database. Người dùng chỉ cần đăng nhập vào app (email / Google) — không cần cấp quyền Facebook — và nhận ngay danh sách buổi chơi được chấm điểm theo profile cá nhân.

### 1.3 Người dùng mục tiêu

| Segment | Mô tả |
|---|---|
| Người chơi phong trào | Trình độ Newbie → TB+, muốn tìm buổi giao lưu thường xuyên |
| Người mới học | Cần tìm nhóm cùng trình độ, không bị "chênh trình" |
| Người chơi thường xuyên | Muốn tiết kiệm thời gian tìm sân mỗi ngày |
| Quản lý nhóm / sân | (Phase 2) Muốn đăng tuyển người chơi dễ hơn |

---

## 2. Bảng trình độ cầu lông

Hệ thống sử dụng bảng 10 cấp độ chuẩn nội bộ để phân loại người dùng và khớp với thông tin từ bài đăng trên Facebook.

| Level | Tên | Kỹ thuật | Di chuyển | Chiến thuật | Mô tả nhanh |
|:---:|---|---|---|---|---|
| 1 | Newbie | Cầm vợt sai, đánh hụt nhiều | Rất chậm, đứng sai vị trí | Không có | Mới bắt đầu |
| 2 | Yếu | Đánh qua lưới nhưng không ổn định | Di chuyển chậm, thiếu bước chân | Không có | Chơi giải trí đơn giản |
| 3 | Trung bình yếu | Có thể clear, drop cơ bản nhưng lỗi nhiều | Biết di chuyển nhưng sai nhịp | Chưa biết điều cầu | Bắt đầu có nền tảng |
| 4 | TB- | Kỹ thuật cơ bản dùng được (clear, drop, smash nhẹ) | Di chuyển tạm ổn | Bắt đầu giữ cầu | Chơi được rally ngắn |
| 5 | TB | Kỹ thuật ổn định hơn, ít lỗi cơ bản | Di chuyển tương đối đúng | Biết đánh qua lại, tránh lỗi | Trình phổ biến |
| 6 | TB+ | Smash, drop, clear có kiểm soát | Di chuyển khá linh hoạt | Có ý đồ điều cầu đơn giản | Bắt đầu "có trình" |
| 7 | TB++ | Kỹ thuật đa dạng hơn (net shot, drive) | Di chuyển nhanh hơn, có split step | Biết ép lỗi đối thủ | Chơi trận nghiêm túc |
| 8 | TB+++ | Kỹ thuật ổn định, smash có lực | Di chuyển tốt, phản xạ khá | Biết đọc tình huống | Gần chạm mức khá |
| 9 | TB Khá | Ít lỗi, kiểm soát cầu tốt | Di chuyển hiệu quả toàn sân | Chiến thuật rõ ràng | Cửa trên với đa số TB |
| 10 | Khá | Kỹ thuật đầy đủ, ổn định, smash uy lực | Di chuyển nhanh, chuẩn footwork | Biết đọc trận & điều cầu | Chơi giải phong trào tốt |

### 2.1 Cách hệ thống dùng bảng trình độ

- **User profile:** Người dùng tự chọn level của mình khi onboarding (có hướng dẫn mô tả)
- **Khoảng chấp nhận:** User chọn ± 1–2 level so với mình (ví dụ: TB level 5 muốn chơi với 4–6)
- **AI parser:** Khi đọc bài đăng Facebook, AI map các từ khóa như _"TB+"_, _"có trình"_, _"newbie ok"_ → sang level tương ứng
- **Match score:** Level là một trong các tiêu chí chính để tính điểm phù hợp

### 2.2 Mapping từ ngữ thực tế → Level

| Từ khóa thường gặp trong bài đăng | Level tương ứng |
|---|---|
| "mới chơi", "newbie", "chưa biết gì" | 1–2 |
| "mới tập", "cơ bản", "cầu lông giải trí" | 2–3 |
| "TB", "trung bình", "chơi được" | 4–5 |
| "TB+", "có chút trình", "chơi khá ổn" | 5–6 |
| "TB++", "có trình", "đánh smash tốt" | 6–7 |
| "TB+++", "gần khá" | 7–8 |
| "Khá", "TB Khá", "phong trào tốt" | 9–10 |

---

## 3. Tính năng sản phẩm

### 3.1 Danh sách tính năng (MoSCoW)

#### Must Have — MVP

- [ ] Đăng nhập Facebook qua OAuth 2.0 (chỉ đọc)
- [ ] Chọn và quản lý danh sách nhóm Facebook muốn theo dõi
- [ ] Thu thập bài đăng tự động từ các nhóm đã chọn
- [ ] AI parser: bóc tách thông tin sân từ văn bản tự nhiên tiếng Việt
- [ ] Bộ lọc cá nhân: trình độ, khu vực / quận, budget, khung giờ, loại cầu, giới tính
- [ ] Danh sách kết quả có chấm điểm phù hợp
- [ ] Mở bài đăng gốc trên Facebook

#### Should Have

- [ ] Push notification khi có bài mới khớp bộ lọc
- [ ] Match score (0–100) hiển thị trên mỗi kết quả
- [ ] Bản đồ hiển thị vị trí sân
- [ ] Tính khoảng cách từ vị trí hiện tại đến sân
- [ ] Lọc: "Còn chỗ / Đầy" (nếu bài đăng có thông tin)

#### Nice to Have

- [ ] Lưu lịch sử buổi chơi đã tham gia
- [ ] Gợi ý nhóm FB liên quan cần theo dõi thêm
- [ ] Quick comment vào bài từ trong app
- [ ] Thống kê: tần suất chơi, trình độ phổ biến trong khu vực

---

## 4. Bộ lọc tìm kiếm

| Bộ lọc | Loại | Giá trị |
|---|---|---|
| Trình độ | Range | Level 1–10 (chọn khoảng) |
| Khu vực | Multi-select | Quận / huyện (Hà Nội, TP.HCM…) |
| Ngân sách | Range | VNĐ/buổi (slider, bước 10k) |
| Khung giờ | Multi-select | Sáng / Trưa / Chiều / Tối |
| Giới tính | Single-select | Nam / Nữ / Hỗn hợp / Không quan trọng |
| Loại cầu | Multi-select | Cầu nhựa / Cầu lông / Không quan trọng |
| Số người | Range | Tối thiểu – tối đa |
| Trạng thái | Single-select | Còn chỗ / Tất cả |

---

## 5. Luồng người dùng

### 5.1 Luồng onboarding

```
Mở app
  └─► Màn hình chào → "Kết nối Facebook"
        └─► Facebook OAuth popup (đọc nhóm, đọc bài đăng)
              └─► Điền profile cầu lông:
                    - Tên hiển thị
                    - Level bản thân (chọn từ bảng 10 cấp)
                    - Khu vực chơi thường (quận)
                    - Khung giờ ưa thích
                    - Budget/buổi
                    - Loại cầu
                    - Giới tính nhóm ưa thích
                        └─► Chọn nhóm Facebook muốn theo dõi
                              └─► Vào Dashboard
```

### 5.2 Luồng tìm sân (daily use)

```
Nhận push notification: "3 sân mới khớp hôm nay"
  └─► Mở app → Tab Khám phá
        └─► Xem danh sách (sorted by match score)
              └─► Nhấn vào bài → Xem chi tiết:
                    - Địa chỉ + bản đồ
                    - Thông tin đã parse (giờ, số người, level, budget)
                    - Match score breakdown
                    - Link bài gốc trên Facebook
                          └─► "Mở Facebook" → liên hệ trực tiếp
```

---

## 6. Màn hình & UI

### 6.1 Danh sách màn hình

| Màn hình | Mô tả |
|---|---|
| Splash / Onboarding | Đăng nhập FB, cấp quyền |
| Profile Setup | Điền thông tin người chơi |
| Dashboard | Feed buổi chơi hôm nay + filter nhanh |
| Khám phá (Feed) | Danh sách đầy đủ, lọc & sắp xếp |
| Chi tiết bài | Thông tin parse đầy đủ + bản đồ + link gốc |
| Quản lý nhóm | Thêm / bỏ nhóm FB đang theo dõi |
| Bộ lọc cá nhân | Cài đặt tất cả filter profile |
| Thông báo | Lịch sử push notification |
| Cài đặt | Tài khoản, quyền, giờ yên tĩnh |

### 6.2 Match Score breakdown (UI chi tiết)

Mỗi bài đăng hiển thị thanh điểm tổng và breakdown 5 tiêu chí:

```
Match Score: 87/100
  ├── Trình độ      ████████░░  24/30
  ├── Khu vực       ██████████  20/20
  ├── Budget        █████████░  18/20
  ├── Khung giờ     ████████░░  16/20
  └── Loại cầu      █████░░░░░   9/10
```

---

## 7. AI Parser — Thiết kế

### 7.1 Input / Output

**Input:** Text bài đăng Facebook thô (tiếng Việt, có thể sai chính tả, viết tắt)

**Output (JSON):**

```json
{
  "location": {
    "raw": "sân Thống Nhất, Đống Đa",
    "district": "Đống Đa",
    "city": "Hà Nội",
    "address": "Sân cầu lông Thống Nhất"
  },
  "datetime": {
    "date": "2026-04-22",
    "time_start": "06:00",
    "time_end": "08:00",
    "is_recurring": false
  },
  "skill_level": {
    "raw": "TB+",
    "level_min": 5,
    "level_max": 7
  },
  "budget": {
    "amount": 50000,
    "currency": "VND",
    "per": "session"
  },
  "gender": "mixed",
  "players_needed": 2,
  "total_players": 6,
  "shuttlecock_type": "feather",
  "contact": "@nguyenvan",
  "status": "open",
  "confidence": 0.91
}
```

### 7.2 Prompt strategy

- System prompt định nghĩa bảng mapping từ khóa → level (dùng bảng 2.2)
- Few-shot examples với các kiểu bài đăng thực tế phổ biến
- Output luôn là JSON thuần, không có markdown
- `confidence` < 0.6 → gắn tag "cần xem lại" và không hiển thị ở top feed

### 7.3 Các trường hợp cần xử lý đặc biệt

| Trường hợp | Cách xử lý |
|---|---|
| Không đề cập trình độ | `level_min: null` — hiển thị nhưng không tính vào match score |
| Giờ không rõ ("buổi sáng") | Parse thành khoảng (`06:00–11:00`) |
| Bài đăng tìm người hoặc thông báo sân | Phân biệt intent: `type: "looking_for_players"` vs `type: "court_available"` |
| Budget "tự túc", "chia nhau" | Gắn flag `budget_negotiable: true` |
| Bài cũ đã đủ người | Detect comment "đủ rồi", "full" → `status: "closed"` |

---

## 8. Kiến trúc hệ thống

### 8.1 Tech stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| Mobile app | React Native (Expo) | Cross-platform iOS + Android, fast dev |
| Backend API | Node.js + Express | Quen thuộc, ecosystem lớn |
| AI / NLP | Claude API (claude-sonnet) | Hiểu tiếng Việt tốt, JSON output ổn định |
| Auth (user) | Email / Google OAuth | User đăng nhập app — không cần FB |
| FB Scraper | Playwright (headless) | Groups API đã bị xóa từ 4/2024 |
| Database | PostgreSQL | Structured data, query filter phức tạp |
| Cache | Redis | Cache kết quả parse, rate limit |
| Queue | Bull (Redis-based) | Job crawl định kỳ theo nhóm |
| Maps | Google Maps SDK | Geocoding + hiển thị vị trí |
| Notifications | Firebase Cloud Messaging | Push iOS + Android |

### 8.2 Sơ đồ luồng dữ liệu

```
[Facebook Groups]
       │  (crawl mỗi 15 phút / event-driven)
       ▼
[Crawler Service]
       │  raw posts
       ▼
[Job Queue (Bull)]
       │  parse job
       ▼
[AI Parser (Claude API)]
       │  structured JSON
       ▼
[PostgreSQL]
       │  query + filter
       ▼
[API Server]
       │  REST/GraphQL
       ▼
[React Native App]  ←── [Firebase Push Notification]
```

### 8.3 Facebook data access — kiến trúc đã xác định

> **Lưu ý quan trọng:** Facebook đã xóa hoàn toàn Groups API vào tháng 4/2024 — không còn quyền `groups_access_member_info` hay `publish_to_groups`. Mọi cách tiếp cận qua official API đều không khả thi. Hướng duy nhất còn lại là browser automation với tài khoản thật.

**Mô hình Centralized Scraper (đã chọn)**

App duy trì 1–3 tài khoản Facebook bot phía server. Bot đã join sẵn các nhóm cầu lông target, Playwright chạy headless dùng session/cookie của bot để crawl bài đăng định kỳ. Người dùng của app không cần đụng đến Facebook ở bất kỳ bước nào.

```
[Facebook Groups]
       │  Playwright crawl mỗi 15–30 phút
       ▼
[Bot Account (session/cookie)]
       │  raw HTML → bài đăng thô
       ▼
[Job Queue (Bull)]
       │  parse job
       ▼
[AI Parser (Gemini Pro / Claude)]
       │  structured JSON
       ▼
[PostgreSQL]
       │  query + filter theo profile user
       ▼
[API Server]  ←── user đăng nhập bằng email / Google, không cần FB
       │
       ▼
[Web / Mobile App]  ←── [Firebase Push Notification]
```

**Checklist setup tài khoản bot**

- [ ] Tạo tài khoản FB mới bằng số điện thoại phụ hoặc email riêng
- [ ] Điền profile bình thường, đặt avatar — tránh bị flag tài khoản ảo
- [ ] Join các nhóm cầu lông target thủ công, hoạt động nhẹ 1–2 tuần trước khi crawl
- [ ] Lưu cookie vào file, encrypt trước khi đưa vào config
- [ ] Crawl interval ≥ 15 phút, thêm random delay (2–8s) giữa các request
- [ ] Chỉ đọc — không like, không comment, không share
- [ ] Chuẩn bị tài khoản dự phòng trong trường hợp bị tạm khóa

---

## 9. Quyền & bảo mật

### 9.1 Quyền phía user (app)

| Quyền | Mức độ | Lý do |
|---|---|---|
| Vị trí thiết bị | Tùy chọn | Tính khoảng cách đến sân |
| Push notification | Tùy chọn | Alert khi có sân mới khớp |

> **Không yêu cầu bất kỳ quyền Facebook nào từ người dùng.** Toàn bộ tương tác với Facebook nằm phía server (bot account).

### 9.2 Bảo mật bot account

| Hạng mục | Cách xử lý |
|---|---|
| Cookie / session | Mã hóa AES-256, không commit lên git |
| Tài khoản dự phòng | Chuẩn bị sẵn 1–2 bot account dự phòng |
| Rate limit | Crawl ≥ 15 phút/lần, random delay 2–8s/request |
| Phát hiện bot | Chạy với user-agent thực, viewport đầy đủ, tránh headless fingerprint |

### 9.3 Cam kết với người dùng

- Không lưu nội dung bài đăng gốc lâu dài — chỉ lưu kết quả đã parse
- Không chia sẻ dữ liệu cá nhân với bên thứ ba
- Không đăng bài, bình luận, hay tương tác thay người dùng trên bất kỳ nền tảng nào

---

## 10. Lộ trình phát triển

### Giai đoạn 1 — Cá nhân (Personal build)

> Mục tiêu: Dùng được cho cá nhân, một mình tự deploy, không cần scale. AI dùng **Gemini Pro** (Google AI Studio — đã có tài khoản) hoặc **Llama** (local/free tier) để giữ chi phí bằng 0.

**Facebook Bot & Thu thập dữ liệu**
- [ ] Tạo tài khoản Facebook bot, join các nhóm cầu lông Hà Nội
- [ ] Setup Playwright crawl bài đăng từ nhóm đã chọn, dùng session/cookie của bot
- [ ] Lưu trữ local (SQLite hoặc PostgreSQL đơn giản)

**AI Parser**
- [ ] Tích hợp Gemini Pro API (Google AI Studio key)
- [ ] Prompt parse bài đăng → JSON: địa điểm, giờ, level, budget, giới tính, loại cầu
- [ ] Mapping từ khóa → bảng level 1–10

**UI tìm đối**
- [ ] Giao diện web đơn giản (Next.js hoặc React)
- [ ] Bộ lọc: trình độ, khu vực, khung giờ, budget, loại cầu
- [ ] Danh sách kết quả có match score cơ bản
- [ ] Nhấn → mở bài gốc Facebook
- [ ] Chạy local hoặc self-host (Vercel / Railway free tier)

**Tiêu chí hoàn thành giai đoạn 1:** Tự dùng được hàng ngày để tìm sân, không cần thao tác thủ công trên Facebook.

---

### Giai đoạn 2 — Mở rộng & nâng cấp AI

> Mục tiêu: Tốt hơn, nhanh hơn, có thể chia sẻ cho người khác dùng. Nâng lên AI provider xịn hơn (Claude API, GPT-4o…) khi cần độ chính xác cao hoặc có thêm người dùng.

**AI & Chất lượng parse**
- [ ] Nâng lên provider tốt hơn (Claude API hoặc GPT-4o) khi Gemini không đủ
- [ ] Fine-tune prompt với dữ liệu thực tế đã thu thập ở giai đoạn 1
- [ ] Detect trạng thái bài: "còn chỗ / đã đủ người" từ comment
- [ ] Confidence score — lọc bỏ bài parse kém chính xác

**Tính năng nâng cao**
- [ ] Push notification khi có sân mới khớp (Firebase)
- [ ] Match score breakdown chi tiết (5 tiêu chí)
- [ ] Map view — hiển thị vị trí sân + khoảng cách
- [ ] Lịch sử buổi chơi đã tham gia

**Hạ tầng**
- [ ] Multi-user support: nhiều người có thể đăng nhập và dùng chung app
- [ ] Job queue cho crawler (tránh rate limit Facebook)
- [ ] Deploy ổn định, có monitoring cơ bản

---

## 11. Rủi ro & giải pháp

| Rủi ro | Mức độ | Giải pháp |
|---|---|---|
| Bot account bị Facebook tạm khóa | Trung bình | Chuẩn bị 1–2 tài khoản dự phòng, crawl chậm + random delay |
| Facebook thay đổi HTML structure → Playwright bị vỡ | Trung bình | Dùng selector linh hoạt (text-based thay vì class), có alert khi crawl lỗi |
| Bài đăng viết tắt, sai chính tả → parse sai | Trung bình | Fine-tune prompt với dữ liệu thực, thêm `confidence` score |
| Bài đăng đã cũ / đã đủ người | Thấp | Detect keyword trong comment, filter bài > 24h |
| Cookie hết hạn → mất session | Thấp | Auto-detect lỗi login, alert để refresh thủ công |

---

## 12. Định nghĩa thành công (KPI)

| Metric | Mục tiêu Phase 1 | Mục tiêu Phase 3 |
|---|---|---|
| Độ chính xác parse | ≥ 80% trường đúng | ≥ 92% |
| Thời gian từ bài đăng → hiển thị trên app | < 30 phút | < 10 phút |
| Người dùng active / tháng | 20 (internal beta) | 200 |
| Tỷ lệ retention D7 | — | ≥ 40% |
| Match score satisfaction | — | ≥ 4/5 sao |

---

_Tài liệu này được cập nhật lần cuối: April 2026. Mọi thay đổi lớn về scope cần review lại bảng MoSCoW và lộ trình._

# BadmintonFinder — Design System & UI Specification

**Version:** 1.0  
**Ngày:** April 2026  
**Platform:** React Native (Expo) — iOS + Android  
**Trạng thái:** Design Ready

---

## 0. Triết lý thiết kế

> **"Find your game. Own your court."**

BadmintonFinder không phải app thể thao bình thường. Giao diện phản ánh tinh thần của người chơi cầu lông thực sự: **nhanh, quyết đoán, linh hoạt**. Mọi màn hình đều được thiết kế để người dùng tìm thấy buổi chơi phù hợp **trong dưới 10 giây**.

**Aesthetic direction:** *Dark Sport Premium* — nền tối đậm (sân đêm), điểm nhấn xanh lá điện (cầu lông phát sáng), typography bold & athletic. Không generic, không pastel, không "app sức khỏe" nhàm chán.

**Nguyên tắc:**
- **Speed first** — thông tin quan trọng nhất luôn hiển thị đầu tiên
- **Match score is king** — con số 87/100 phải đập vào mắt ngay lập tức
- **Friction-free** — onboarding 3 bước, tìm sân 1 tap
- **Alive** — micro-animation ở mọi tương tác, không có màn hình "chết"

---

## 1. Color System

### 1.1 Bảng màu chính

```
Primary Palette
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Midnight Navy     #0B1520    ← Background chính
Deep Court        #112035    ← Surface cards
Court Shadow      #1A3050    ← Surface elevated
Shuttle Green     #00E87A    ← Accent chính (CTA, score, active)
Shuttle Glow      #00FF88    ← Hover / pressed state
Amber Rally       #FF7A2F    ← Warning, "còn ít chỗ"
Rally Red         #FF3B5C    ← Error, "đầy người"
Ice White         #F0F6FF    ← Text primary
Fog               #8FA8C0    ← Text secondary
Steel             #3D5A78    ← Border, divider
```

### 1.2 Semantic Tokens

| Token | Value | Dùng khi |
|---|---|---|
| `color.background.primary` | `#0B1520` | Nền app, màn hình chính |
| `color.background.card` | `#112035` | Card, modal, bottom sheet |
| `color.background.elevated` | `#1A3050` | Input, chip, tag |
| `color.accent.primary` | `#00E87A` | Nút CTA, badge active, score fill |
| `color.accent.glow` | `#00FF88` | Pressed state, animation glow |
| `color.accent.warning` | `#FF7A2F` | Còn 1–2 chỗ, sắp hết giờ |
| `color.accent.danger` | `#FF3B5C` | Full, lỗi, cancel |
| `color.text.primary` | `#F0F6FF` | Headings, body text chính |
| `color.text.secondary` | `#8FA8C0` | Subtext, metadata |
| `color.text.disabled` | `#3D5A78` | Placeholder, disabled |
| `color.border.default` | `#1E3A58` | Viền card, input |
| `color.border.focus` | `#00E87A` | Input đang focus |

### 1.3 Gradient

```css
/* Hero gradient — dùng cho Splash, onboarding header */
gradient.hero: linear-gradient(135deg, #0B1520 0%, #112F4E 50%, #0B2A1F 100%)

/* Score gradient — thanh điểm match */
gradient.score.high:   linear-gradient(90deg, #00E87A, #00FF88)   /* 70–100 */
gradient.score.mid:    linear-gradient(90deg, #FF7A2F, #FFB347)   /* 40–69  */
gradient.score.low:    linear-gradient(90deg, #FF3B5C, #FF6B8A)   /* 0–39   */

/* Card shimmer — loading skeleton */
gradient.shimmer: linear-gradient(90deg, #112035 25%, #1A3050 50%, #112035 75%)

/* Accent glow — dùng cho nút CTA */
gradient.cta: linear-gradient(135deg, #00E87A 0%, #00C96A 100%)
```

---

## 2. Typography

### 2.1 Font families

| Role | Font | Weight | Nguồn |
|---|---|---|---|
| **Display / Hero** | `Bebas Neue` | 400 (chỉ có 1 weight) | Google Fonts |
| **Heading** | `Plus Jakarta Sans` | 600, 700, 800 | Google Fonts |
| **Body / UI** | `Plus Jakarta Sans` | 400, 500 | Google Fonts |
| **Mono / Score** | `Space Mono` | 400, 700 | Google Fonts — dùng cho con số match score |

> **Lý do:** Bebas Neue là font "thi đấu" — thấy là nghĩ ngay đến bảng điểm thể thao. Plus Jakarta Sans hỗ trợ tốt tiếng Việt với dấu chuẩn, sạch đẹp trên mobile. Space Mono cho match score để nhấn mạnh tính "số liệu".

### 2.2 Type Scale

```
Display XL     Bebas Neue / 56px / tracking: 2px
Display L      Bebas Neue / 40px / tracking: 1.5px
Heading 1      Plus Jakarta Sans 800 / 28px / leading: 34px
Heading 2      Plus Jakarta Sans 700 / 22px / leading: 28px
Heading 3      Plus Jakarta Sans 600 / 18px / leading: 24px
Body L         Plus Jakarta Sans 400 / 16px / leading: 24px
Body M         Plus Jakarta Sans 400 / 14px / leading: 21px
Body S         Plus Jakarta Sans 400 / 12px / leading: 18px
Caption        Plus Jakarta Sans 500 / 11px / leading: 16px / uppercase
Score XL       Space Mono 700 / 48px
Score L        Space Mono 700 / 32px
Score M        Space Mono 700 / 24px
Label          Plus Jakarta Sans 600 / 13px / uppercase / tracking: 0.8px
```

### 2.3 Ví dụ áp dụng

```
Màn hình Feed:
├── "87" → Score XL (#00E87A)
├── "Sân Đống Đa – Sáng nay" → Heading 3 (#F0F6FF)
├── "50.000đ · TB+ · Còn 2 chỗ" → Body M (#8FA8C0)
└── "PHƯỚC PHÁT SPORT" → Caption (#8FA8C0, uppercase)

Nút CTA:
└── "Xem ngay" → Label (uppercase, #0B1520 on #00E87A)
```

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (8px base)

```
space-1:   4px    ← Giữa icon và label nhỏ
space-2:   8px    ← Padding inline nhỏ
space-3:   12px   ← Gap giữa các element trong card
space-4:   16px   ← Padding card, padding màn hình
space-5:   20px   ← Gap lớn hơn giữa sections
space-6:   24px   ← Section spacing
space-8:   32px   ← Spacing lớn
space-10:  40px   ← Spacing rất lớn (hero sections)
space-12:  48px   ← Bottom nav height
```

### 3.2 Border Radius

```
radius-sm:   6px    ← Tag, chip, badge
radius-md:   12px   ← Button, input
radius-lg:   16px   ← Card
radius-xl:   24px   ← Bottom sheet, modal
radius-full: 9999px ← Avatar, pill button
```

### 3.3 Layout Grid

```
Safe area:    iOS top bar + Android status bar (auto)
Side padding: 16px (màn hình thường) / 20px (modal)
Column gap:   12px
Card gap:     12px (vertical feed)
Bottom nav:   56px height + safe area inset
```

### 3.4 Shadow / Elevation

```
shadow-card:   0 4px 24px rgba(0, 232, 122, 0.08)
shadow-glow:   0 0 20px rgba(0, 232, 122, 0.25)  ← CTA buttons
shadow-modal:  0 -8px 40px rgba(0, 0, 0, 0.6)
shadow-avatar: 0 2px 12px rgba(0, 0, 0, 0.4)
```

---

## 4. Iconography

### 4.1 Nguồn icon

Tất cả icon sử dụng từ **[Flaticon](https://www.flaticon.com)** — định dạng SVG, style **outline** (màu `#8FA8C0`) và **filled** (màu `#00E87A` khi active). Kích thước tiêu chuẩn: **24×24px** cho UI, **32×32px** cho tab bar.

### 4.2 Icon library — Màn hình chính

| Vị trí | Icon | Flaticon keyword | URL gợi ý |
|---|---|---|---|
| Tab: Khám phá | Lưới cầu lông | `badminton` | flaticon.com/search?q=badminton |
| Tab: Bản đồ | Địa điểm | `location pin sport` | flaticon.com/search?q=location+pin |
| Tab: Thông báo | Chuông | `bell notification` | flaticon.com/search?q=notification+bell |
| Tab: Profile | Người dùng | `user profile` | flaticon.com/search?q=user+profile |
| Nút Google OAuth | Logo Google | `google logo` | flaticon.com/search?q=google+logo |
| Nút Email | Phong thư | `email outline` | flaticon.com/search?q=email+letter |
| Level selector | Cup / trophy | `trophy sport` | flaticon.com/search?q=sport+trophy |
| Filter: Giờ | Đồng hồ | `clock time` | flaticon.com/search?q=clock+outline |
| Filter: Khu vực | Bản đồ | `map district` | flaticon.com/search?q=map+outline |
| Filter: Budget | Tiền | `money wallet` | flaticon.com/search?q=money+wallet |
| Filter: Loại cầu | Shuttlecock | `shuttlecock` | flaticon.com/search?q=shuttlecock |
| Filter: Giới tính | Người | `gender mixed` | flaticon.com/search?q=gender |
| Match score | Ngôi sao / sét | `lightning sport` | flaticon.com/search?q=lightning+bolt |
| Mở FB | Facebook | `facebook logo` | flaticon.com/search?q=facebook |
| Trạng thái: Còn chỗ | Check xanh | `checkmark circle` | flaticon.com/search?q=check+circle |
| Trạng thái: Đầy | X đỏ | `close circle` | flaticon.com/search?q=close+circle |
| Khoảng cách | Đường đi | `route distance` | flaticon.com/search?q=route+distance |
| Chia sẻ | Mũi tên share | `share arrow` | flaticon.com/search?q=share+arrow |
| Cài đặt | Bánh răng | `settings gear` | flaticon.com/search?q=settings+gear |
| Onboarding 1 | Vợt cầu lông | `badminton racket` | flaticon.com/search?q=badminton+racket |
| Onboarding 2 | Nhóm người | `group people sport` | flaticon.com/search?q=team+sport |
| Onboarding 3 | Tên lửa / launch | `rocket launch` | flaticon.com/search?q=rocket+launch |

> **Pack gợi ý:** [Sport Outline Pack](https://www.flaticon.com/packs/sport-outline) và [Basic UI Elements](https://www.flaticon.com/packs/basic-ui-elements-4) — tất cả outline style, dễ đổi màu bằng SVG `fill` / `stroke`.

### 4.3 Quy tắc dùng icon

```
Default (inactive):  stroke="#8FA8C0"  fill="none"
Active (tab/button): stroke="#00E87A"  fill="rgba(0,232,122,0.12)"
On dark button:      stroke="#0B1520"  fill="#0B1520"
Danger:              stroke="#FF3B5C"
Warning:             stroke="#FF7A2F"
```

---

## 5. Component Library

### 5.1 Buttons

#### Primary CTA Button

```
Background:    gradient.cta (#00E87A → #00C96A)
Text:          Label style, #0B1520 (dark on green)
Height:        52px
Padding:       0 24px
Border radius: 12px
Shadow:        shadow-glow (green glow)
Icon:          16px Flaticon, tinted #0B1520 (trái hoặc phải)

States:
  Default   → gradient.cta + shadow-glow
  Pressed   → scale(0.97) + brightness(0.9) — 100ms spring
  Disabled  → opacity: 0.3, no shadow
  Loading   → spinner #0B1520 thay icon, no press

Example: [⚡ Xem ngay] [🔍 Tìm sân] [✓ Xác nhận]
```

#### Secondary Button (Outline)

```
Background:    transparent
Border:        1.5px solid #00E87A
Text:          Label style, #00E87A
Height:        52px
Border radius: 12px

States:
  Pressed → fill rgba(0,232,122,0.08) + scale(0.97)
```

#### Ghost Button (Text only)

```
Background:    transparent
Text:          Body M / Plus Jakarta Sans 600, #8FA8C0
No border, no shadow

States:
  Pressed → text #F0F6FF
```

#### Icon Button (Tròn)

```
Size:          44×44px
Background:    #1A3050
Border radius: radius-full
Icon:          24×24px centered

States:
  Pressed → scale(0.9) + background #00E87A (icon #0B1520)
```

#### Social Login Button

```
Height:        52px
Background:    #1A3050
Border:        1px solid #1E3A58
Border radius: 12px
Layout:        [Logo 24px] [Space 12px] [Text Body M 500]

Variants:
  Google: Logo Google Flaticon + "Tiếp tục với Google"
  Email:  Icon email Flaticon  + "Đăng nhập bằng Email"

States:
  Pressed → border-color #00E87A + scale(0.98)
```

---

### 5.2 Input Fields

```
Height:        52px
Background:    #112035
Border:        1.5px solid #1E3A58
Border radius: 12px
Padding:       0 16px
Text:          Body L, #F0F6FF
Placeholder:   Body L, #3D5A78
Icon (left):   24px Flaticon, #3D5A78

States:
  Default:     border #1E3A58
  Focus:       border #00E87A + shadow 0 0 0 3px rgba(0,232,122,0.15)
  Filled:      border #3D5A78
  Error:       border #FF3B5C + helper text #FF3B5C bên dưới
  Disabled:    opacity 0.4
```

#### Search Bar (màn hình Feed)

```
Height:        48px
Background:    #1A3050
Border radius: radius-full (pill shape)
Icon trái:     🔍 search Flaticon, #8FA8C0
Icon phải:     🎚 filter Flaticon (nếu có filter active → #00E87A + badge đỏ số)
Placeholder:   "Tìm sân, quận, trình độ..."
```

---

### 5.3 Match Score Card (Component chính)

```
Kích thước:    full-width, height: ~160px
Background:    #112035
Border:        1px solid #1E3A58
Border radius: 16px
Padding:       16px
Shadow:        shadow-card

Layout:
┌────────────────────────────────────────────────┐
│  [Ảnh thumbnail sân 72×72px]  [Score badge]    │
│  rounded-lg                   ┌──────────┐     │
│                               │  Score   │     │
│  🏸 Sân Đống Đa – Sáng nay   │  87      │     │
│  📍 Đống Đa · 1.2km           │  /100    │     │
│  🕖 06:00–08:00               └──────────┘     │
│  👥 Còn 2 chỗ  ·  TB+  ·  50k                 │
│  ─────────────────────────────────────         │
│  [████████░░ 87%] Thanh score gradient         │
│  [🔗 Xem bài gốc]    [Chia sẻ ⬆]             │
└────────────────────────────────────────────────┘

Score badge:
  70-100 → #00E87A (xanh)
  40-69  → #FF7A2F (cam)
  0-39   → #FF3B5C (đỏ)

Trạng thái:
  Còn chỗ: ● #00E87A + "Còn X chỗ"
  Sắp đầy: ● #FF7A2F + "Còn 1 chỗ"
  Đầy:     ● #FF3B5C + "Đã đầy"
  
Pressed animation:
  scale(0.98) + shadow tăng → 150ms spring
```

---

### 5.4 Filter Chips

```
Height:        34px
Padding:       0 12px
Background:    #1A3050
Border:        1px solid #1E3A58
Border radius: radius-full
Text:          Body S / 500, #8FA8C0
Icon (nếu có): 16px flaticon, trái

Active state:
  Background: rgba(0,232,122,0.12)
  Border:     #00E87A
  Text:       #00E87A
  Icon:       #00E87A
  
Animation:
  Toggle → scale bounce 0.95→1.05→1 / 200ms
```

#### Filter Chips có trong app:

```
[🕖 Sáng]  [🌤 Chiều]  [🌙 Tối]
[📍 Đống Đa]  [📍 Cầu Giấy]
[TB]  [TB+]  [TB++]
[🏸 Cầu lông]  [⚡ Cầu nhựa]
[👥 Hỗn hợp]  [♂ Nam]
[💰 < 50k]  [💰 50-100k]
```

---

### 5.5 Level Selector (Onboarding)

```
Layout: Grid 2 cột, mỗi ô ~160px
Background card: #112035
Border radius: 16px
Border: 1.5px solid #1E3A58

Nội dung mỗi ô:
  [Level badge] ← Space Mono 700 / 28px / #00E87A
  [Tên level]   ← Heading 3 / #F0F6FF
  [Mô tả ngắn] ← Body S / #8FA8C0

Selected state:
  border: 2px solid #00E87A
  background: rgba(0,232,122,0.08)
  Badge: #00E87A glow shadow

Ví dụ ô "TB+" (Level 6):
  ┌──────────────┐
  │     TB+      │  ← Bebas Neue, to
  │   Có trình   │
  │ Smash có     │
  │ kiểm soát   │
  └──────────────┘
```

---

### 5.6 Match Score Breakdown (Chi tiết)

```
Container:
  Background: #112035
  Border radius: 16px
  Padding: 20px

Header:
  [Score XL: "87"] ["/100" Body L #8FA8C0]
  Progress ring 80px hoặc pill dày 12px

Breakdown rows (5 tiêu chí):
  [Icon 20px] [Label Body S 500] [Bar 100px] [Score Body S Space Mono]

Row layout:
  🎯 Trình độ    [████████░░]  24/30
  📍 Khu vực     [██████████]  20/20
  💰 Budget      [█████████░]  18/20
  🕖 Khung giờ  [████████░░]  16/20
  🏸 Loại cầu   [█████░░░░░]   9/10

Bar colors:
  Đầy (100%):   #00E87A
  Cao (≥70%):   #00E87A / 80% opacity
  Trung (≥40%): #FF7A2F
  Thấp (<40%):  #FF3B5C
  
Animation: Bars fill từ 0% → giá trị thực, 600ms ease-out (stagger 80ms/row)
```

---

### 5.7 Bottom Navigation

```
Height:        56px + safe area
Background:    #0D1A2A (slightly darker)
Border top:    1px solid #1E3A58
Blur:          backdrop-filter: blur(20px) — nếu React Native hỗ trợ

4 tabs:
  ① Khám phá  [🏸 icon]  "Khám phá"
  ② Bản đồ    [📍 icon]  "Bản đồ"
  ③ Thông báo [🔔 icon]  "Thông báo"  ← Badge badge đỏ
  ④ Tôi       [👤 icon]  "Tôi"

Active tab:
  Icon: #00E87A (filled), glow dưới icon
  Label: Caption #00E87A
  
Inactive tab:
  Icon: #3D5A78 (outline)
  Label: Caption #3D5A78

Transition: Icon pop scale 1→1.2→1 / 200ms khi chuyển tab
```

---

### 5.8 Avatar

```
Kích thước:  40px (list), 72px (profile page), 96px (edit profile)
Border:      2px solid #00E87A
Border radius: radius-full
Background:  #1A3050 (placeholder)
Placeholder: Initials text, Space Mono 700, #00E87A

Level badge (góc dưới phải):
  Size: 20px
  Background: #00E87A
  Text: Space Mono 700 / 10px / #0B1520 (số level)
  Border: 2px solid #0B1520
```

---

### 5.9 Toast / Snackbar

```
Position:    Bottom, trên Bottom Nav, 16px margin
Height:      52px
Background:  #F0F6FF
Border radius: 12px
Padding:     0 16px
Shadow:      0 8px 32px rgba(0,0,0,0.5)
Text:        Body M / #0B1520

Variants:
  Success: border-left 4px #00E87A + icon ✓
  Error:   border-left 4px #FF3B5C + icon ✕
  Info:    border-left 4px #8FA8C0 + icon ℹ

Animation: slide-up + fade / 300ms ease-out
           auto-dismiss sau 3s (slide-down + fade)
```

---

## 6. Màn hình chi tiết

### 6.1 Splash Screen

```
Duration:     2.0 giây
Background:   gradient.hero (radial từ center)

Center:
  [Logo badge 96×96px]
    ↑ Icon vợt cầu lông + đường bay cầu (SVG custom)
    background: rgba(0,232,122,0.1)
    border: 2px solid #00E87A
    border-radius: 28px
    shadow-glow
  
  [App name] "BadmintonFinder"
    Font: Bebas Neue / 40px / #F0F6FF / tracking: 3px
  
  [Tagline] "Find your game."
    Font: Plus Jakarta Sans 400 / 16px / #8FA8C0

Bottom:
  Loading indicator: 3 dots nhảy / màu #00E87A

Animation timeline:
  0ms:    Logo scale 0 → 1 (spring, bounce)
  300ms:  App name fade + slide up
  500ms:  Tagline fade in
  800ms:  Loading dots xuất hiện
  2000ms: Transition sang Onboarding / Dashboard
```

---

### 6.2 Onboarding (3 slides)

```
Shared layout:
  Background: gradient.hero
  Top: progress dots (3 dots, active = #00E87A, inactive = #3D5A78)
  Illustration: 240×240px (Flaticon SVG pack sport)
  Skip button: góc phải trên, Ghost button "Bỏ qua"
  Next button: Primary CTA, full-width, bottom

─── Slide 1: "Tìm sân trong 10 giây" ───
  Illustration: Icon badminton racket lớn + shield search
                (flaticon.com/search?q=badminton+search)
  Heading 1: "Tìm sân trong 10 giây"
  Body L: "Không cần lướt hàng chục nhóm Facebook. 
           BadmintonFinder tự làm thay bạn."
  CTA: "Bắt đầu →"

─── Slide 2: "Khớp theo trình độ bạn" ───
  Illustration: Group người chơi thể thao
                (flaticon.com/search?q=team+sport+people)
  Heading 1: "Đúng trình độ. Đúng khu vực."
  Body L: "AI phân tích bài đăng, chấm điểm phù hợp 
           từ 0–100 theo profile cá nhân bạn."
  CTA: "Tiếp theo →"

─── Slide 3: "Chỉ cần đăng nhập" ───
  Illustration: Icon rocket launch / lightning
                (flaticon.com/search?q=rocket+launch)
  Heading 1: "Không cần tài khoản Facebook"
  Body L: "Đăng nhập bằng Google hoặc Email. 
           Chúng tôi lo phần còn lại."
  CTA: "Bắt đầu →"
```

---

### 6.3 Màn hình Đăng nhập / Đăng ký

```
Background:   gradient.hero
Logo:         56×56px, top center (giống splash, nhỏ hơn)
App name:     Display L "BadmintonFinder" / Bebas Neue

Heading:      Heading 2 "Chào mừng trở lại" / #F0F6FF
Sub:          Body M "Tiếp tục tìm sân nhé 🏸" / #8FA8C0

─── Đăng nhập Google ───
[Logo Google 24px]  Tiếp tục với Google
  → Social Login Button (full-width)

─── Hoặc ───
  Divider: "— hoặc —" / Caption / #3D5A78

─── Đăng nhập Email ───
Input: [✉ icon] Email address
Input: [🔒 icon] Mật khẩu  [👁 toggle hiện/ẩn]
CTA: Primary "Đăng nhập"
Link: "Quên mật khẩu?" / Ghost button

─── Chưa có tài khoản? ───
Body M: "Chưa có tài khoản? "
Link: "Đăng ký ngay" / #00E87A / underline

─── Màn hình Đăng ký ───
Tương tự đăng nhập, thêm:
Input: [👤 icon] Tên hiển thị
Input: [✉ icon] Email
Input: [🔒 icon] Mật khẩu
Input: [🔒 icon] Xác nhận mật khẩu
CTA: Primary "Tạo tài khoản"
Checkbox: "Tôi đồng ý với Điều khoản sử dụng" (Body S / #8FA8C0)

─── Transition giữa Login ↔ Register ───
Animation: Horizontal slide (Login → right, Register → left)
Duration: 350ms ease-in-out
Shared elements (Logo, App name) không animate (stay)
```

---

### 6.4 Profile Setup (Onboarding sau đăng ký)

```
Header:       Progress bar 4 bước (1/4, 2/4, 3/4, 4/4) / màu #00E87A
Back button:  góc trái / Icon ← / Ghost

─── Bước 1: Tên & Avatar ───
  Avatar upload center: 
    96×96px circle + [📷 icon] "Chọn ảnh" (Camera flaticon)
    hoặc initials placeholder
  Input: Tên hiển thị
  CTA: "Tiếp theo"

─── Bước 2: Trình độ của bạn ───
  Heading 2: "Bạn chơi ở mức nào?"
  Body M: "Chọn level phù hợp nhất với bạn"
  Grid: 10 ô Level Selector (2 cột × 5 hàng)
    Scroll dọc (ScrollView)
  Level range: 
    Subtext: "Bạn muốn chơi với người ±"
    Stepper: [–] [1] [+] level / #00E87A
  CTA: "Tiếp theo"

─── Bước 3: Khu vực & Lịch chơi ───
  Dropdown: Quận / huyện (multi-select chip)
  Heading 3: "Khung giờ thường chơi"
  Chip group: [🌅 Sáng] [🌤 Trưa] [☀ Chiều] [🌙 Tối]
  Heading 3: "Ngân sách mỗi buổi"
  Range slider: 0 → 200k (step 10k)
    Label: "xx.000đ – yy.000đ / buổi"
  CTA: "Tiếp theo"

─── Bước 4: Tùy chọn thêm ───
  Heading 3: "Loại cầu ưa thích"
  Chip: [🏸 Cầu lông] [⚡ Cầu nhựa] [Không quan trọng]
  Heading 3: "Giới tính nhóm"
  Chip: [♂ Nam] [♀ Nữ] [👥 Hỗn hợp] [Không quan trọng]
  CTA: Primary "Vào BadmintonFinder 🏸"
    → Animation đặc biệt: confetti nhẹ + transition sang Dashboard
```

---

### 6.5 Dashboard (Tab Khám phá)

```
─── Header ───
  Left:  Avatar 40px + tên "Chào, Minh! 👋"  (Body M)
  Right: [🔔 Bell icon] ← badge số thông báo mới

─── Hero section ───
  Background: gradient card với accent glow nhẹ
  Heading 1: "3 sân mới hôm nay"  / Bebas Neue / #00E87A
  Body M: "Khớp với profile của bạn · Cập nhật lúc 06:15"
  [→ Xem tất cả] Ghost button

─── Filter bar (horizontal scroll) ───
  Chips: [Tất cả] [Sáng] [Chiều] [Tối] [Đống Đa] [TB+] [< 50k]
  Cuối: [🎚 Bộ lọc] → mở Filter bottom sheet

─── Danh sách Match Cards ───
  FlatList vertical scroll
  Gap: 12px
  Pull-to-refresh: spinner #00E87A

─── Empty state ───
  Illustration: icon sad shuttlecock (SVG)
  Heading 3: "Chưa có sân phù hợp"
  Body M: "Thử mở rộng bộ lọc hoặc đợi cập nhật tiếp theo"
  CTA: "Chỉnh bộ lọc"

─── Loading skeleton ───
  3 card placeholder
  Shimmer animation: gradient.shimmer / 1.5s infinite
```

---

### 6.6 Chi tiết bài đăng

```
─── Header ───
  Back button [←] / Icon button
  Title: Heading 3 "Chi tiết sân"
  Right: [⬆ Share icon button]

─── Match Score hero ───
  Background card gradient: #112035
  Score XL: "87" / Space Mono / #00E87A
  "/100" / Body L / #8FA8C0
  Badge: "Rất phù hợp" / Caption / #0B1520 on #00E87A pill
  Breakdown section (component 5.6)

─── Thông tin sân ───
  Heading 3: "Thông tin buổi chơi"
  Rows:
  [📍] Địa chỉ:    Sân cầu lông Thống Nhất, Đống Đa
  [🕖] Thời gian:  06:00 – 08:00, Thứ Tư 23/4
  [👥] Trình độ:   TB+ (Level 5–7)
  [💰] Budget:     50.000đ / người
  [🏸] Cầu:       Cầu lông (feather)
  [👤] Giới tính:  Hỗn hợp
  [✅] Còn chỗ:   Còn 2 người

─── Bản đồ ───
  MapView: 200px height, border radius 12px
  Marker: custom pin #00E87A (SVG)
  [🗺 Mở Google Maps] → external link

─── Bài gốc ───
  Card dạng preview:
  [fb logo] "Đăng bởi Nhóm Cầu Lông Hà Nội"
  Body M: "15 dòng đầu bài đăng gốc..."
  CTA Outline: [f] "Xem bài gốc trên Facebook"
  
─── Bottom CTA ─── (sticky)
  Background: #0D1A2A + blur
  Primary full-width: "Mở Facebook để liên hệ 🏸"
    → deeplink hoặc open URL
```

---

### 6.7 Filter Bottom Sheet

```
Trigger:       "Bộ lọc" chip hoặc icon filter
Backdrop:      rgba(0,0,0,0.7) blur
Sheet height:  80vh
Background:    #112035
Border radius: 24px 24px 0 0
Handle:        32×4px pill / #3D5A78 / center top

─── Header ───
  Heading 2: "Bộ lọc tìm kiếm"
  Right: [✕] Icon button

─── Nội dung (scroll) ───

  Section: Trình độ
    Dual-handle range slider: Level 1–10
    Display: "TB (4) – TB+ (6)"
    Ticks: dấu gạch 10 điểm với label

  Section: Khu vực
    Multi-select chips: [Đống Đa] [Cầu Giấy] [Tây Hồ] ...
    (scroll horizontal)

  Section: Ngân sách
    Dual-handle range slider: 0 – 200.000đ (step 10k)
    Display: "30.000đ – 80.000đ"

  Section: Khung giờ
    Chips: [🌅 Sáng] [🌤 Trưa] [☀ Chiều] [🌙 Tối]

  Section: Giới tính
    Chips: [♂ Nam] [♀ Nữ] [👥 Hỗn hợp] [Không quan trọng]

  Section: Loại cầu
    Chips: [🏸 Cầu lông] [⚡ Cầu nhựa] [Không quan trọng]

  Section: Trạng thái
    Toggle: "Chỉ hiện còn chỗ" / Switch #00E87A

─── Footer (sticky) ───
  [Ghost: Xóa tất cả]    [Primary: Áp dụng (3 kết quả)]
  Số kết quả update real-time khi chỉnh filter
```

---

### 6.8 Màn hình Thông báo

```
Header: Heading 1 "Thông báo"
Right: [Đánh dấu tất cả đã đọc] Ghost button

─── Notification item ───
  Height: 80px
  Layout:
    Left: Icon 40×40px circle (#1A3050)
      Loại: 🏸 sân mới / 🔔 nhắc nhở / 📣 hệ thống
    Center:
      Heading 3: "3 sân mới khớp với bạn"
      Body S: "Sáng nay · Đống Đa · TB+"
      Caption: "5 phút trước" / #3D5A78
    Right (nếu chưa đọc): dot 8px / #00E87A

  Unread: background rgba(0,232,122,0.04) + left border 3px #00E87A
  Read:   background transparent

─── Empty state ───
  Icon: bell Flaticon 96px / #3D5A78
  Heading 3: "Chưa có thông báo"
  Body M: "Bật thông báo để nhận sân mới phù hợp"
  CTA: "Bật thông báo"
```

---

### 6.9 Màn hình Profile & Cài đặt

```
─── Profile header ───
  Background: gradient.hero
  Avatar: 80px center
  Heading 1: "Nguyễn Văn Minh"
  Body M: "TB+ · Đống Đa · Hà Nội"
  [✏ Chỉnh sửa] → Outline button nhỏ

─── Level card ───
  Background: #112035, border #00E87A
  Layout 2 col:
    Left: "Trình độ bạn"  Score L "TB+" / #00E87A
    Right: Level range "Chơi với TB (4) – TB++ (7)"
  [Cập nhật trình độ] Ghost button

─── Stats row ───
  3 ô:  Buổi đã tham gia / Sân ưa thích / Ngày chơi
        Score M / #00E87A + Caption / #8FA8C0

─── Settings sections ───

  Section: Tài khoản
    [👤] Thông tin cá nhân
    [🔒] Đổi mật khẩu
    [🔔] Cài đặt thông báo
    [📍] Vị trí mặc định

  Section: Ứng dụng
    [🎚] Bộ lọc mặc định
    [🌙] Chế độ hiển thị (Auto/Sáng/Tối)
    [ℹ] Về ứng dụng
    [📋] Điều khoản & Chính sách

  Section:
    [🚪] Đăng xuất  ← text màu #FF3B5C
```

---

## 7. Animation & Motion

### 7.1 Nguyên tắc

```
Duration:  Phần lớn 150–350ms. Không có gì > 600ms (trừ onboarding)
Easing:    spring(damping: 15, stiffness: 150) cho interactive
           ease-out cho enter, ease-in cho exit
Physics:   Scale, opacity, translate — không rotate phức tạp trừ icon
```

### 7.2 Transition giữa màn hình

| Transition | Type | Duration | Easing |
|---|---|---|---|
| Push (vào màn hình con) | Slide từ phải | 350ms | ease-in-out |
| Pop (back) | Slide ra phải | 300ms | ease-in-out |
| Modal / Bottom sheet | Slide từ dưới | 350ms | spring |
| Tab switch | Fade + scale nhẹ | 200ms | ease-out |
| Splash → App | Fade | 400ms | ease-in-out |

### 7.3 Micro-interactions

```
Nút press:       scale 1.0 → 0.96 / 100ms / spring bounce về
Card press:      scale 1.0 → 0.98, shadow tăng / 150ms
Tab icon active: scale 1.0 → 1.2 → 1.0 / 200ms / bounce
Match score bar: fill từ 0 → value / 600ms / ease-out / stagger 80ms
Chip toggle:     scale 0.95 → 1.05 → 1.0 / 200ms
Pull-to-refresh: spinner #00E87A / rotate 360° infinite
Loading dots:    Y-bounce stagger 150ms each dot
Notification dot: pulse scale 1.0 → 1.3 → 1.0 / 2s infinite (khi có mới)
Badge số:        pop scale 0 → 1.2 → 1.0 khi number thay đổi
```

### 7.4 Onboarding illustration animation

```
Slide 1: Icon racket → rotate nhẹ ±5° / swing 1.5s infinite (swing easing)
Slide 2: Group icons → fan out từ center / stagger 100ms / spring
Slide 3: Rocket → float Y ±8px / 2s ease-in-out infinite
```

---

## 8. Dark Mode (mặc định) & Light Mode

App mặc định **Dark Mode**. Light Mode là tùy chọn (Settings).

| Token | Dark | Light |
|---|---|---|
| background.primary | `#0B1520` | `#F4F8FF` |
| background.card | `#112035` | `#FFFFFF` |
| background.elevated | `#1A3050` | `#E8F0F8` |
| text.primary | `#F0F6FF` | `#0B1520` |
| text.secondary | `#8FA8C0` | `#4A6780` |
| border.default | `#1E3A58` | `#C8D8E8` |
| accent.primary | `#00E87A` | `#00B85F` |

---

## 9. Accessibility

```
Contrast:      Tất cả text/background ≥ 4.5:1 (WCAG AA)
               Text primary (#F0F6FF) on #0B1520 = 16.7:1 ✓
               #00E87A on #0B1520 = 8.4:1 ✓
               
Touch target:  Tất cả interactive element ≥ 44×44px
               
Labels:        accessibilityLabel cho mọi icon button
               Score card: "Buổi chơi ở Đống Đa, điểm phù hợp 87 trên 100"
               
Font scale:    Hỗ trợ system font size (Dynamic Type iOS / Font Scale Android)
               Không hardcode fontSize với đơn vị px thuần — dùng rem/sp
               
Motion:        Respect prefers-reduced-motion:
               → Tắt splash animation, micro-interaction, shimmer
               → Giữ lại transition màn hình (essential)
```

---

## 10. Assets & Export

### 10.1 App Icon

```
Concept: Vợt cầu lông cách điệu + chữ "B" (BadmintonFinder)
         hoặc icon shuttle (cầu) với đường bay = biểu tượng "finder"

Background: #00E87A (xanh lá điện) — nổi bật trên cả iOS và Android
Shape: Rounded rectangle (iOS auto-clip, Android adaptive icon)

Kích thước export:
  1024×1024px  ← App Store / Play Store
  512×512px    ← Google Play feature graphic
  192×192px    ← PWA / web favicon
  (Expo sẽ auto-resize xuống các size nhỏ hơn)
```

### 10.2 Splash screen

```
Background: #0B1520 (solid — không gradient để tránh render lag)
Center icon: 128×128px logo SVG
No text (tránh bị cắt khi font chưa load)
```

### 10.3 File structure gợi ý

```
assets/
  icons/
    flaticon/          ← SVG download từ Flaticon
      badminton.svg
      location.svg
      clock.svg
      ...
    custom/            ← SVG tự thiết kế
      logo.svg
      app-icon.svg
      splash-logo.svg
  images/
    onboarding-1.png
    onboarding-2.png
    onboarding-3.png

src/
  design/
    colors.ts          ← export COLOR tokens
    typography.ts      ← export FONT constants
    spacing.ts         ← export SPACING tokens
    shadows.ts         ← export SHADOW styles
```

### 10.4 colors.ts skeleton

```typescript
export const Colors = {
  background: {
    primary:  '#0B1520',
    card:     '#112035',
    elevated: '#1A3050',
  },
  accent: {
    primary: '#00E87A',
    glow:    '#00FF88',
    warning: '#FF7A2F',
    danger:  '#FF3B5C',
  },
  text: {
    primary:   '#F0F6FF',
    secondary: '#8FA8C0',
    disabled:  '#3D5A78',
  },
  border: {
    default: '#1E3A58',
    focus:   '#00E87A',
  },
} as const;
```

---

## 11. Design Checklist (trước khi implement)

- [ ] Import Bebas Neue + Plus Jakarta Sans + Space Mono từ Google Fonts vào Expo
- [ ] Setup color tokens trong `design/colors.ts`
- [ ] Download icon pack từ Flaticon (sport outline style)
- [ ] Tạo `Button`, `Input`, `MatchCard`, `ScoreBar`, `FilterChip` components trước
- [ ] Test trên iPhone SE (nhỏ) + iPhone 14 Pro Max + Samsung Galaxy S23
- [ ] Dark mode toggle hoạt động đúng với tất cả component
- [ ] Score animation bars chạy mượt trên low-end device
- [ ] Bottom sheet / modal có đúng safe area inset
- [ ] Tất cả icon có accessibilityLabel
- [ ] Pull-to-refresh hoạt động ở màn hình Feed và Thông báo

---

_Design document này được tạo cho BadmintonFinder v0.3 · April 2026._  
_Cập nhật cùng lúc với App-spec.md khi có thay đổi scope._

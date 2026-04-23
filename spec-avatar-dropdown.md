# Spec: Avatar Dropdown Menu — Thay thế màn hình Profile cũ

**Ticket:** UI-042  
**Ngày:** April 2026  
**Tác giả:** _(owner)_  
**Trạng thái:** Ready for dev  
**Ảnh hưởng:** `TopBar`, `ProfileScreen`, `navigation`

---

## 1. Tóm tắt thay đổi

### 1.1 Vấn đề hiện tại

Màn hình Profile hiện tại chiếm toàn bộ một tab trong Bottom Navigation, hiển thị thông tin người dùng theo dạng trang đứng với các nút hành động lớn. Pattern này:

- Chiếm một slot tab quý giá (4 tab → chỉ còn 3 tab cho tính năng chính)
- Buộc người dùng phải chuyển tab để thực hiện hành động đơn giản như đăng xuất
- Giao diện nặng, không phù hợp với hành vi thực tế (người dùng hiếm khi vào trang Profile)

### 1.2 Giải pháp

Thay toàn bộ màn hình Profile bằng **Avatar Dropdown Menu** xuất phát từ `TopBar`, theo pattern phổ biến của Facebook, Twitter/X, GitHub. Người dùng bấm vào avatar nhỏ ở góc phải TopBar → dropdown xuất hiện với đầy đủ thông tin và hành động.

### 1.3 Kết quả kỳ vọng

- Bottom Navigation giải phóng 1 tab (có thể dùng cho tính năng mới như "Bản đồ" hoặc "Lịch sử")
- Giảm số bước để logout: 2 bước → 1 bước (bấm avatar → bấm Đăng xuất)
- UI gọn hơn, đúng mental model của người dùng mobile hiện đại

---

## 2. Phạm vi thay đổi

### 2.1 Files bị ảnh hưởng

```
src/
  components/
    TopBar/
      TopBar.tsx              ← EDIT: thêm AvatarButton + dropdown trigger
      TopBar.styles.ts        ← EDIT: thêm styles mới
      AvatarDropdown.tsx      ← NEW: component dropdown
      AvatarDropdown.styles.ts← NEW: styles cho dropdown
  screens/
    ProfileScreen.tsx         ← DELETE hoặc chuyển thành EditProfileScreen
    EditProfileScreen.tsx     ← RENAME: chỉ giữ form chỉnh sửa
  navigation/
    MainNavigator.tsx         ← EDIT: xóa tab Profile, điều chỉnh routes
    routes.ts                 ← EDIT: cập nhật route names
  hooks/
    useAvatarDropdown.ts      ← NEW: state management cho dropdown
  types/
    navigation.types.ts       ← EDIT: cập nhật type cho route params
```

### 2.2 Không thay đổi

- Logic xác thực / Auth context
- API calls liên quan đến user profile
- `EditProfileScreen` nội dung bên trong (chỉ đổi cách navigate tới)
- Bottom tab cho Khám phá, Bản đồ, Thông báo

---

## 3. Thiết kế component

### 3.1 Tổng quan cấu trúc

```
<TopBar>
  ├── <LogoSection />               ← Logo + App name (trái)
  └── <NavActions>                  ← Góc phải
        ├── <NotificationButton />  ← Bell icon với badge
        └── <AvatarButton>          ← Avatar 34px (trigger dropdown)
              └── <LevelBadge />    ← Badge nhỏ hiển thị level
</TopBar>

<AvatarDropdown>                    ← Rendered via Modal (overlay toàn màn hình)
  ├── <DropdownHeader>              ← Avatar lớn + tên + email + level pill
  ├── <DropdownSection primary>
  │     ├── <DropdownItem> Chỉnh sửa hồ sơ
  │     └── <DropdownItem> Bộ lọc cá nhân
  ├── <DropdownSection secondary>
  │     ├── <DropdownItem> Thông báo
  │     └── <DropdownItem> Cài đặt
  └── <DropdownSection danger>
        └── <DropdownItem> Đăng xuất
</AvatarDropdown>
```

### 3.2 AvatarButton

**Vị trí:** Góc phải TopBar, cạnh NotificationButton.

**Kích thước:** 34×34px, `borderRadius: 17` (hình tròn).

**Nội dung:**
- Nếu user có `avatarUrl`: hiển thị ảnh `Image` component với `resizeMode="cover"`
- Nếu không có ảnh: hiển thị 2 chữ cái đầu của `displayName` (ví dụ: "Turin" → "TU"), font `Space Mono 700`, màu `#0B1520`
- Background: `#00E87A` (khi dùng initials) hoặc transparent (khi có ảnh)
- Border: `2px solid #00E87A`

**LevelBadge:**
- Vị trí: `position: absolute`, `bottom: -3`, `right: -3`
- Kích thước: tự động theo nội dung, tối thiểu 16×14px
- Nội dung: `"Lv.{level}"` — ví dụ "Lv.5"
- Font: `Space Mono 700`, `fontSize: 7`
- Background: `#00E87A`, border `1.5px solid #0D1E30`
- `borderRadius: 8`

**States:**

| State | Visual |
|---|---|
| Default | opacity 1.0 |
| Pressed | opacity 0.8, scale 0.94 |
| Dropdown open | Border thêm `box-shadow / elevation` nhẹ |
| Loading (auth chưa load) | Skeleton shimmer thay avatar |

**Props:**

```typescript
interface AvatarButtonProps {
  displayName: string;         // Tên hiển thị → lấy 2 chữ đầu
  avatarUrl?: string;          // URL ảnh đại diện (optional)
  level: number;               // Level 1–10 hiển thị trên badge
  isDropdownOpen: boolean;     // Để styling khi đang mở
  onPress: () => void;         // Callback mở/đóng dropdown
  accessibilityLabel?: string; // Default: "Tài khoản của {displayName}"
}
```

---

### 3.3 AvatarDropdown

**Cách render:** Dùng React Native `Modal` với `transparent={true}` và `animationType="none"` (tự handle animation bằng `Animated` API để kiểm soát chính xác hơn).

**Vị trí dropdown:** Absolute, xuất phát từ góc trên bên phải — `top: STATUSBAR_HEIGHT + TOPBAR_HEIGHT + 8`, `right: 16`. Không gắn vào Modal center mà gắn sát TopBar.

> **Lưu ý kỹ thuật:** Đo `STATUSBAR_HEIGHT` bằng `StatusBar.currentHeight` (Android) và `useSafeAreaInsets().top` (iOS) để tránh bị cắt bởi notch.

**Kích thước:** `width: 240`, `maxHeight: 420` (scroll nếu nội dung dài).

**Nền:** `#112035`, `borderRadius: 14`, `borderWidth: 0.5`, `borderColor: #1E3A58`.

**Backdrop:** Overlay `rgba(0,0,0,0)` (trong suốt) fullscreen bên dưới dropdown — khi bấm vào backdrop thì đóng dropdown. Không cần dim background vì dropdown nhỏ.

**Props:**

```typescript
interface AvatarDropdownProps {
  visible: boolean;
  onClose: () => void;
  user: {
    displayName: string;
    email: string;
    avatarUrl?: string;
    level: number;
    levelLabel: string;       // "TB+", "TB", v.v.
    district: string;         // "Thanh Xuân"
    city: string;             // "Hà Nội"
    levelRange: number;       // ±N (khoảng chấp nhận)
  };
  onEditProfile: () => void;
  onEditFilters: () => void;
  onNotificationSettings: () => void;
  onSettings: () => void;
  onLogout: () => void;
}
```

---

### 3.4 Cấu trúc nội dung dropdown

#### Section 1 — Header (không phải action, chỉ hiển thị)

```
┌─────────────────────────────────────┐
│  [Avatar 38px]  Turin               │
│                 user2@gmail.com      │
│                                     │
│  [TB · Lv.5 (±2)]  Hà Nội · Thanh Xuân │
└─────────────────────────────────────┘
```

- Avatar 38px, initials hoặc ảnh, border `#00E87A`
- Tên: `Plus Jakarta Sans 700 / 13px / #F0F6FF`
- Email: `10px / #8FA8C0`
- Level pill: background `rgba(0,232,122,0.12)`, border `rgba(0,232,122,0.25)`, text `#00E87A / 10px / 600`
- Khu vực: `#8FA8C0 / 10px` kế bên level pill

#### Section 2 — Primary actions

| Item | Icon (Flaticon) | Subtext |
|---|---|---|
| Chỉnh sửa hồ sơ | user-edit outline | "Trình độ, khu vực, ngân sách" |
| Bộ lọc cá nhân | filter-alt outline | "Giờ chơi, loại cầu, giới tính" |

- Icon container: 28×28px, `borderRadius: 8`, background `rgba(0,232,122,0.10)`
- Icon màu `#00E87A`, size 14×14px
- Main text: `12px / 500 / #F0F6FF`
- Subtext: `10px / 400 / #8FA8C0`
- Row height: ~52px (có subtext) hoặc 40px (không có subtext)

#### Section 3 — Secondary actions

| Item | Icon (Flaticon) | Subtext |
|---|---|---|
| Thông báo | bell outline | — |
| Cài đặt | settings-gear outline | — |

- Icon container: background `rgba(255,255,255,0.05)`
- Icon màu `#8FA8C0`
- Main text: `12px / 400 / #8FA8C0`
- Row height: 40px

#### Section 4 — Danger

| Item | Icon (Flaticon) | Note |
|---|---|---|
| Đăng xuất | logout / sign-out outline | Cần confirm dialog |

- Icon container: background `rgba(255,59,92,0.10)`
- Icon màu `#FF3B5C`
- Main text: `12px / 500 / #FF3B5C`
- **Không có subtext**

**Divider giữa các section:** `height: 0.5`, `backgroundColor: #1A3050`, `marginHorizontal: 0`

---

## 4. Hành vi & tương tác

### 4.1 Mở dropdown

**Trigger:** Bấm `AvatarButton` trên TopBar.

**Điều kiện:** User đã đăng nhập và auth state đã load xong (`isAuthLoading === false`).

**Animation mở:**

```
Timing: 180ms
Easing: Easing.out(Easing.cubic)

Animated values:
  opacity:   0 → 1
  scaleX:    0.92 → 1  (transform-origin: top right)
  scaleY:    0.92 → 1
  translateY: -8 → 0
```

Dùng `Animated.parallel` để chạy đồng thời opacity + scale + translate.

### 4.2 Đóng dropdown

**Triggers:**
1. Bấm lại `AvatarButton`
2. Bấm vào backdrop (vùng ngoài dropdown)
3. Bấm vào bất kỳ `DropdownItem` nào (đóng trước khi navigate)
4. Hardware back button (Android)
5. App đi vào background (`AppState change`)
6. Navigation event (màn hình thay đổi)

**Animation đóng:**

```
Timing: 140ms
Easing: Easing.in(Easing.cubic)

Animated values: ngược lại so với mở
  opacity:    1 → 0
  scaleX:     1 → 0.92
  scaleY:     1 → 0.92
  translateY: 0 → -8
```

Gọi `onClose()` callback sau khi animation kết thúc (dùng `.start(callback)`).

### 4.3 Bấm vào DropdownItem

**Sequence:**

```
1. Highlight row (background #1A3050) — instant
2. Đóng dropdown (animation 140ms)
3. Sau khi dropdown đóng xong → thực thi action
```

**Không** navigate ngay lập tức khi đang animate — tránh jank.

### 4.4 Đăng xuất — Confirm Dialog

Bấm "Đăng xuất" **không** logout ngay. Phải hiện confirm dialog:

```
Title:   "Đăng xuất?"
Body:    "Bạn sẽ cần đăng nhập lại để tiếp tục tìm sân."
Buttons:
  [Huỷ]          → đóng dialog, không làm gì
  [Đăng xuất]    → gọi authContext.logout() → navigate về LoginScreen
```

- Dialog: React Native `Alert.alert()` (native OS dialog)
- Nút "Đăng xuất" trong dialog: `style: "destructive"` (iOS hiển thị màu đỏ native)

### 4.5 Scroll trong dropdown (nếu nội dung dài)

Nội dung dropdown dùng `ScrollView` với `scrollEnabled` tự động dựa trên chiều cao màn hình:

```typescript
const maxDropdownHeight = screenHeight * 0.6; // 60% chiều cao màn hình
```

Nếu content > maxDropdownHeight → scroll bật. Nếu không → hiển thị full, không scroll.

---

## 5. State management

### 5.1 Hook `useAvatarDropdown`

```typescript
// src/hooks/useAvatarDropdown.ts

export function useAvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValue]);

  const close = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      callback?.();
    });
  }, [animatedValue]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Đóng khi app vào background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && isOpen) close();
    });
    return () => subscription.remove();
  }, [isOpen, close]);

  // Animated style
  const dropdownStyle = {
    opacity: animatedValue,
    transform: [
      {
        scaleX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        scaleY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 0],
        }),
      },
    ],
  };

  return { isOpen, open, close, toggle, dropdownStyle };
}
```

### 5.2 Vị trí state

`isOpen` state chỉ cần live trong component `TopBar` (hoặc screen chứa TopBar). Không cần đưa lên global state (Redux/Context) vì dropdown là UI-only, không ảnh hưởng business logic.

```
TopBar (local state: isOpen)
  └── AvatarButton (nhận isOpen, onPress)
  └── AvatarDropdown (nhận visible, onClose, user data)
```

User data (`displayName`, `email`, `level`, v.v.) lấy từ `useAuth()` hook đã có sẵn.

---

## 6. Navigation changes

### 6.1 Xóa tab Profile

**Trước:**
```
Bottom Tabs: [Khám phá] [Bản đồ] [Thông báo] [Profile]
```

**Sau:**
```
Bottom Tabs: [Khám phá] [Bản đồ] [Thông báo] [Lịch sử]  ← slot mới
```

_(Slot thứ 4 có thể dùng cho tính năng Lịch sử hoặc để trống tạm)_

### 6.2 Route cho EditProfile

`EditProfileScreen` vẫn tồn tại nhưng navigate từ dropdown thay vì từ tab:

```typescript
// Trong AvatarDropdown
onEditProfile={() => {
  navigation.navigate('EditProfile'); // Stack navigation
}}
```

`EditProfileScreen` nên nằm trong Stack Navigator chứa tab hiện tại (không phải một tab riêng):

```
RootStack
  ├── MainTabs (Bottom Tab Navigator)
  │     ├── ExploreTab
  │     ├── MapTab
  │     ├── NotificationsTab
  │     └── HistoryTab
  ├── EditProfileScreen    ← Stack screen, navigate từ dropdown
  ├── EditFiltersScreen    ← Stack screen mới (tách từ Profile cũ)
  └── SettingsScreen
```

### 6.3 Back navigation từ EditProfile

Khi user bấm Back từ `EditProfileScreen`:
- Navigate về tab đang active trước khi mở (không reset về tab đầu)
- Dùng `navigation.goBack()` — hoạt động đúng với Stack Navigator

---

## 7. Giao diện chi tiết — Đặc tả pixel

### 7.1 TopBar sau thay đổi

```
Height: 52px
Background: #0D1E30
Border bottom: 0.5px solid #1E3A58
Padding horizontal: 16px

Layout (flex row, align center, justify space-between):
  Left:
    Logo icon:  28×28px, borderRadius: 8, background: #00E87A
    App name:   "BadmintonFinder" | Plus Jakarta Sans 700 | 14px | #F0F6FF | marginLeft: 8
  Right (flex row, gap: 10px):
    NotificationButton: 34×34px circle, background: #1A3050
    AvatarButton:       34×34px circle (xem 3.2)
```

### 7.2 Dropdown geometry

```
Position:  absolute
Top:       SafeAreaTop + 52 + 8     (8px gap từ TopBar)
Right:     16px
Width:     240px
MaxHeight: screenHeight * 0.6

Padding: 0 (các section tự có padding riêng)
Background: #112035
BorderRadius: 14px
Border: 0.5px solid #1E3A58

Shadow (iOS):
  shadowColor: #000
  shadowOffset: { width: 0, height: 8 }
  shadowOpacity: 0.4
  shadowRadius: 24

Elevation (Android): 12
```

### 7.3 Dropdown Header

```
Padding: 14px 14px 12px 14px
BorderBottom: 0.5px solid #1A3050

Avatar row:
  Avatar:       38×38px circle
  Gap:          10px
  Name:         Plus Jakarta Sans 700 / 13px / #F0F6FF
  Email:        Plus Jakarta Sans 400 / 10px / #8FA8C0

Level row (marginTop: 8px):
  Level pill:
    Background:   rgba(0,232,122,0.12)
    Border:       0.5px solid rgba(0,232,122,0.25)
    BorderRadius: 20px
    Padding:      2px 8px
    Text:         Plus Jakarta Sans 600 / 10px / #00E87A
  Location text:
    marginLeft: 6px
    10px / #8FA8C0
```

### 7.4 Dropdown Item (có subtext)

```
Padding: 9px 14px
MinHeight: 52px
FlexDirection: row
AlignItems: center
Gap: 10px

Icon container:
  Size:         28×28px
  BorderRadius: 8px
  
Icon SVG:
  Size:  14×14px
  
Text block:
  Main:  Plus Jakarta Sans 500 / 12px / #F0F6FF (hoặc #8FA8C0 cho secondary, #FF3B5C cho danger)
  Sub:   Plus Jakarta Sans 400 / 10px / #8FA8C0
  Gap:   1px

Pressed state: backgroundColor: #1A3050
```

### 7.5 Section divider

```
Height:           0.5px
BackgroundColor:  #1A3050
MarginHorizontal: 0 (full width)
```

---

## 8. Accessibility

| Element | accessibilityLabel | accessibilityRole | accessibilityHint |
|---|---|---|---|
| AvatarButton | "Tài khoản của {displayName}" | `button` | "Bấm để mở menu tài khoản" |
| Dropdown (khi mở) | "Menu tài khoản" | `menu` | — |
| Item: Chỉnh sửa hồ sơ | "Chỉnh sửa hồ sơ" | `menuitem` | "Đi đến màn hình chỉnh sửa" |
| Item: Đăng xuất | "Đăng xuất" | `menuitem` | "Yêu cầu xác nhận" |
| Backdrop | "Đóng menu" | `button` | "Bấm để đóng menu tài khoản" |

**Focus management (iOS VoiceOver / Android TalkBack):**
- Khi dropdown mở → focus tự động chuyển vào `DropdownHeader`
- Khi dropdown đóng → focus trả về `AvatarButton`
- Trap focus trong dropdown khi đang mở (không cho tab ra ngoài)

**Reduced motion:**

```typescript
import { AccessibilityInfo } from 'react-native';

const isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
// Nếu true: duration = 0, bỏ scale animation, chỉ fade opacity
```

---

## 9. Edge cases & error handling

### 9.1 User chưa có displayName

Nếu `displayName` rỗng hoặc null:
- Initials fallback: dùng `email` lấy 2 ký tự đầu trước `@`
- Nếu email cũng null: hiển thị icon user generic (SVG) thay initials

### 9.2 Avatar URL bị lỗi / timeout

```typescript
<Image
  source={{ uri: avatarUrl }}
  onError={() => setAvatarLoadFailed(true)}
  // Nếu fail → render initials thay thế
/>
```

### 9.3 Level null hoặc chưa set

Nếu `user.level` là null (user chưa hoàn thành onboarding):
- Badge hiển thị `"?"` thay vì số
- Dropdown header hiển thị `"Chưa xác định"` thay level pill
- Item "Chỉnh sửa hồ sơ" highlight nhẹ (border `#00E87A`) để nhắc user điền

### 9.4 Logout fail (network error)

```
Nếu authContext.logout() throw error:
  1. Đóng dropdown
  2. Hiện Toast: "Đăng xuất thất bại. Thử lại?"
  3. Không navigate
  4. Retry button trong Toast → gọi lại logout
```

### 9.5 Dropdown bị cắt ở màn hình nhỏ (iPhone SE — 375px)

Trên màn hình nhỏ, kiểm tra:

```typescript
const { width: screenWidth } = Dimensions.get('window');
const dropdownWidth = Math.min(240, screenWidth - 32); // Không vượt quá màn hình
```

Nếu `screenHeight < 600`:
- `maxDropdownHeight = screenHeight * 0.7` (tăng tỉ lệ)
- Scroll bật sớm hơn

### 9.6 Mở nhiều lần nhanh (double tap)

Debounce `onPress` của AvatarButton:

```typescript
const onPressWithDebounce = useMemo(
  () => debounce(toggle, 300, { leading: true, trailing: false }),
  [toggle]
);
```

---

## 10. Testing checklist

### 10.1 Functional

- [ ] Bấm avatar → dropdown xuất hiện với đúng thông tin user
- [ ] Bấm backdrop → dropdown đóng
- [ ] Bấm avatar lần 2 → dropdown đóng
- [ ] Bấm "Chỉnh sửa hồ sơ" → navigate đến EditProfileScreen
- [ ] Bấm "Bộ lọc cá nhân" → navigate đến EditFiltersScreen
- [ ] Bấm "Thông báo" → navigate đến NotificationSettingsScreen
- [ ] Bấm "Cài đặt" → navigate đến SettingsScreen
- [ ] Bấm "Đăng xuất" → hiện confirm dialog
- [ ] Confirm "Đăng xuất" → logout và về LoginScreen
- [ ] Huỷ confirm → dropdown đã đóng, user vẫn đăng nhập
- [ ] Hardware back (Android) khi dropdown mở → dropdown đóng, không back màn hình

### 10.2 Animation

- [ ] Animation mở mượt (180ms, không giật)
- [ ] Animation đóng mượt (140ms)
- [ ] Không có flash trắng khi Modal mount
- [ ] Trên thiết bị Reduce Motion → không có scale animation

### 10.3 Edge cases

- [ ] User không có avatar URL → initials hiển thị đúng
- [ ] Display name dài (> 20 ký tự) → truncate với `...`
- [ ] Email dài → truncate với `...`
- [ ] Level = null → hiển thị "?" và highlight item Chỉnh sửa
- [ ] Màn hình iPhone SE (375×667) → dropdown không bị cắt
- [ ] Màn hình có notch / Dynamic Island → top position tính đúng

### 10.4 Accessibility

- [ ] VoiceOver đọc đúng label của AvatarButton
- [ ] Sau khi mở, focus đi vào dropdown
- [ ] Sau khi đóng, focus trở về AvatarButton
- [ ] Tất cả DropdownItem đều có accessibilityLabel

---

## 11. Lộ trình thực hiện

### Sprint 1 (ưu tiên)

1. **Tạo `AvatarButton` component** — không cần dropdown, chỉ UI tĩnh
2. **Tích hợp vào `TopBar`** — thay thế profile tab icon cũ
3. **Tạo `AvatarDropdown` component** — UI tĩnh, không animation
4. **Kết nối với user data** từ `useAuth()` hook

### Sprint 2

5. **Thêm animation** (open/close với `useAvatarDropdown` hook)
6. **Kết nối navigation** — tất cả `onPress` của từng item
7. **Implement logout flow** với confirm dialog
8. **Xóa ProfileScreen khỏi Bottom Tab**, cập nhật `MainNavigator`

### Sprint 3

9. **Edge cases** — avatar load fail, level null, màn hình nhỏ
10. **Accessibility** — focus management, VoiceOver labels
11. **Testing** — chạy checklist mục 10

---

## 12. Ghi chú & quyết định thiết kế

**Q: Tại sao dùng `Modal` thay vì render trực tiếp vào TopBar?**  
A: TopBar thường có `zIndex` thấp và `overflow: hidden`. Dùng `Modal` đảm bảo dropdown luôn render trên tất cả content, không bị clip bởi bất kỳ parent nào.

**Q: Tại sao không dùng `@gorhom/bottom-sheet`?**  
A: Bottom sheet phù hợp cho content nhiều (filter, form). Dropdown menu nhỏ với 5–6 item thì Modal nhẹ hơn và đúng pattern hơn. Bottom sheet sẽ cảm giác "nặng" với nội dung ít như vậy.

**Q: Backdrop có nên dim nền không?**  
A: Không dim (transparent hoàn toàn). Dropdown nhỏ không cần block toàn bộ context như modal quan trọng. Dim sẽ làm UX nặng hơn không cần thiết.

**Q: Tab thứ 4 sau khi xóa Profile sẽ là gì?**  
A: Quyết định riêng — scope của ticket này chỉ là xóa Profile tab và implement dropdown. Slot trống có thể tạm để ẩn hoặc đặt "Lịch sử" nếu tính năng đó đã sẵn sàng.

---

_Spec này được tạo dựa trên mockup UI-042 · April 2026._  
_Mọi thay đổi cần review với owner trước khi implement._

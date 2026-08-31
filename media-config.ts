// media-config.ts
// File cấu hình DUY NHẤT chứa toàn bộ link media (Cloudinary) cho Zenzy.
// Theo nguyên tắc đã chốt ở CLAUDE.md: không hard-code link rải rác trong code,
// mọi component chỉ import từ file này.
//
// Mọi URL đều có f_auto,q_auto để Cloudinary tự chọn định dạng + mức nén tối ưu
// theo trình duyệt người dùng, giúp tiết kiệm bandwidth gói Free.

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  // Chỉ dùng cho themeBackgrounds — mặc định "image" nếu không set. Theme
  // "video" tự loop/muted/autoplay khi làm nền chính/PiP, nhưng lưới chọn
  // theme (ThemeDialog) luôn hiện posterUrl (ảnh tĩnh) — 10 video autoplay
  // cùng lúc trong lưới sẽ rất nặng máy, xem thảo luận với Joey 31/08/2026.
  type?: "image" | "video";
  // Bắt buộc khi type === "video" — dùng cho thumbnail lưới chọn theme.
  // Cloudinary tự tạo frame JPG từ video chỉ bằng cách đổi đuôi .mp4→.jpg
  // trên cùng URL (giữ nguyên path /video/upload/...), không cần upload
  // ảnh riêng.
  posterUrl?: string;
}

// ============================================
// MUSIC — 4 track nhạc thiền (Dialog Sounds/Music, tab Music)
// ============================================
export const musicTracks: MediaItem[] = [
  {
    id: "pulsebox-lofi-night",
    name: "Lofi Night",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787645190/pulsebox-lofi-night-522890.mp3",
  },
  {
    id: "sub-clair-lofi",
    name: "Clair Lofi",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787645189/sub_clair-lofi-586095.mp3",
  },
  {
    id: "ornave-chill-lamp-light",
    name: "Chill Lamp Light",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787645188/ornave-chill-lamp-light-553405.mp3",
  },
  {
    id: "alex-morgan-lofi-restaurant",
    name: "Lofi Restaurant",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787645187/alex-morgan-lofi-restaurant-568157.mp3",
  },
];

// ============================================
// SOUNDS — 14 âm thanh môi trường (Dialog Sounds/Music, tab Sounds)
// ============================================
export const ambientSounds: MediaItem[] = [
  {
    id: "rain-with-thunderstorm",
    name: "Thunderstorm",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644368/masterandmargarita-rain-with-thunderstorm-420333.mp3",
  },
  {
    id: "gentle-rain",
    name: "Gentle Rain",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644362/dragon-studio-gentle-rain-01-437313.mp3",
  },
  {
    id: "wind-blowing",
    name: "Wind Blowing",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644361/soundreality-wind-blowing-457954.mp3",
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644360/rmultimediaeu-ocean-waves-250310.mp3",
  },
  {
    id: "city-hall-ambience",
    name: "City Hall Ambience",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644360/freesound_community-occupy-toronto-at-new-city-hall-22-oct-2011-17291.mp3",
  },
  {
    id: "fireplace-loop",
    name: "Fireplace Loop",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644359/king_of_the_christmas-fireplace-loop-original-noise-178209.mp3",
  },
  {
    id: "library-ambience",
    name: "Library Ambience",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644359/freesound_community-library-ambiance-60000.mp3",
  },
  {
    id: "calming-rain",
    name: "Calming Rain",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644357/liecio-calming-rain-257596.mp3",
  },
  {
    id: "light-rain",
    name: "Light Rain",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644357/liecio-light-rain-109591.mp3",
  },
  {
    id: "old-train-interior",
    name: "Old Train Interior",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644354/kokoreli777-inside-old-train-169418.mp3",
  },
  {
    id: "morning-birds",
    name: "Morning Birds",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644352/empressnefertitimumbi-nature-birds-ambiance-morning-kisses-214774.mp3",
  },
  {
    id: "street-ambience",
    name: "Street Ambience",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644351/freesound_community-cartegena-street-ambience-23915.mp3",
  },
  {
    id: "cafe-noise",
    name: "Cafe Noise",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644349/freesound_community-cafe-noise-32940.mp3",
  },
  {
    id: "airplane-cabin",
    name: "Airplane Cabin",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787644345/freesound_community-180218-airplane-in-flight-cabin-rumble-tone-voices-loop-bahamas-23090.mp3",
  },
];

// ============================================
// THEMES — 9 ảnh nền chủ đề (Dialog Themes)
// Đã xác nhận với Joey (25/08/2026): giữ nguyên hướng anime/cartoon
// (văn phòng, nội thất nhà, mặt trăng) thay vì thiên nhiên như mô tả gốc
// ở BRD/PRD (rừng, biển, mưa, quán cà phê). Các file _1/_2/_3 là ảnh khác nhau,
// không phải trùng lặp.
// ============================================
export const themeBackgrounds: MediaItem[] = [
  {
    id: "office-space-cartoon",
    name: "Office Space (Cartoon)",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643273/beautiful-office-space-cartoon-style.jpg",
  },
  {
    id: "cozy-home-interior-anime",
    name: "Cozy Home Interior",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643271/cozy-home-interior-anime-style.jpg",
  },
  {
    id: "cozy-home-interior-anime-2",
    name: "Cozy Home Interior (2)",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643269/cozy-home-interior-anime-style_1.jpg",
  },
  {
    id: "cozy-home-furnishings",
    name: "Cozy Home with Furnishings",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643267/anime-style-cozy-home-interior-with-furnishings.jpg",
  },
  {
    id: "untitled-theme",
    name: "Untitled (cần đặt tên lại)",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643263/images.jpg",
  },
  {
    id: "office-space-cartoon-3",
    name: "Office Space (Cartoon) 3",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643262/beautiful-office-space-cartoon-style_3.jpg",
  },
  {
    id: "office-space-cartoon-2",
    name: "Office Space (Cartoon) 2",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643262/beautiful-office-space-cartoon-style_2.jpg",
  },
  {
    id: "office-space-cartoon-1",
    name: "Office Space (Cartoon) 1",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643260/beautiful-office-space-cartoon-style_1.jpg",
  },
  {
    id: "anime-moon-landscape",
    name: "Moon Landscape",
    url: "https://res.cloudinary.com/suha2h16/image/upload/f_auto,q_auto/v1787643259/anime-moon-landscape.jpg",
  },
  // Thử nghiệm theme dạng video (Joey upload 31/08/2026) — xem có đáng đánh
  // đổi so với ảnh tĩnh không (CPU/pin khi chạy nền suốt phiên dài) trước
  // khi quyết định làm thêm cho các theme khác.
  {
    id: "cozy-cabin-rainy-day",
    name: "Cozy Cabin Rainy Day (Video)",
    type: "video",
    posterUrl: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1788163628/Cozy_Cabin_Rainy_Day.jpg",
    url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1788163628/Cozy_Cabin_Rainy_Day.mp4",
  },
];

// ============================================
// KINETIC VISUAL — video màn hình nghỉ mắt (S4)
// Chỉ cần 1 URL gốc nhờ f_auto: Cloudinary tự trả về định dạng phù hợp
// (webm cho trình duyệt hỗ trợ, mp4 cho trình duyệt còn lại) từ CÙNG 1 link,
// nên không cần tự upload/convert 2 file riêng như note ban đầu ở Giai đoạn 6.
// ============================================
export const kineticVisual = {
  url: "https://res.cloudinary.com/suha2h16/video/upload/f_auto,q_auto/v1787647257/246243_1.mp4",
};

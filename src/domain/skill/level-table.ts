import { createLevel, type Level } from "./level.value-object";

export interface LevelDescriptor {
  readonly level: Level;
  readonly name: string;
  readonly techniqueBrief: string;
}

export const LEVELS: readonly LevelDescriptor[] = Object.freeze([
  {
    level: createLevel(1),
    name: "Newbie",
    techniqueBrief: "Cầm vợt sai, đánh hụt nhiều — mới bắt đầu"
  },
  {
    level: createLevel(2),
    name: "Yếu",
    techniqueBrief: "Đánh qua lưới nhưng không ổn định — chơi giải trí đơn giản"
  },
  {
    level: createLevel(3),
    name: "Trung bình yếu",
    techniqueBrief: "Có thể clear, drop cơ bản nhưng lỗi nhiều — bắt đầu có nền tảng"
  },
  {
    level: createLevel(4),
    name: "TB-",
    techniqueBrief: "Kỹ thuật cơ bản dùng được — chơi được rally ngắn"
  },
  {
    level: createLevel(5),
    name: "TB",
    techniqueBrief: "Kỹ thuật ổn định hơn, ít lỗi cơ bản — trình phổ biến"
  },
  {
    level: createLevel(6),
    name: "TB+",
    techniqueBrief: "Smash, drop, clear có kiểm soát — bắt đầu \"có trình\""
  },
  {
    level: createLevel(7),
    name: "TB++",
    techniqueBrief: "Kỹ thuật đa dạng (net shot, drive) — chơi trận nghiêm túc"
  },
  {
    level: createLevel(8),
    name: "TB+++",
    techniqueBrief: "Kỹ thuật ổn định, smash có lực — gần chạm mức khá"
  },
  {
    level: createLevel(9),
    name: "TB Khá",
    techniqueBrief: "Ít lỗi, kiểm soát cầu tốt — cửa trên với đa số TB"
  },
  {
    level: createLevel(10),
    name: "Khá",
    techniqueBrief: "Kỹ thuật đầy đủ, smash uy lực — chơi giải phong trào tốt"
  }
] as const);

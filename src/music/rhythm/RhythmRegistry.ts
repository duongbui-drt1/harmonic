import { TimeSignature, TimeSignatureConfig, MeterCategory } from "./TimeSignature";

/**
 * Initial Preset Configurations for Supported Meters:
 * - Basic: 2/4, 3/4, 4/4, 6/8
 * - Extended: 3/8, 9/8, 12/8, 2/2
 * - Advanced: 5/4, 7/8
 */
export const INITIAL_TIME_SIGNATURES: TimeSignatureConfig[] = [
  // Basic Meters
  {
    numerator: 2,
    denominator: 4,
    name: "2/4",
    category: "basic",
    classification: "simple-duple",
    beatUnit: "quarter",
    defaultGrouping: [1, 1],
    description: "Nhịp 2/4: Nhịp đơn 2 phách (Mạnh - Nhẹ), phổ biến trong nhạc hành khúc, pop nhanh.",
  },
  {
    numerator: 3,
    denominator: 4,
    name: "3/4",
    category: "basic",
    classification: "simple-triple",
    beatUnit: "quarter",
    defaultGrouping: [1, 1, 1],
    description: "Nhịp 3/4: Nhịp ba đơn (Mạnh - Nhẹ - Nhẹ), điệu Valse (Waltz), Minuet và Ballad êm dịu.",
  },
  {
    numerator: 4,
    denominator: 4,
    name: "4/4",
    category: "basic",
    classification: "simple-quadruple",
    beatUnit: "quarter",
    defaultGrouping: [1, 1, 1, 1],
    availableGroupings: [
      [1, 1, 1, 1],
      [2, 2],
    ],
    description: "Nhịp 4/4: Nhịp Common Time (Mạnh - Nhẹ - Vừa - Nhẹ), tiêu chuẩn cho Pop, Rock, Jazz, EDM.",
  },
  {
    numerator: 6,
    denominator: 8,
    name: "6/8",
    category: "basic",
    classification: "compound-duple",
    beatUnit: "dotted-quarter",
    defaultGrouping: [3, 3],
    availableGroupings: [[3, 3]],
    description: "Nhịp 6/8: Nhịp kép 2 phách chính (mỗi phách = 3 nốt móc đơn). Trọng âm: MẠNH (1) - Thứ mạnh (4).",
  },

  // Extended Meters
  {
    numerator: 3,
    denominator: 8,
    name: "3/8",
    category: "extended",
    classification: "simple-triple",
    beatUnit: "eighth",
    defaultGrouping: [1, 1, 1],
    availableGroupings: [[1, 1, 1], [3]],
    description: "Nhịp 3/8: 3 phách móc đơn nhanh (Mạnh - Nhẹ - Nhẹ), điệu Scherzo, dân vũ.",
  },
  {
    numerator: 9,
    denominator: 8,
    name: "9/8",
    category: "extended",
    classification: "compound-triple",
    beatUnit: "dotted-quarter",
    defaultGrouping: [3, 3, 3],
    availableGroupings: [[3, 3, 3]],
    description: "Nhịp 9/8: Nhịp kép 3 phách chính (3+3+3). Điệu Celtic Slip Jig, Ballad chậm.",
  },
  {
    numerator: 12,
    denominator: 8,
    name: "12/8",
    category: "extended",
    classification: "compound-quadruple",
    beatUnit: "dotted-quarter",
    defaultGrouping: [3, 3, 3, 3],
    availableGroupings: [[3, 3, 3, 3]],
    description: "Nhịp 12/8: Nhịp kép 4 phách chính (3+3+3+3). Đặc trưng Blues shuffle, Doo-wop, Gospel.",
  },
  {
    numerator: 2,
    denominator: 2,
    name: "2/2",
    category: "extended",
    classification: "cut-time",
    beatUnit: "half",
    defaultGrouping: [1, 1],
    availableGroupings: [[1, 1]],
    description: "Nhịp 2/2 (Alla Breve / Cut Time): 2 phách nốt trắng mỗi ô nhịp. Tốc độ nhanh (Samba, Bossa, Cổ điển).",
  },

  // Advanced / Irregular Meters
  {
    numerator: 5,
    denominator: 4,
    name: "5/4",
    category: "advanced",
    classification: "complex-odd",
    beatUnit: "quarter",
    defaultGrouping: [3, 2],
    availableGroupings: [
      [3, 2],
      [2, 3],
      [1, 1, 1, 1, 1],
    ],
    description: "Nhịp 5/4: Nhịp phức hợp 5 phách đen. Cấu trúc phổ biến: 3+2 (Take Five) hoặc 2+3 (Mission Impossible).",
  },
  {
    numerator: 7,
    denominator: 8,
    name: "7/8",
    category: "advanced",
    classification: "complex-odd",
    beatUnit: "eighth",
    defaultGrouping: [2, 2, 3],
    availableGroupings: [
      [2, 2, 3],
      [2, 3, 2],
      [3, 2, 2],
    ],
    description: "Nhịp 7/8: Nhịp lẻ Balkan/Prog-rock. Hỗ trợ 3 cách phân nhóm: 2+2+3, 2+3+2, hoặc 3+2+2.",
  },
];

class RhythmRegistryClass {
  private registry: Map<string, TimeSignatureConfig> = new Map();

  constructor() {
    INITIAL_TIME_SIGNATURES.forEach((cfg) => {
      this.registry.set(cfg.name || `${cfg.numerator}/${cfg.denominator}`, cfg);
    });
  }

  /**
   * Register a new Time Signature configuration into the registry.
   * This enables adding any future meter dynamically without modifying core engine logic!
   */
  registerTimeSignature(config: TimeSignatureConfig): TimeSignature {
    const key = config.name || `${config.numerator}/${config.denominator}`;
    this.registry.set(key, config);
    return new TimeSignature(config);
  }

  /**
   * Retrieve a TimeSignature instance by name (e.g. "6/8", "7/8", "4/4")
   * with optional custom grouping.
   */
  getTimeSignature(name: string, customGrouping?: number[]): TimeSignature {
    const cleanName = name.split(" ")[0].trim();
    const config = this.registry.get(cleanName);

    if (config) {
      return new TimeSignature(config, customGrouping);
    }

    // Fallback: parse dynamic numerator/denominator if format is "X/Y"
    const match = cleanName.match(/^(\d+)\/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const den = parseInt(match[2], 10);
      const dynamicConfig: TimeSignatureConfig = {
        numerator: num,
        denominator: den,
        name: cleanName,
        category: "custom",
        beatUnit: den === 8 && num % 3 === 0 ? "dotted-quarter" : den === 2 ? "half" : "quarter",
        defaultGrouping: customGrouping || (den === 8 && num % 3 === 0 ? Array(num / 3).fill(3) : Array(num).fill(1)),
      };
      return new TimeSignature(dynamicConfig, customGrouping);
    }

    // Default fallback to 4/4
    const default44 = this.registry.get("4/4")!;
    return new TimeSignature(default44);
  }

  /**
   * Get list of all registered time signature models
   */
  getAllTimeSignatures(): TimeSignature[] {
    return Array.from(this.registry.values()).map((cfg) => new TimeSignature(cfg));
  }

  /**
   * Get time signatures filtered by category (basic, extended, advanced)
   */
  getByCategory(category: MeterCategory): TimeSignature[] {
    return Array.from(this.registry.values())
      .filter((cfg) => cfg.category === category)
      .map((cfg) => new TimeSignature(cfg));
  }

  /**
   * Parse a meter string like "7/8 (2+3+2)" or "6/8" into a TimeSignature instance
   */
  parse(input: string): TimeSignature {
    if (!input) return this.getTimeSignature("4/4");

    const groupingMatch = input.match(/\(([0-9+]+)\)/);
    let customGrouping: number[] | undefined;

    if (groupingMatch) {
      customGrouping = groupingMatch[1].split("+").map(Number);
    }

    const nameOnly = input.replace(/\(.*\)/, "").trim();
    return this.getTimeSignature(nameOnly, customGrouping);
  }
}

export const RhythmRegistry = new RhythmRegistryClass();

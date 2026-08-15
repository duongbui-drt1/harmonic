import { LessonData } from "../types/learning";

export const LESSONS: LessonData[] = [
  {
    id: "lesson-1",
    number: 1,
    title: "Nốt nhạc là gì?",
    subtitle: "Cao độ, Quãng tám & Bảng chữ cái âm nhạc",
    level: "Level 1 — Musical Foundations",
    category: "notes",
    estimatedMinutes: 3,
    conceptTags: ["Nốt nhạc", "Cao độ", "Quãng tám", "Bàn phím"],
    summary:
      "Nốt nhạc là một âm thanh có cao độ xác định. Trong âm nhạc phương Tây, các nốt được đặt tên theo 7 chữ cái: A, B, C, D, E, F, G (tương ứng La, Si, Đô, Rê, Mi, Fa, Sol), lặp lại qua các quãng tám từ trầm đến bổng.",

    listenExamples: [
      {
        id: "ex-c4",
        label: "Đô chuẩn (C4 / Middle C)",
        description: "Nốt mốc chuẩn mực ở vị trí trung tâm bàn phím đàn piano.",
        notes: [{ name: "C4", midi: 60, label: "C4 (Đô trung tâm)" }],
        type: "single_note",
      },
      {
        id: "ex-c3",
        label: "Đô trầm (C3)",
        description: "Thấp hơn một quãng tám — dày, trầm ấm, rung chậm hơn.",
        notes: [{ name: "C3", midi: 48, label: "C3 (Đô trầm)" }],
        type: "single_note",
      },
      {
        id: "ex-c5",
        label: "Đô bổng (C5)",
        description: "Cao hơn một quãng tám — thanh mảnh, tươi sáng, rung nhanh hơn.",
        notes: [{ name: "C5", midi: 72, label: "C5 (Đô cao)" }],
        type: "single_note",
      },
    ],
    listenGuidance:
      "Bấm từng nút âm thanh bên trên. Chú ý rằng C3, C4 và C5 đều mang chung một 'màu sắc' (cùng là nốt C), nhưng khác nhau về độ cao (quãng tám).",

    visualizeTitle: "Vị trí nốt trên Bàn phím Piano",
    visualizeCaption:
      "Phím trắng là các nốt tự nhiên (C-D-E-F-G-A-B). Phím đen là các nốt thăng (#) và giáng (b).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "C (Gốc)", color: "#8b5cf6" },
      { name: "D4", midi: 62, label: "D (Rê)", color: "#6366f1" },
      { name: "E4", midi: 64, label: "E (Mi)", color: "#3b82f6" },
      { name: "F4", midi: 65, label: "F (Fa)", color: "#10b981" },
      { name: "G4", midi: 67, label: "G (Sol)", color: "#f59e0b" },
      { name: "A4", midi: 69, label: "A (La)", color: "#ec4899" },
      { name: "B4", midi: 71, label: "B (Si)", color: "#a855f7" },
    ],
    highlightedMidis: [60, 62, 64, 65, 67, 69, 71],
    keyboardRange: { minMidi: 48, maxMidi: 72 },

    beginnerExplanation:
      "Hãy hình dung nốt nhạc như bảng chữ cái của ngôn ngữ âm nhạc. Khi bạn gõ một phím đàn, dây đàn dao động ở một tần số nhất định. Rung càng nhanh thì âm thanh nghe càng cao (bổng); rung càng chậm thì âm thanh nghe càng thấp (trầm).",
    bulletPoints: [
      "Chỉ có 12 cao độ âm nhạc riêng biệt trước khi chu kỳ lặp lại ở quãng tám kế tiếp.",
      "7 nốt cơ bản tự nhiên dùng chữ cái: A, B, C, D, E, F, G.",
      "Quãng tám (Octave) là khoảng cách giữa một nốt (như C4) và nốt cùng tên tiếp theo (như C5).",
    ],
    whyItWorks:
      "Khi hai nốt cách nhau đúng một quãng tám, nốt cao rung với tần số gấp đúng 2 LẦN nốt thấp (tỷ lệ 2:1 hoàn hảo). Do tỷ lệ toán học tự nhiên này, não bộ con người cảm nhận chúng là cùng một nốt nhưng ở hai tầng cao độ khác nhau!",
    theoryDetails:
      "Nốt A4 chuẩn quốc tế có tần số 440 Hz. Nốt A3 dưới nó có tần số 220 Hz, và A5 trên nó có tần số 880 Hz. Quãng tám trải dài đúng 12 nửa cung (semitones).",

    experimentTitle: "Chạm phím cảm nhận cao độ",
    experimentPrompt:
      "Bấm vào bất kỳ phím nào trên đàn để nghe âm thanh. So sánh các nốt trầm bên trái với các nốt bổng bên phải.",
    experimentType: "interactive_piano",

    comparison: {
      id: "comp-note-octave",
      title: "Âm Trầm vs Âm Bổng (Bước nhảy Quãng tám)",
      description: "Lắng nghe cách tần số tăng gấp đôi làm đổi độ cao nhưng giữ nguyên tính chất nốt.",
      optionA: {
        label: "C3 (Đô trầm - 130.8 Hz)",
        sublabel: "Âm trầm dày, ấm áp",
        example: {
          id: "cmp-a",
          label: "C3",
          notes: [{ name: "C3", midi: 48 }],
          type: "single_note",
        },
        highlightMidis: [48],
      },
      optionB: {
        label: "C5 (Đô cao - 523.2 Hz)",
        sublabel: "Âm bổng trong trẻo, tươi sáng",
        example: {
          id: "cmp-b",
          label: "C5",
          notes: [{ name: "C5", midi: 72 }],
          type: "single_note",
        },
        highlightMidis: [72],
      },
      whyDifferenceMatters:
        "Cả hai đều là nốt C, nhưng khoảng cao độ tạo nên cảm xúc hoàn toàn khác biệt: nốt trầm tạo độ sâu và nền móng, nốt bổng tạo giai điệu và sự bay bổng.",
    },

    challenge: {
      id: "ch-1",
      question: "Mối quan hệ giữa nốt C3 và C4 được mô tả chính xác nhất là gì?",
      audioPrompt: {
        id: "ch1-audio",
        label: "Nghe C3 rồi đến C4",
        notes: [
          { name: "C3", midi: 48 },
          { name: "C4", midi: 60 },
        ],
        type: "interval",
      },
      options: [
        {
          label: "Là hai nốt hoàn toàn khác biệt, không liên quan đến nhau",
          isCorrect: false,
          explanation: "Cả hai đều là nốt C — chúng có cùng bản sắc âm nhạc.",
        },
        {
          label: "Cùng là nốt C, cách nhau đúng một Quãng tám (C4 cao hơn C3)",
          isCorrect: true,
          explanation: "Chính xác! C4 cao hơn C3 đúng một quãng tám (12 nửa cung).",
        },
        {
          label: "Nốt C3 cao hơn nốt C4",
          isCorrect: false,
          explanation: "Số thứ tự càng nhỏ biểu thị quãng tám càng trầm (C3 thấp hơn C4).",
        },
      ],
      hint: "Hãy lắng nghe âm sắc tương đồng, nhưng C4 nằm ở tầng cao hơn.",
    },
  },

  {
    id: "lesson-2",
    number: 2,
    title: "Quãng là gì?",
    subtitle: "Khoảng cách cao độ giữa hai nốt nhạc",
    level: "Level 1 — Musical Foundations",
    category: "intervals",
    estimatedMinutes: 4,
    conceptTags: ["Quãng", "Nửa cung", "Nguyên cung", "Quãng ba", "Quãng năm"],
    summary:
      "Quãng là khoảng cách về độ cao giữa hai nốt nhạc. Mọi giai điệu và hợp âm trong âm nhạc đều được tạo nên từ việc kết hợp các quãng lại với nhau.",

    listenExamples: [
      {
        id: "ex-p5",
        label: "Quãng năm đúng (C4 đến G4)",
        description: "Âm thanh khoáng đạt, vững chãi, nền tảng của Power Chord (7 nửa cung).",
        notes: [
          { name: "C4", midi: 60, label: "Nốt gốc (C)" },
          { name: "G4", midi: 67, label: "Quãng 5 (G)" },
        ],
        type: "interval",
      },
      {
        id: "ex-m3",
        label: "Quãng ba trưởng (C4 đến E4)",
        description: "Âm thanh tươi sáng, ngọt ngào, ấm áp (4 nửa cung).",
        notes: [
          { name: "C4", midi: 60, label: "Nốt gốc (C)" },
          { name: "E4", midi: 64, label: "Quãng 3 Trưởng (E)" },
        ],
        type: "interval",
      },
      {
        id: "ex-min2",
        label: "Quãng hai thứ (C4 đến Db4)",
        description: "Âm thanh cọ xát, hồi hộp, căng thẳng nghẹt thở (1 nửa cung).",
        notes: [
          { name: "C4", midi: 60, label: "Nốt gốc (C)" },
          { name: "Db4", midi: 61, label: "Quãng 2 Thứ (Db)" },
        ],
        type: "interval",
      },
    ],
    listenGuidance:
      "Lắng nghe từng quãng. Các nốt có thể phát lần lượt (giai điệu) hoặc cùng lúc (hòa âm). Chú ý cảm giác khác biệt rõ rệt mà từng quãng mang lại.",

    visualizeTitle: "Quan sát khoảng cách quãng trên phím đàn",
    visualizeCaption:
      "Khoảng cách được tính bằng nửa cung (semitone) — mỗi phím đàn liền kề là 1 nửa cung.",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "Gốc (0)", color: "#8b5cf6" },
      { name: "Db4", midi: 61, label: "2 Thứ (1)", color: "#ef4444" },
      { name: "D4", midi: 62, label: "2 Trưởng (2)", color: "#f97316" },
      { name: "Eb4", midi: 63, label: "3 Thứ (3)", color: "#06b6d4" },
      { name: "E4", midi: 64, label: "3 Trưởng (4)", color: "#10b981" },
      { name: "F4", midi: 65, label: "4 Đúng (5)", color: "#3b82f6" },
      { name: "G4", midi: 67, label: "5 Đúng (7)", color: "#8b5cf6" },
      { name: "C5", midi: 72, label: "Quãng 8 (12)", color: "#a855f7" },
    ],
    highlightedMidis: [60, 61, 62, 63, 64, 65, 67, 72],

    beginnerExplanation:
      "Bạn chưa cần ghi nhớ hết thuật ngữ phức tạp ngay lập tức. Hãy tập cảm nhận bằng tai: Một số quãng nghe rất êm và rộng mở (như Quãng năm), một số nghe ngọt ngào (như Quãng ba trưởng), và một số nghe gắt, cọ xát vào nhau (như Quãng hai thứ).",
    bulletPoints: [
      "Nửa cung (Semitone) = Khoảng cách 1 phím đàn liền kề (ngắn nhất).",
      "Nguyên cung (Whole tone) = 2 nửa cung (cách nhau 2 phím đàn).",
      "Quãng ba quyết định cảm xúc Trưởng (vui) hay Thứ (buồn).",
      "Quãng năm là trụ cột nâng đỡ cấu trúc của mọi hợp âm cơ bản.",
    ],
    whyItWorks:
      "Các tần số âm thanh có tỷ lệ toán học đơn giản (như 3:2 ở quãng năm) tạo ra sự hòa quyện êm ái (Thuận - Consonance). Những tần số va chạm lệch pha (như 16:15 ở quãng hai thứ) tạo nên sự cọ xát căng thẳng (Nghịch - Dissonance).",
    theoryDetails:
      "Quãng ba trưởng = 4 nửa cung (Major 3rd). Quãng ba thứ = 3 nửa cung (Minor 3rd). Quãng năm đúng = 7 nửa cung (Perfect 5th). Quãng tám = 12 nửa cung.",

    experimentTitle: "Phòng thí nghiệm ghép Quãng",
    experimentPrompt:
      "Chọn nốt gốc và thử đổi các khoảng cách quãng khác nhau để nghe sự thay đổi cảm xúc từ êm dịu sang căng thẳng.",
    experimentType: "interval_builder",

    comparison: {
      id: "comp-3rd-types",
      title: "Quãng ba Trưởng (4 nửa cung) vs Quãng ba Thứ (3 nửa cung)",
      description: "Chỉ chênh nhau 1 nửa cung nhưng làm thay đổi toàn bộ tính chất cảm xúc.",
      optionA: {
        label: "C đến E (Quãng 3 Trưởng)",
        sublabel: "4 nửa cung — Tươi sáng, hân hoan",
        example: {
          id: "cmp-maj3",
          label: "C4 - E4",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
          ],
          type: "interval",
        },
        highlightMidis: [60, 64],
      },
      optionB: {
        label: "C đến Eb (Quãng 3 Thứ)",
        sublabel: "3 nửa cung — Trầm buồn, tự sự",
        example: {
          id: "cmp-min3",
          label: "C4 - Eb4",
          notes: [
            { name: "C4", midi: 60 },
            { name: "Eb4", midi: 63 },
          ],
          type: "interval",
        },
        highlightMidis: [60, 63],
      },
      whyDifferenceMatters:
        "Sự khác biệt chỉ 1 nửa cung giữa E và Eb chính là chìa khóa bí mật phân biệt giữa âm hưởng Trưởng (vui vẻ) và Thứ (u buồn) trong toàn bộ nền âm nhạc thế giới.",
    },

    challenge: {
      id: "ch-2",
      question: "Quãng nào sau đây tạo cảm giác tươi sáng và ấm áp nhất?",
      audioPrompt: {
        id: "ch2-audio",
        label: "Nghe Quãng ba trưởng (C4 - E4)",
        notes: [
          { name: "C4", midi: 60 },
          { name: "E4", midi: 64 },
        ],
        type: "interval",
      },
      options: [
        {
          label: "Quãng hai thứ (1 nửa cung - C đến Db)",
          isCorrect: false,
          explanation: "Quãng hai thứ nghe rất gắt và hồi hộp, không mang sắc thái tươi sáng.",
        },
        {
          label: "Quãng ba trưởng (4 nửa cung - C đến E)",
          isCorrect: true,
          explanation: "Chính xác! Quãng ba trưởng là linh hồn tạo nên sự tươi sáng của hợp âm Trưởng.",
        },
        {
          label: "Quãng giảm (Tritone - 6 nửa cung)",
          isCorrect: false,
          explanation: "Quãng 6 nửa cung mang tính bất ổn định và căng thẳng cao.",
        },
      ],
      hint: "Hãy nhớ lại quãng ngọt ngào tạo nên hợp âm Trưởng.",
    },
  },

  {
    id: "lesson-3",
    number: 3,
    title: "Hợp âm Trưởng và Hợp âm Thứ",
    subtitle: "Nốt bậc 3 định hình cảm xúc âm nhạc",
    level: "Level 1 — Musical Foundations",
    category: "chords",
    estimatedMinutes: 4,
    conceptTags: ["Trưởng", "Thứ", "Cảm xúc", "Quãng ba", "Cmaj", "Cmin"],
    summary:
      "Hợp âm Trưởng (Major) và Hợp âm Thứ (Minor) là hai trụ cột cảm xúc nền tảng của âm nhạc. Toàn bộ sự khác biệt kỳ diệu này bắt nguồn từ đúng MỘT nốt nhạc duy nhất: nốt quãng ba.",

    listenExamples: [
      {
        id: "ex-cmaj",
        label: "Hợp âm C Trưởng (C - E - G)",
        description: "Tươi sáng, hân hoan, tràn đầy năng lượng và hy vọng.",
        notes: [
          { name: "C4", midi: 60, label: "Gốc (C)" },
          { name: "E4", midi: 64, label: "3 Trưởng (E)" },
          { name: "G4", midi: 67, label: "5 Đúng (G)" },
        ],
        chordName: "C",
        type: "chord",
      },
      {
        id: "ex-cmin",
        label: "Hợp âm C Thứ (C - Eb - G)",
        description: "Trầm lắng, u buồn, sâu sắc, giàu tự sự.",
        notes: [
          { name: "C4", midi: 60, label: "Gốc (C)" },
          { name: "Eb4", midi: 63, label: "3 Thứ (Eb)" },
          { name: "G4", midi: 67, label: "5 Đúng (G)" },
        ],
        chordName: "Cm",
        type: "chord",
      },
    ],
    listenGuidance:
      "Bấm nút nghe C Trưởng rồi chuyển sang C Thứ. Cả hai đều có nốt C và nốt G. Chỉ duy nhất nốt giữa đổi từ E sang Eb, nhưng cảm xúc biến chuyển hoàn toàn.",

    visualizeTitle: "So sánh trực quan trên phím đàn: C Trưởng vs C Thứ",
    visualizeCaption:
      "Chú ý nốt ở giữa: Phím trắng E (Trưởng) dịch sang trái một nửa cung thành phím đen Eb (Thứ).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "Gốc (C)", color: "#8b5cf6" },
      { name: "Eb4", midi: 63, label: "3 Thứ (Eb - Nốt nốt đen)", color: "#06b6d4" },
      { name: "E4", midi: 64, label: "3 Trưởng (E)", color: "#10b981" },
      { name: "G4", midi: 67, label: "5 Đúng (G)", color: "#f59e0b" },
    ],
    highlightedMidis: [60, 63, 64, 67],

    beginnerExplanation:
      "Trong âm nhạc, nốt bậc 3 được coi là 'trái tim cảm xúc' của hợp âm. Nốt gốc (C) và nốt quãng năm (G) đóng vai trò khung nhà vững chắc, còn nốt bậc 3 quyết định căn nhà đó tràn ngập ánh nắng (Trưởng) hay chìm trong mưa rơi (Thứ).",
    bulletPoints: [
      "Hợp âm Trưởng = Nốt gốc + Quãng ba trưởng (4 nửa cung) + Quãng năm đúng (7 nửa cung).",
      "Hợp âm Thứ = Nốt gốc + Quãng ba thứ (3 nửa cung) + Quãng năm đúng (7 nửa cung).",
      "Chỉ cần hạ thấp nốt bậc 3 xuống 1 nửa cung, bạn lập tức biến hợp âm Trưởng thành hợp âm Thứ!",
    ],
    whyItWorks:
      "Tần số kết hợp giữa C-E-G tạo sự cộng hưởng mở rộng kích thích vùng não cảm nhận niềm vui. Khi hạ E xuống Eb (C-Eb-G), sự co thắt quãng ba tạo nên cảm giác lắng đọng, nội tâm.",
    theoryDetails:
      "Hợp âm Trưởng: 1 - 3 - 5 (Khoảng cách quãng: 4 nửa cung + 3 nửa cung). Hợp âm Thứ: 1 - b3 - 5 (Khoảng cách quãng: 3 nửa cung + 4 nửa cung).",

    experimentTitle: "Bật/Tắt Trưởng & Thứ",
    experimentPrompt:
      "Chọn các nốt gốc khác nhau (C, D, G, A) rồi chuyển đổi giữa Trưởng và Thứ để tai bạn ghi nhớ sâu sắc âm sắc của chúng.",
    experimentType: "major_minor_toggle",

    comparison: {
      id: "comp-maj-min",
      title: "Hợp âm Trưởng (Ánh Dương) vs Hợp âm Thứ (Ánh Trăng)",
      description: "So sánh trực diện cảm giác tươi sáng và u buồn.",
      optionA: {
        label: "C Trưởng (C - E - G)",
        sublabel: "Tươi vui, tràn đầy năng lượng",
        example: {
          id: "cmp-cmaj",
          label: "C Trưởng",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      optionB: {
        label: "C Thứ (C - Eb - G)",
        sublabel: "Trầm lặng, da diết",
        example: {
          id: "cmp-cmin",
          label: "C Thứ",
          notes: [
            { name: "C4", midi: 60 },
            { name: "Eb4", midi: 63 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 63, 67],
      },
      whyDifferenceMatters:
        "Nhận biết Trưởng và Thứ bằng thính giác là kỹ năng quan trọng số một của mọi nhạc sĩ, nhà sản xuất và người yêu âm nhạc.",
    },

    challenge: {
      id: "ch-3",
      question: "Âm thanh vừa phát là Hợp âm Trưởng (Major) hay Hợp âm Thứ (Minor)?",
      audioPrompt: {
        id: "ch3-audio",
        label: "Nghe hợp âm bí ẩn",
        notes: [
          { name: "A3", midi: 57 },
          { name: "C4", midi: 60 },
          { name: "E4", midi: 64 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "Hợp âm Trưởng (Tươi sáng, phấn khởi)",
          isCorrect: false,
          explanation: "Hợp âm này mang màu sắc trầm lắng, tự sự chứ không rực rỡ.",
        },
        {
          label: "Hợp âm Thứ (Trầm tư, sâu lắng — Am)",
          isCorrect: true,
          explanation: "Chính xác! Đó là hợp âm A thứ (Am: A - C - E) với âm sắc da diết đặc trưng.",
        },
      ],
      hint: "Hãy tự hỏi: Âm thanh này làm bạn cảm thấy vui vẻ hay lắng đọng?",
    },
  },

  {
    id: "lesson-4",
    number: 4,
    title: "Cấu trúc Hợp âm ba (Triad)",
    subtitle: "Khối hòa âm cơ bản gồm 3 nốt nhạc",
    level: "Level 1 — Musical Foundations",
    category: "chords",
    estimatedMinutes: 4,
    conceptTags: ["Hợp âm ba", "Nốt gốc", "Quãng ba", "Quãng năm", "Cấu trúc"],
    summary:
      "Hợp âm ba (Triad) là hợp âm được xây dựng bằng cách xếp chồng hai quãng ba lên nốt gốc: Nốt gốc (Root) + Quãng ba (3rd) + Quãng năm (5th).",

    listenExamples: [
      {
        id: "ex-triad-block",
        label: "Hợp âm khối (C vang cùng lúc)",
        description: "Cả ba nốt vang lên hòa quyện đồng thời.",
        notes: [
          { name: "C4", midi: 60, label: "Root (C)" },
          { name: "E4", midi: 64, label: "3rd (E)" },
          { name: "G4", midi: 67, label: "5th (G)" },
        ],
        type: "chord",
      },
      {
        id: "ex-triad-arp",
        label: "Rải hợp âm (Arpeggio: C → E → G)",
        description: "Tách từng nốt lần lượt để nghe rõ cấu trúc bên trong.",
        notes: [
          { name: "C4", midi: 60, label: "Root (C)" },
          { name: "E4", midi: 64, label: "3rd (E)" },
          { name: "G4", midi: 67, label: "5th (G)" },
        ],
        type: "arpeggio",
      },
    ],
    listenGuidance:
      "Nghe hợp âm khối rồi nghe dạng rải nốt. Dù cách thể hiện khác nhau, chúng đều chứa cùng 3 nốt C - E - G.",

    visualizeTitle: "Công thức xếp nốt: Cách 1 nốt chọn 1 nốt",
    visualizeCaption:
      "Trên gam âm nhạc: Chọn C, bỏ qua D, chọn E, bỏ qua F, chọn G (Quy tắc xếp quãng ba).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "1 (Gốc)", color: "#8b5cf6" },
      { name: "D4", midi: 62, label: "[Bỏ qua]", color: "#475569" },
      { name: "E4", midi: 64, label: "3 (Bậc 3)", color: "#10b981" },
      { name: "F4", midi: 65, label: "[Bỏ qua]", color: "#475569" },
      { name: "G4", midi: 67, label: "5 (Bậc 5)", color: "#f59e0b" },
    ],
    highlightedMidis: [60, 64, 67],

    beginnerExplanation:
      "Để tạo một hợp âm ba từ bàn phím, một mẹo cực kỳ dễ nhớ là: Đặt ngón tay vào nốt đầu tiên (C), cách một phím trắng chọn nốt tiếp theo (E), cách thêm một phím trắng nữa chọn nốt thứ ba (G). Thế là bạn đã có một hợp âm hoàn chỉnh!",
    bulletPoints: [
      "1 (Root): Xác định tên của hợp âm (Ví dụ: C).",
      "3 (Third): Quyết định tính chất Trưởng hay Thứ.",
      "5 (Fifth): Hoàn thiện độ dày và sự ổn định của hợp âm.",
      "4 loại hợp âm ba chính: Trưởng (Major), Thứ (Minor), Giảm (Diminished), Tăng (Augmented).",
    ],
    whyItWorks:
      "Xếp chồng các quãng ba là nền tảng của hệ thống hòa âm Tertian truyền thống phương Tây suốt hàng trăm năm qua.",
    theoryDetails:
      "Hợp âm Giảm (Diminished): Gốc + 3 thứ + 5 giảm (1 - b3 - b5). Hợp âm Tăng (Augmented): Gốc + 3 trưởng + 5 tăng (1 - 3 - #5).",

    experimentTitle: "Tự xây Hợp âm ba",
    experimentPrompt:
      "Thử bật/tắt từng nốt (Gốc, Quãng ba, Quãng năm) để cảm nhận vai trò cấu thành của mỗi nốt trong hợp âm.",
    experimentType: "chord_builder",

    comparison: {
      id: "comp-block-arp",
      title: "Hợp âm khối (Block) vs Rải nốt (Arpeggio)",
      description: "Hai phương thức diễn tấu kinh điển của cùng một hợp âm.",
      optionA: {
        label: "Hợp âm khối (Đồng thanh)",
        sublabel: "Mạnh mẽ, làm nền đệm vững chắc",
        example: {
          id: "cmp-blk",
          label: "Block Chord",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      optionB: {
        label: "Rải hợp âm (Lần lượt từng nốt)",
        sublabel: "Mềm mại, trữ tình, tạo giai điệu du dương",
        example: {
          id: "cmp-arp",
          label: "Arpeggio",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "arpeggio",
        },
        highlightMidis: [60, 64, 67],
      },
      whyDifferenceMatters:
        "Biết cách chuyển giữa đánh khối và rải nốt giúp bản hòa âm của bạn trở nên sống động, không bị đơn điệu.",
    },

    challenge: {
      id: "ch-4",
      question: "Hợp âm C trưởng tiêu chuẩn gồm 3 nốt nào?",
      audioPrompt: {
        id: "ch4-audio",
        label: "Nghe C trưởng",
        notes: [
          { name: "C4", midi: 60 },
          { name: "E4", midi: 64 },
          { name: "G4", midi: 67 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "C - D - E",
          isCorrect: false,
          explanation: "Đây là 3 nốt liền kề nhau, không phải quy tắc xếp quãng ba.",
        },
        {
          label: "C - E - G (Nốt gốc, Quãng 3, Quãng 5)",
          isCorrect: true,
          explanation: "Tuyệt vời! C (Gốc) + E (Quãng 3) + G (Quãng 5) tạo thành C Trưởng chuẩn mực.",
        },
        {
          label: "C - F - B",
          isCorrect: false,
          explanation: "Các nốt này không tạo nên hợp âm C trưởng.",
        },
      ],
      hint: "Áp dụng quy tắc: Chọn 1 nốt, cách 1 nốt, chọn tiếp 1 nốt.",
    },
  },

  {
    id: "lesson-5",
    number: 5,
    title: "Hợp âm bảy (7th Chords) & Sắc màu nâng cao",
    subtitle: "maj7, m7 & 7 — Thêm nốt thứ 4 để tạo chiều sâu",
    level: "Level 2 — Harmony in Motion",
    category: "chords",
    estimatedMinutes: 5,
    conceptTags: ["Hợp âm 7", "maj7", "m7", "Át âm 7", "Jazz", "Lo-Fi"],
    summary:
      "Bằng cách xếp thêm một nốt thứ tư (nốt quãng bảy) lên trên hợp âm ba, bạn mở ra một chân trời âm sắc sang trọng, êm ái, đậm chất Jazz, Lo-Fi, R&B và Neo-Soul.",

    listenExamples: [
      {
        id: "ex-cmaj7",
        label: "Cmaj7 (C - E - G - B)",
        description: "Mộng mơ, sang trọng, hoài niệm, thư thái đặc trưng của Jazz và Lo-Fi.",
        notes: [
          { name: "C4", midi: 60, label: "Root" },
          { name: "E4", midi: 64, label: "3rd" },
          { name: "G4", midi: 67, label: "5th" },
          { name: "B4", midi: 71, label: "7 Trưởng (B)" },
        ],
        type: "chord",
      },
      {
        id: "ex-g7",
        label: "G7 (G - B - D - F)",
        description: "Hợp âm bảy át (Dominant 7) — Căng thẳng cuốn hút, thôi thúc muốn về C.",
        notes: [
          { name: "G3", midi: 55, label: "Root" },
          { name: "B3", midi: 59, label: "3rd" },
          { name: "D4", midi: 62, label: "5th" },
          { name: "F4", midi: 65, label: "7 Thứ (F)" },
        ],
        type: "chord",
      },
      {
        id: "ex-am7",
        label: "Am7 (A - C - E - G)",
        description: "Mượt mà, êm dịu, ấm áp, sâu lắng.",
        notes: [
          { name: "A3", midi: 57, label: "Root" },
          { name: "C4", midi: 60, label: "3rd" },
          { name: "E4", midi: 64, label: "5th" },
          { name: "G4", midi: 67, label: "7 Thứ (G)" },
        ],
        type: "chord",
      },
    ],
    listenGuidance:
      "So sánh C (hợp âm 3 nốt giản dị) với Cmaj7 (thêm nốt B). Nốt thứ tư tạo ra độ lấp lánh và không gian âm nhạc đa chiều hơn rất nhiều.",

    visualizeTitle: "Cấu tạo 4 nốt của Hợp âm Bảy",
    visualizeCaption:
      "Nốt thứ 4 nằm cách nốt gốc đúng một quãng bảy (1 - 3 - 5 - 7).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "1 (Gốc)", color: "#8b5cf6" },
      { name: "E4", midi: 64, label: "3 (Bậc 3)", color: "#10b981" },
      { name: "G4", midi: 67, label: "5 (Bậc 5)", color: "#f59e0b" },
      { name: "B4", midi: 71, label: "7 (Bậc 7 Trưởng)", color: "#ec4899" },
    ],
    highlightedMidis: [60, 64, 67, 71],

    beginnerExplanation:
      "Nếu hợp âm 3 nốt giống như bức tranh vẽ màu cơ bản, thì hợp âm 7 giống như được phủ thêm một lớp bóng mờ nghệ thuật. Nốt thứ 7 thêm vào một chút ma mị, giúp bài hát nghe 'tây' và tinh tế hơn hẳn.",
    bulletPoints: [
      "maj7 (Major 7th): Hợp âm Trưởng + Quãng 7 Trưởng (1 - 3 - 5 - 7). Âm sắc mộng mơ, thư giãn.",
      "m7 (Minor 7th): Hợp âm Thứ + Quãng 7 Thứ (1 - b3 - 5 - b7). Âm sắc mượt mà, sâu lắng.",
      "7 (Dominant 7th): Hợp âm Trưởng + Quãng 7 Thứ (1 - 3 - 5 - b7). Mang lực hút mạnh mẽ muốn giải quyết về chủ âm.",
    ],
    whyItWorks:
      "Trong hợp âm Cmaj7, nốt B chỉ cách nốt C một nửa cung ở quãng trên, tạo nên một sự rung động cộng hưởng êm ái cực kỳ quyến rũ.",
    theoryDetails:
      "Khoảng cách quãng 7 Trưởng = 11 nửa cung. Quãng 7 Thứ = 10 nửa cung. Quãng 7 Giảm (dim7) = 9 nửa cung.",

    experimentTitle: "Khám phá sắc màu Hợp âm 7",
    experimentPrompt:
      "Chuyển đổi giữa C, Cmaj7, C7 và Cm7 để cảm nhận sự biến đổi màu sắc hòa âm phong phú.",
    experimentType: "chord_builder",

    comparison: {
      id: "comp-triad-vs-7th",
      title: "Hợp âm ba C (Triad) vs Hợp âm Cmaj7",
      description: "Từ giản dị, mộc mạc nâng tầm thành sang trọng, bay bổng.",
      optionA: {
        label: "C Trưởng (3 nốt: C - E - G)",
        sublabel: "Mộc mạc, trực diện, cơ bản",
        example: {
          id: "cmp-c",
          label: "C Triad",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      optionB: {
        label: "Cmaj7 (4 nốt: C - E - G - B)",
        sublabel: "Mộng mơ, hoài niệm, chất Jazz & Lo-Fi",
        example: {
          id: "cmp-c7",
          label: "Cmaj7",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
            { name: "B4", midi: 71 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67, 71],
      },
      whyDifferenceMatters:
        "Thêm hợp âm 7 vào tiến trình là bí quyết số một để biến những bài nhạc đơn giản trở nên tinh tế và chuyên nghiệp.",
    },

    challenge: {
      id: "ch-5",
      question: "Hợp âm nào sau đây mang âm hưởng mộng mơ, thư thái đặc trưng của Jazz và Lo-Fi?",
      audioPrompt: {
        id: "ch5-audio",
        label: "Nghe hợp âm Cmaj7",
        notes: [
          { name: "C4", midi: 60 },
          { name: "E4", midi: 64 },
          { name: "G4", midi: 67 },
          { name: "B4", midi: 71 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "Hợp âm Cmaj7 (Major 7th)",
          isCorrect: true,
          explanation: "Chính xác! Cmaj7 mang lại không gian thư thái, mộng mơ không thể nhầm lẫn.",
        },
        {
          label: "Hợp âm C Giảm (Diminished)",
          isCorrect: false,
          explanation: "Hợp âm Giảm mang cảm giác căng thẳng hồi hộp, không phải thư giãn.",
        },
      ],
      hint: "Hãy lắng nghe âm sắc lấp lánh của nốt thứ 7.",
    },
  },

  {
    id: "lesson-6",
    number: 6,
    title: "Hợp âm Treo (Suspended) & Sự Giải Quyết",
    subtitle: "Sus2 & Sus4 — Trì hoãn cảm xúc để tạo điểm bùng nổ",
    level: "Level 2 — Harmony in Motion",
    category: "chords",
    estimatedMinutes: 4,
    conceptTags: ["Hợp âm Treo", "Sus2", "Sus4", "Giải quyết", "Căng thẳng", "Pop/Acoustic"],
    summary:
      "Hợp âm Treo (Suspended / Sus) tạm thời thay thế nốt bậc 3 bằng nốt bậc 2 (Sus2) hoặc bậc 4 (Sus4). Âm thanh lơ lửng, chưa rõ vui hay buồn, tạo cảm giác chờ đợi được giải quyết về hợp âm Trưởng.",

    listenExamples: [
      {
        id: "ex-csus4",
        label: "Csus4 (C - F - G)",
        description: "Lơ lửng, hồi hộp, nốt F như muốn rơi xuống E.",
        notes: [
          { name: "C4", midi: 60, label: "Root (C)" },
          { name: "F4", midi: 65, label: "Bậc 4 (F)" },
          { name: "G4", midi: 67, label: "Bậc 5 (G)" },
        ],
        type: "chord",
      },
      {
        id: "ex-res-c",
        label: "Giải quyết về C Trưởng (C - E - G)",
        description: "Thỏa mãn, giải tỏa, hạ cánh an toàn khi F rơi về E.",
        notes: [
          { name: "C4", midi: 60, label: "Root (C)" },
          { name: "E4", midi: 64, label: "Bậc 3 (E)" },
          { name: "G4", midi: 67, label: "Bậc 5 (G)" },
        ],
        type: "chord",
      },
    ],
    listenGuidance:
      "Nghe Csus4 rồi bấm nghe tiếp C Trưởng. Bạn sẽ cảm nhận rõ ràng cảm giác 'thở phào nhẹ nhõm' khi nốt F được giải quyết rơi về nốt E.",

    visualizeTitle: "Chuyển động giải quyết nốt: F (Bậc 4) → E (Bậc 3)",
    visualizeCaption:
      "Hợp âm Sus4 giữ nốt F ở phím trắng kế bên, sau đó trượt về nốt E để hoàn tất câu nhạc.",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "1 (Gốc)", color: "#8b5cf6" },
      { name: "E4", midi: 64, label: "3 (Điểm đến giải quyết)", color: "#10b981" },
      { name: "F4", midi: 65, label: "4 (Nốt treo Sus4)", color: "#f59e0b" },
      { name: "G4", midi: 67, label: "5 (Bậc 5)", color: "#8b5cf6" },
    ],
    highlightedMidis: [60, 64, 65, 67],

    beginnerExplanation:
      "Từ 'Suspend' nghĩa là treo lơ lửng. Khi bạn chơi Sus4, người nghe bị cuốn vào sự chờ đợi: 'Khi nào hợp âm này mới về đích?'. Khi bạn chuyển từ Sus4 về Trưởng, sự chờ đợi được thỏa mãn hoàn toàn!",
    bulletPoints: [
      "Sus4 = Nốt gốc + Bậc 4 + Bậc 5 (1 - 4 - 5). Không có nốt bậc 3!",
      "Sus2 = Nốt gốc + Bậc 2 + Bậc 5 (1 - 2 - 5). Âm thanh thoáng đãng, hiện đại.",
      "Vì không có nốt bậc 3 nên hợp âm Sus không mang tính Trưởng hay Thứ thuần túy.",
      "Cực kỳ phổ biến trong nhạc Pop, Ballad, Acoustic guitar và Thánh ca.",
    ],
    whyItWorks:
      "Khoảng cách giữa bậc 4 (F) và bậc 5 (G) là một nguyên cung, tạo lực đẩy tự nhiên khiến nốt F muốn trượt xuống nửa cung về E (bậc 3).",
    theoryDetails:
      "Công thức Sus4: 0, 5, 7 nửa cung. Công thức Sus2: 0, 2, 7 nửa cung. Chuyển động Csus4 → C là một trong những thủ pháp tạo điểm nhấn giai điệu mạnh mẽ nhất.",

    experimentTitle: "Thử nghiệm Treo & Giải Quyết",
    experimentPrompt:
      "Nhấn phát chuỗi Csus4 → C để cảm nhận chuyển động hòa âm đầy thỏa mãn này.",
    experimentType: "tension_resolution",

    comparison: {
      id: "comp-sus-resolve",
      title: "Csus4 (Lơ lửng chờ đợi) vs C Trưởng (Thỏa mãn giải quyết)",
      description: "Cặp đôi hòa âm hoàn hảo cho những câu kết đoạn cao trào.",
      optionA: {
        label: "Csus4 (C - F - G)",
        sublabel: "Treo lơ lửng, tạo kỳ vọng",
        example: {
          id: "cmp-sus",
          label: "Csus4",
          notes: [
            { name: "C4", midi: 60 },
            { name: "F4", midi: 65 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 65, 67],
      },
      optionB: {
        label: "C Trưởng (C - E - G)",
        sublabel: "Hạ cánh an toàn, giải tỏa căng thẳng",
        example: {
          id: "cmp-res",
          label: "C Major",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      whyDifferenceMatters:
        "Tạo căng thẳng rồi giải quyết chính là bí quyết giữ chân người nghe trong suốt bài hát.",
    },

    challenge: {
      id: "ch-6",
      question: "Sau khi nghe hợp âm Sus4 lơ lửng, người nghe có cảm giác kỳ vọng điều gì nhất?",
      audioPrompt: {
        id: "ch6-audio",
        label: "Nghe chuỗi Csus4 giải quyết về C",
        notes: [
          { name: "C4", midi: 60 },
          { name: "F4", midi: 65 },
          { name: "G4", midi: 67 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "Kỳ vọng nốt treo rơi về nốt bậc 3 để giải quyết (Csus4 → C)",
          isCorrect: true,
          explanation: "Chính xác! Người nghe tự nhiên khao khát được hạ cánh về nốt bậc 3 của hợp âm Trưởng.",
        },
        {
          label: "Muốn bài hát dừng lại vĩnh viễn ở nốt treo",
          isCorrect: false,
          explanation: "Dừng lại ở hợp âm treo sẽ để lại cảm giác dang dở, hụt hẫng chưa kết thúc.",
        },
      ],
      hint: "Hãy nhớ lại cảm giác thở phào nhẹ nhõm khi nốt F trượt về E.",
    },
  },

  {
    id: "lesson-7",
    number: 7,
    title: "Đảo Hợp Âm (Chord Inversions)",
    subtitle: "Thế gốc, Đảo 1 & Đảo 2 — Cùng nốt nhưng đổi bè trầm",
    level: "Level 2 — Harmony in Motion",
    category: "voice_leading",
    estimatedMinutes: 4,
    conceptTags: ["Đảo hợp âm", "Thế gốc", "Đảo 1", "Đảo 2", "Bassline", "Dẫn bè"],
    summary:
      "Đảo hợp âm là kỹ thuật thay đổi trật tự sắp xếp các nốt của hợp âm để nốt trầm nhất (Bass) là nốt bậc 3 hoặc bậc 5 thay vì nốt gốc. Điều này giúp đường bass di chuyển mượt mà hơn mà không bị nhảy quãng xa.",

    listenExamples: [
      {
        id: "ex-root-pos",
        label: "C Thế gốc (Root Position: C - E - G)",
        description: "Nốt C nằm dưới đáy bè trầm — Vững chãi, chắc nịch.",
        notes: [
          { name: "C4", midi: 60, label: "Bass: C" },
          { name: "E4", midi: 64, label: "3rd: E" },
          { name: "G4", midi: 67, label: "5th: G" },
        ],
        type: "chord",
      },
      {
        id: "ex-inv-1",
        label: "C Đảo thứ nhất (1st Inversion / C/E: E - G - C)",
        description: "Nốt E nằm dưới đáy bè trầm — Nhẹ nhàng, thanh thoát, hướng lên.",
        notes: [
          { name: "E4", midi: 64, label: "Bass: E" },
          { name: "G4", midi: 67, label: "5th: G" },
          { name: "C5", midi: 72, label: "Root: C" },
        ],
        type: "chord",
      },
      {
        id: "ex-inv-2",
        label: "C Đảo thứ hai (2nd Inversion / C/G: G - C - E)",
        description: "Nốt G nằm dưới đáy bè trầm — Cảm giác lơ lửng, tạo đà chuyển tiếp.",
        notes: [
          { name: "G3", midi: 55, label: "Bass: G" },
          { name: "C4", midi: 60, label: "Root: C" },
          { name: "E4", midi: 64, label: "3rd: E" },
        ],
        type: "chord",
      },
    ],
    listenGuidance:
      "Nghe 3 thế bấm của cùng một hợp âm C. Tất cả đều chỉ gồm nốt C, E, G, nhưng nốt ở đáy bè trầm thay đổi mang lại màu sắc và cảm giác nâng đỡ khác nhau.",

    visualizeTitle: "Ba vị trí đảo ngón trên bàn phím",
    visualizeCaption:
      "Thế gốc (C-E-G) → Đảo 1 (E-G-C) → Đảo 2 (G-C-E).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "C (Gốc)", color: "#8b5cf6" },
      { name: "E4", midi: 64, label: "E (Đảo 1)", color: "#10b981" },
      { name: "G4", midi: 67, label: "G (Đảo 2)", color: "#f59e0b" },
      { name: "C5", midi: 72, label: "C (Ngọn)", color: "#a855f7" },
    ],
    highlightedMidis: [60, 64, 67, 72],

    beginnerExplanation:
      "Hãy tưởng tượng một nhóm 3 người bạn. Dù ai đứng trước hay ai đứng sau, nhóm đó vẫn là họ! Khi bạn đảo hợp âm, tay bạn không cần nhảy xa trên phím đàn mà chỉ cần dịch chuyển các ngón tay gần nhất (Dẫn bè mượt mà - Smooth Voice Leading).",
    bulletPoints: [
      "Thế gốc (Root Position): Nốt gốc ở dưới cùng (Ví dụ: C ở dưới).",
      "Đảo 1 (First Inversion): Nốt bậc 3 ở dưới cùng (Ký hiệu: C/E).",
      "Đảo 2 (Second Inversion): Nốt bậc 5 ở dưới cùng (Ký hiệu: C/G).",
      "Giúp giai điệu và đường bè trầm (Bassline) liên kết liền mạch như dòng nước chảy.",
    ],
    whyItWorks:
      "Não bộ con người theo dõi chặt chẽ nốt trầm nhất (Bass) và nốt cao nhất (Giai điệu). Đảo hợp âm cho phép bạn tạo ra những đường dẫn bè trầm bước từng bước êm ái.",
    theoryDetails:
      "Trong ký âm hòa âm cổ điển (Figured Bass), Đảo 1 của hợp âm ba được ký hiệu là 6 (hoặc 6/3), Đảo 2 được ký hiệu là 6/4.",

    experimentTitle: "Phòng thử nghiệm Đảo thế bấm",
    experimentPrompt:
      "Chọn các thế đảo khác nhau (Thế gốc, Đảo 1, Đảo 2) để nghe sự thay đổi về độ dày và tính liên kết của hợp âm.",
    experimentType: "inversion_picker",

    comparison: {
      id: "comp-inversions",
      title: "Thế gốc (C ở Bass) vs Đảo 1 (E ở Bass)",
      description: "Cùng một hợp âm nhưng tính chất nâng đỡ và mở đường giai điệu hoàn toàn khác.",
      optionA: {
        label: "C Thế gốc (C - E - G)",
        sublabel: "Vững chãi, cố định, uy lực",
        example: {
          id: "cmp-root",
          label: "C Root Position",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      optionB: {
        label: "C Đảo 1 (E - G - C / C/E)",
        sublabel: "Mượt mà, thanh thoát, kết nối bass đi bộ",
        example: {
          id: "cmp-inv1",
          label: "C/E (1st Inversion)",
          notes: [
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
            { name: "C5", midi: 72 },
          ],
          type: "chord",
        },
        highlightMidis: [64, 67, 72],
      },
      whyDifferenceMatters:
        "Sử dụng thế đảo giúp bài nhạc của bạn thoát khỏi cảm giác gượng gạo, 'nhảy cóc' giữa các hợp âm.",
    },

    challenge: {
      id: "ch-7",
      question: "Khi một hợp âm C trưởng được chơi với nốt E ở vị trí trầm nhất (E - G - C), đó là thế đảo nào?",
      audioPrompt: {
        id: "ch7-audio",
        label: "Nghe C Đảo 1 (C/E)",
        notes: [
          { name: "E4", midi: 64 },
          { name: "G4", midi: 67 },
          { name: "C5", midi: 72 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "Đảo thứ nhất (1st Inversion - Nốt bậc 3 ở Bass)",
          isCorrect: true,
          explanation: "Chính xác! Nốt bậc 3 (E) nằm ở đáy bè trầm chính là định nghĩa của Đảo thứ nhất.",
        },
        {
          label: "Thế gốc (Root Position)",
          isCorrect: false,
          explanation: "Thế gốc yêu cầu nốt C phải nằm ở đáy bè trầm.",
        },
      ],
      hint: "E là nốt bậc mấy của C? (C là 1, D là 2, E là 3).",
    },
  },

  {
    id: "lesson-8",
    number: 8,
    title: "Gam Trưởng (The Major Scale)",
    subtitle: "Quy luật Cung & Nửa cung sinh ra thế giới âm nhạc",
    level: "Level 1 — Musical Foundations",
    category: "scales",
    estimatedMinutes: 5,
    conceptTags: ["Gam Trưởng", "Nguyên cung", "Nửa cung", "Do-Re-Mi", "Công thức"],
    summary:
      "Gam Trưởng là chiếc thang 7 bậc kỳ diệu quen thuộc qua bài ca Do-Re-Mi-Fa-Sol-La-Si-Do. Mọi gam trưởng đều được xây dựng theo một công thức toán học bất biến về khoảng cách Cung và Nửa cung.",

    listenExamples: [
      {
        id: "ex-c-scale-up",
        label: "Gam C Trưởng đi lên (C4 → C5)",
        description: "Tươi sáng, hân hoan, tràn đầy sức sống và tinh thần lạc quan.",
        notes: [
          { name: "C4", midi: 60 },
          { name: "D4", midi: 62 },
          { name: "E4", midi: 64 },
          { name: "F4", midi: 65 },
          { name: "G4", midi: 67 },
          { name: "A4", midi: 69 },
          { name: "B4", midi: 71 },
          { name: "C5", midi: 72 },
        ],
        type: "scale",
      },
      {
        id: "ex-c-scale-down",
        label: "Gam C Trưởng đi xuống (C5 → C4)",
        description: "Êm ái trở về điểm tựa chủ âm C bình yên.",
        notes: [
          { name: "C5", midi: 72 },
          { name: "B4", midi: 71 },
          { name: "A4", midi: 69 },
          { name: "G4", midi: 67 },
          { name: "F4", midi: 65 },
          { name: "E4", midi: 64 },
          { name: "D4", midi: 62 },
          { name: "C4", midi: 60 },
        ],
        type: "scale",
      },
    ],
    listenGuidance:
      "Nghe chuỗi 8 nốt đi lên. Chú ý bước nhảy từ nốt thứ 7 (B) lên nốt thứ 8 (C) chỉ cách đúng nửa cung, tạo cảm giác 'về nhà' trọn vẹn.",

    visualizeTitle: "Công thức Cung & Nửa cung của Gam Trưởng",
    visualizeCaption:
      "Cung - Cung - Nửa - Cung - Cung - Cung - Nửa (W - W - H - W - W - W - H).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "1 (Do)", color: "#8b5cf6" },
      { name: "D4", midi: 62, label: "2 (Re)", color: "#6366f1" },
      { name: "E4", midi: 64, label: "3 (Mi)", color: "#3b82f6" },
      { name: "F4", midi: 65, label: "4 (Fa)", color: "#10b981" },
      { name: "G4", midi: 67, label: "5 (Sol)", color: "#f59e0b" },
      { name: "A4", midi: 69, label: "6 (La)", color: "#ec4899" },
      { name: "B4", midi: 71, label: "7 (Si)", color: "#a855f7" },
      { name: "C5", midi: 72, label: "8 (Do)", color: "#8b5cf6" },
    ],
    highlightedMidis: [60, 62, 64, 65, 67, 69, 71, 72],

    beginnerExplanation:
      "Nếu bạn bắt đầu từ nốt C và bấm liên tiếp toàn bộ các phím trắng lên đến nốt C tiếp theo, bạn vừa chơi một Gam C Trưởng hoàn hảo! Công thức 'Cung - Cung - Nửa - Cung - Cung - Cung - Nửa' có thể áp dụng từ BẤT KỲ nốt gốc nào để tạo ra gam trưởng của nốt đó.",
    bulletPoints: [
      "Gồm 7 nốt khác nhau + nốt thứ 8 lặp lại ở quãng tám.",
      "Vị trí Nửa cung (Half-step) luôn nằm giữa bậc 3–4 (E–F) và bậc 7–8 (B–C).",
      "Nốt bậc 7 (Si / B) được gọi là Nốt Dẫn (Leading tone), có lực hút mãnh liệt kéo về nốt chủ âm (C).",
    ],
    whyItWorks:
      "Cấu trúc cân bằng đối xứng giữa hai cụm 4 nốt (Tetrachords: C-D-E-F và G-A-B-C) tạo nên cảm giác hài hòa hoàn mỹ tuyệt đối cho tai người.",
    theoryDetails:
      "W = Whole step (2 nửa cung = 1 cung). H = Half step (1 nửa cung). Công thức: W - W - H - W - W - W - H.",

    experimentTitle: "Khám phá Gam âm nhạc",
    experimentPrompt:
      "Chọn các gam khác nhau và nghe giai điệu đi lên, đi xuống cùng chuỗi 7 hợp âm tự nhiên tương ứng.",
    experimentType: "scale_player",

    comparison: {
      id: "comp-scales-maj-min",
      title: "Gam C Trưởng (Ionian) vs Gam A Thứ tự nhiên (Aeolian)",
      description: "Hai gam có cùng các nốt phím trắng nhưng nốt trung tâm (chủ âm) khác nhau.",
      optionA: {
        label: "Gam C Trưởng (Khởi đầu từ C)",
        sublabel: "Rạng rỡ, phấn khởi, hoan ca",
        example: {
          id: "cmp-cscale",
          label: "C Major Scale",
          notes: [
            { name: "C4", midi: 60 },
            { name: "D4", midi: 62 },
            { name: "E4", midi: 64 },
            { name: "F4", midi: 65 },
            { name: "G4", midi: 67 },
            { name: "A4", midi: 69 },
            { name: "B4", midi: 71 },
            { name: "C5", midi: 72 },
          ],
          type: "scale",
        },
        highlightMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      },
      optionB: {
        label: "Gam A Thứ (Khởi đầu từ A)",
        sublabel: "Trầm lắng, u buồn, hoài niệm",
        example: {
          id: "cmp-ascale",
          label: "A Minor Scale",
          notes: [
            { name: "A3", midi: 57 },
            { name: "B3", midi: 59 },
            { name: "C4", midi: 60 },
            { name: "D4", midi: 62 },
            { name: "E4", midi: 64 },
            { name: "F4", midi: 65 },
            { name: "G4", midi: 67 },
            { name: "A4", midi: 69 },
          ],
          type: "scale",
        },
        highlightMidis: [57, 59, 60, 62, 64, 65, 67, 69],
      },
      whyDifferenceMatters:
        "Cùng dùng các phím trắng nhưng điểm dừng chân làm chủ âm (C hay A) sẽ quyết định toàn bộ tâm trạng của tác phẩm.",
    },

    challenge: {
      id: "ch-8",
      question: "Trong gam C trưởng, khoảng cách nửa cung (Half-step) nằm ở những cặp nốt nào?",
      audioPrompt: {
        id: "ch8-audio",
        label: "Nghe gam C trưởng",
        notes: [
          { name: "C4", midi: 60 },
          { name: "D4", midi: 62 },
          { name: "E4", midi: 64 },
          { name: "F4", midi: 65 },
          { name: "G4", midi: 67 },
          { name: "A4", midi: 69 },
          { name: "B4", midi: 71 },
          { name: "C5", midi: 72 },
        ],
        type: "scale",
      },
      options: [
        {
          label: "Giữa E–F (bậc 3–4) và B–C (bậc 7–8)",
          isCorrect: true,
          explanation: "Chính xác! Trên phím đàn, giữa E-F và B-C không có phím đen xen giữa, chúng cách nhau đúng 1 nửa cung.",
        },
        {
          label: "Giữa C–D và G–A",
          isCorrect: false,
          explanation: "C-D và G-A đều là nguyên cung (cách nhau bởi phím đen).",
        },
      ],
      hint: "Nhìn vào bàn phím: Chỗ nào hai phím trắng nằm sát nhau không có phím đen?",
    },
  },

  {
    id: "lesson-9",
    number: 9,
    title: "Hòa Âm Tự Nhiên (Diatonic Harmony) & Số La Mã",
    subtitle: "Họ 7 hợp âm sinh ra từ một Giọng",
    level: "Level 2 — Harmony in Motion",
    category: "harmony",
    estimatedMinutes: 5,
    conceptTags: ["Hòa âm tự nhiên", "Số La Mã", "Chủ âm", "Át âm", "Hạ át", "Giọng C"],
    summary:
      "Khi bạn xây dựng hợp âm ba trên từng bậc nốt của một gam, bạn sẽ nhận được một 'gia đình' gồm 7 hợp âm tự nhiên. Chúng ta dùng số La Mã (I, ii, iii, IV, V, vi, vii°) để gọi tên vai trò của chúng trong bất kỳ giọng nào.",

    listenExamples: [
      {
        id: "ex-diatonic-c",
        label: "7 Hợp âm trong Giọng C Trưởng (I đến vii°)",
        description: "C → Dm → Em → F → G → Am → Bdim",
        notes: [
          { name: "C4", midi: 60 },
          { name: "E4", midi: 64 },
          { name: "G4", midi: 67 },
        ],
        chords: [
          { id: "d1", name: "C", root: "C", quality: "major", beats: 2, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67], romanNumeral: "I" },
          { id: "d2", name: "Dm", root: "D", quality: "minor", beats: 2, notes: ["D4", "F4", "A4"], midiNotes: [62, 65, 69], romanNumeral: "ii" },
          { id: "d3", name: "Em", root: "E", quality: "minor", beats: 2, notes: ["E4", "G4", "B4"], midiNotes: [64, 67, 71], romanNumeral: "iii" },
          { id: "d4", name: "F", root: "F", quality: "major", beats: 2, notes: ["F4", "A4", "C5"], midiNotes: [65, 69, 72], romanNumeral: "IV" },
          { id: "d5", name: "G", root: "G", quality: "major", beats: 2, notes: ["G4", "B4", "D5"], midiNotes: [67, 71, 74], romanNumeral: "V" },
          { id: "d6", name: "Am", root: "A", quality: "minor", beats: 2, notes: ["A4", "C5", "E5"], midiNotes: [69, 72, 76], romanNumeral: "vi" },
          { id: "d7", name: "Bdim", root: "B", quality: "diminished", beats: 2, notes: ["B4", "D5", "F5"], midiNotes: [71, 74, 77], romanNumeral: "vii°" },
        ],
        type: "progression",
      },
    ],
    listenGuidance:
      "Bấm nghe chuỗi 7 hợp âm. Chú ý các hợp âm Trưởng (I, IV, V) nghe rực rỡ, các hợp âm Thứ (ii, iii, vi) nghe êm dịu, và hợp âm Giảm (vii°) nghe hồi hộp.",

    visualizeTitle: "Bản đồ 7 Hợp âm trong Giọng Trưởng",
    visualizeCaption:
      "Quy luật bất biến: I (Trưởng) - ii (Thứ) - iii (Thứ) - IV (Trưởng) - V (Trưởng) - vi (Thứ) - vii° (Giảm).",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "I (C Trưởng)", color: "#8b5cf6" },
      { name: "D4", midi: 62, label: "ii (Dm)", color: "#6366f1" },
      { name: "E4", midi: 64, label: "iii (Em)", color: "#3b82f6" },
      { name: "F4", midi: 65, label: "IV (F Trưởng)", color: "#10b981" },
      { name: "G4", midi: 67, label: "V (G Trưởng)", color: "#f59e0b" },
      { name: "A4", midi: 69, label: "vi (Am)", color: "#ec4899" },
      { name: "B4", midi: 71, label: "vii° (Bdim)", color: "#ef4444" },
    ],
    highlightedMidis: [60, 62, 64, 65, 67, 69, 71],

    beginnerExplanation:
      "Tại sao chúng ta dùng số La Mã? Vì nếu bạn biết bài hát dùng tiến trình 'I - V - vi - IV', bạn có thể chơi ngay trong Giọng C (C - G - Am - F) hoặc Giọng G (G - D - Em - C) một cách dễ dàng mà không cần học lại từ đầu!",
    bulletPoints: [
      "Chữ IN HOA (I, IV, V) = Hợp âm Trưởng.",
      "Chữ in thường (ii, iii, vi) = Hợp âm Thứ.",
      "Chữ in thường kèm dấu tròn (vii°) = Hợp âm Giảm.",
      "I là Chủ âm (Tonic - Nhà), IV là Hạ át (Subdominant), V là Át âm (Dominant - Đẩy về nhà).",
    ],
    whyItWorks:
      "Tất cả các nốt của 7 hợp âm này đều nằm gọn gàng trong cùng một gam nhạc, vì vậy khi kết hợp với nhau, chúng không bao giờ bị 'phô' hay lạc điệu.",
    theoryDetails:
      "3 chức năng hòa âm cốt lõi: Tonic (I, vi, iii - Nghỉ ngơi), Subdominant (IV, ii - Đi xa), Dominant (V, vii° - Căng thẳng muốn về Tonic).",

    experimentTitle: "Phòng hòa âm các bậc trong Giọng",
    experimentPrompt:
      "Bấm từng bậc hợp âm (I, IV, V, vi) để cảm nhận mối quan hệ gia đình giữa chúng.",
    experimentType: "key_chords",

    comparison: {
      id: "comp-func-harmony",
      title: "Chủ âm I (Ổn định tại Nhà) vs Át âm V (Căng thẳng thúc giục)",
      description: "Cặp đấu hòa âm tạo nên động cơ chuyển động của 99% các bài hát.",
      optionA: {
        label: "I - C Trưởng (Chủ âm / Tonic)",
        sublabel: "Điểm tựa bình yên, nghỉ ngơi trọn vẹn",
        example: {
          id: "cmp-i",
          label: "I Chord (C)",
          notes: [
            { name: "C4", midi: 60 },
            { name: "E4", midi: 64 },
            { name: "G4", midi: 67 },
          ],
          type: "chord",
        },
        highlightMidis: [60, 64, 67],
      },
      optionB: {
        label: "V - G Trưởng (Át âm / Dominant)",
        sublabel: "Năng lượng dồn nén, muốn lao về I",
        example: {
          id: "cmp-v",
          label: "V Chord (G)",
          notes: [
            { name: "G3", midi: 55 },
            { name: "B3", midi: 59 },
            { name: "D4", midi: 62 },
          ],
          type: "chord",
        },
        highlightMidis: [55, 59, 62],
      },
      whyDifferenceMatters:
        "Hiểu được sự đối lập giữa I (Nhà) và V (Đi xa) là chìa khóa để bạn làm chủ cấu trúc sáng tác bài hát.",
    },

    challenge: {
      id: "ch-9",
      question: "Trong giọng C Trưởng, hợp âm bậc V (Át âm) là hợp âm nào?",
      audioPrompt: {
        id: "ch9-audio",
        label: "Nghe hợp âm bậc V trong C",
        notes: [
          { name: "G3", midi: 55 },
          { name: "B3", midi: 59 },
          { name: "D4", midi: 62 },
        ],
        type: "chord",
      },
      options: [
        {
          label: "G Trưởng (Bậc 5 tính từ C)",
          isCorrect: true,
          explanation: "Chính xác! Đếm từ C (1), D (2), E (3), F (4), G (5). Hợp âm bậc V là G Trưởng.",
        },
        {
          label: "F Trưởng (Bậc 4)",
          isCorrect: false,
          explanation: "F là hợp âm bậc IV (Hạ át), không phải bậc V.",
        },
        {
          label: "Am (Bậc 6)",
          isCorrect: false,
          explanation: "Am là hợp âm bậc vi, không phải bậc V.",
        },
      ],
      hint: "Đếm ngón tay từ nốt C: C (1), D (2), E (3), F (4), ... ?",
    },
  },

  {
    id: "lesson-10",
    number: 10,
    title: "Tiến Trình Pop Kinh Điển (I - V - vi - IV)",
    subtitle: "Công thức của hàng trăm bài hit thế giới",
    level: "Level 2 — Harmony in Motion",
    category: "harmony",
    estimatedMinutes: 5,
    conceptTags: ["Tiến trình Pop", "I-V-vi-IV", "Hợp âm Hit", "C-G-Am-F", "Sáng tác"],
    summary:
      "Tiến trình hợp âm I - V - vi - IV (trong giọng C là: C → G → Am → F) là tiến trình hợp âm nổi tiếng và thành công nhất trong lịch sử âm nhạc hiện đại, xuất hiện trong hàng trăm bản hit toàn cầu.",

    listenExamples: [
      {
        id: "ex-pop-prog",
        label: "Tiến trình Pop: C → G → Am → F",
        description: "Nghe chuỗi 4 hợp âm thần thánh kể một câu chuyện cảm xúc hoàn hảo.",
        chords: [
          { id: "p1", name: "C", root: "C", quality: "major", beats: 4, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67], romanNumeral: "I" },
          { id: "p2", name: "G", root: "G", quality: "major", beats: 4, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62], romanNumeral: "V" },
          { id: "p3", name: "Am", root: "A", quality: "minor", beats: 4, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64], romanNumeral: "vi" },
          { id: "p4", name: "F", root: "F", quality: "major", beats: 4, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60], romanNumeral: "IV" },
        ],
        type: "progression",
      },
    ],
    listenGuidance:
      "Lắng nghe tiến trình lặp lại. Cảm nhận câu chuyện: I (Bắt đầu tự tin) → V (Bước ra ngoài) → vi (Thăng trầm cảm xúc) → IV (Hy vọng mở ra để vòng lặp tiếp tục).",

    visualizeTitle: "Vòng lặp 4 Hợp âm bất tận",
    visualizeCaption:
      "C (I) → G (V) → Am (vi) → F (IV) → Quay lại C.",
    visualizeNotes: [
      { name: "C4", midi: 60, label: "I (C)", color: "#8b5cf6" },
      { name: "G3", midi: 55, label: "V (G)", color: "#f59e0b" },
      { name: "A3", midi: 57, label: "vi (Am)", color: "#ec4899" },
      { name: "F3", midi: 53, label: "IV (F)", color: "#10b981" },
    ],
    highlightedMidis: [53, 55, 57, 60],

    beginnerExplanation:
      "Từ những bài hát bất hủ như 'Let It Be' (The Beatles), 'Someone Like You' (Adele), 'Don't Stop Believin'' đến hàng loạt ca khúc V-Pop đình đám, tất cả đều chia sẻ chung vòng hòa âm kỳ diệu này.",
    bulletPoints: [
      "I (C): Thiết lập không gian âm nhạc tươi sáng ban đầu.",
      "V (G): Đẩy năng lượng lên cao.",
      "vi (Am): Bất ngờ lắng lại với âm hưởng Thứ đầy chất thơ.",
      "IV (F): Tạo bước đệm êm ái nâng đỡ giai điệu quay lại nốt chủ âm.",
    ],
    whyItWorks:
      "Vòng hòa âm này cân bằng hoàn hảo giữa tính Trưởng (3 hợp âm C, G, F) và tính Thứ (1 hợp âm Am), tạo cảm xúc vừa lạc quan vừa sâu lắng.",
    theoryDetails:
      "Các biến thể quen thuộc khác: vi - IV - I - V (Am - F - C - G: Cảm giác sâu sắc, kịch tính hơn), I - vi - IV - V (C - Am - F - G: Phong cách Doo-Wop thập niên 50).",

    experimentTitle: "Sân chơi biến tấu Tiến trình",
    experimentPrompt:
      "Đổi thứ tự các hợp âm (ví dụ: bắt đầu từ Am thay vì C) để tạo nên những màu sắc câu chuyện hoàn toàn mới.",
    experimentType: "progression_tweak",

    comparison: {
      id: "comp-pop-order",
      title: "C → G → Am → F (Pop sáng) vs Am → F → C → G (Pop sâu lắng)",
      description: "Cùng 4 hợp âm nhưng đổi vị trí bắt đầu sẽ đổi toàn bộ tông màu cảm xúc.",
      optionA: {
        label: "I - V - vi - IV (C - G - Am - F)",
        sublabel: "Tươi sáng, truyền cảm hứng, hùng tráng",
        example: {
          id: "cmp-pop1",
          label: "I - V - vi - IV",
          chords: [
            { id: "a1", name: "C", root: "C", quality: "major", beats: 2, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
            { id: "a2", name: "G", root: "G", quality: "major", beats: 2, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62] },
            { id: "a3", name: "Am", root: "A", quality: "minor", beats: 2, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64] },
            { id: "a4", name: "F", root: "F", quality: "major", beats: 2, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60] },
          ],
          type: "progression",
        },
      },
      optionB: {
        label: "vi - IV - I - V (Am - F - C - G)",
        sublabel: "Tâm trạng, da diết, kịch tính",
        example: {
          id: "cmp-pop2",
          label: "vi - IV - I - V",
          chords: [
            { id: "b1", name: "Am", root: "A", quality: "minor", beats: 2, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64] },
            { id: "b2", name: "F", root: "F", quality: "major", beats: 2, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60] },
            { id: "b3", name: "C", root: "C", quality: "major", beats: 2, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
            { id: "b4", name: "G", root: "G", quality: "major", beats: 2, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62] },
          ],
          type: "progression",
        },
      },
      whyDifferenceMatters:
        "Chỉ cần thay đổi điểm khởi đầu của vòng hợp âm, bạn có thể biến một bài hát vui thành một bản ballad tâm trạng.",
    },

    challenge: {
      id: "ch-10",
      question: "Hợp âm thứ duy nhất xuất hiện trong tiến trình Pop kinh điển (I - V - vi - IV) trong giọng C là hợp âm nào?",
      audioPrompt: {
        id: "ch10-audio",
        label: "Nghe tiến trình I - V - vi - IV",
        chords: [
          { id: "p1", name: "C", root: "C", quality: "major", beats: 2, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
          { id: "p2", name: "G", root: "G", quality: "major", beats: 2, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62] },
          { id: "p3", name: "Am", root: "A", quality: "minor", beats: 2, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64] },
          { id: "p4", name: "F", root: "F", quality: "major", beats: 2, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60] },
        ],
        type: "progression",
      },
      options: [
        {
          label: "Am (Hợp âm bậc vi)",
          isCorrect: true,
          explanation: "Chính xác! Am (vi) là nét chấm phá u buồn ngọt ngào giữa ba hợp âm Trưởng C, G và F.",
        },
        {
          label: "Dm (Hợp âm bậc ii)",
          isCorrect: false,
          explanation: "Dm không nằm trong tiến trình I - V - vi - IV tiêu chuẩn.",
        },
      ],
      hint: "Hợp âm thứ 3 trong chuỗi 4 hợp âm là gì?",
    },
  },

  {
    id: "lesson-11",
    number: 11,
    title: "Phách, Nhịp độ & Số chỉ nhịp",
    subtitle: "Nhịp 4/4, 3/4 & 6/8 — Khung xương thời gian của âm nhạc",
    level: "Level 1 — Musical Foundations",
    category: "rhythm",
    estimatedMinutes: 4,
    conceptTags: ["Tiết tấu", "Số chỉ nhịp", "Nhịp 4/4", "Nhịp 3/4", "Nhịp 6/8", "BPM"],
    summary:
      "Âm nhạc không chỉ có cao độ mà còn cần nhịp điệu. Phách (Beat) là nhịp đập của bài hát, Nhịp độ (BPM) là tốc độ nhanh chậm, và Số chỉ nhịp (Time Signature) quy định cách gom các phách vào từng ô nhịp.",

    listenExamples: [
      {
        id: "ex-meter-44",
        label: "Nhịp 4/4 (Nhịp phổ thông - 4 phách mỗi ô)",
        description: "MẠNH - nhẹ - vừa - nhẹ (1 - 2 - 3 - 4). Chuẩn mực của Pop, Rock, EDM.",
        timeSignature: "4/4",
        bpm: 100,
        type: "meter",
      },
      {
        id: "ex-meter-34",
        label: "Nhịp 3/4 (Nhịp Valse khiêu vũ - 3 phách)",
        description: "MẠNH - nhẹ - nhẹ (1 - 2 - 3, 1 - 2 - 3). Dập dìu, uyển chuyển.",
        timeSignature: "3/4",
        bpm: 110,
        type: "meter",
      },
      {
        id: "ex-meter-68",
        label: "Nhịp 6/8 (Nhịp chia nhóm 3+3 phách nhỏ)",
        description: "MẠNH-2-3 VỪA-5-6 (Cảm nhận như 2 nhịp đung đưa lớn). Ballad & R&B da diết.",
        timeSignature: "6/8",
        timeSignatureGrouping: [3, 3],
        bpm: 70,
        type: "meter",
      },
    ],
    listenGuidance:
      "Lắng nghe tiếng gõ máy đếm nhịp. Tiếng gõ cao (Trọng âm) luôn đánh dấu phách mạnh đầu tiên của mỗi ô nhịp (Downbeat). Đếm theo nhịp: 1-2-3-4 hoặc 1-2-3.",

    visualizeTitle: "Trực quan hóa Ô nhịp và Phách",
    visualizeCaption:
      "Vạch nhịp chia đều thời gian. Phách số 1 luôn là phách nặng nhất.",
    visualizeNotes: [
      { name: "Phách 1", midi: 60, label: "MẠNH (Trọng âm)", color: "#ef4444" },
      { name: "Phách 2", midi: 60, label: "Nhẹ", color: "#64748b" },
      { name: "Phách 3", midi: 60, label: "Vừa", color: "#f59e0b" },
      { name: "Phách 4", midi: 60, label: "Nhẹ", color: "#64748b" },
    ],
    highlightedMidis: [60],

    beginnerExplanation:
      "Hãy tưởng tượng nhịp 4/4 như bước đi đều của đôi chân (Trái - Phải - Trái - Phải). Nhịp 3/4 giống như điệu nhảy Valse xoay tròn (Xoay - bước - bước). Nhịp 6/8 giống như chiếc nôi đung đưa nhịp nhàng (1-2-3, 2-2-3).",
    bulletPoints: [
      "BPM (Beats Per Minute): Số phách trong một phút. 60 BPM = 1 giây/phách. 120 BPM = 2 phách/giây.",
      "Số trên (ví dụ số 4 trong 4/4): Số lượng phách trong một ô nhịp.",
      "Số dưới (ví dụ số 4 trong 4/4): Loại nốt được tính là một phách (4 = nốt đen).",
      "Nhịp 6/8 thường được cảm nhận thành hai nhóm, mỗi nhóm gồm ba phách nhỏ.",
    ],
    whyItWorks:
      "Não bộ con người bẩm sinh luôn tự động đồng bộ nhịp tim và bước chân theo nhịp điệu âm thanh tuần hoàn có chu kỳ.",
    theoryDetails:
      "Nhịp đơn (Simple Meter): Phách chia đôi (như 4/4, 3/4). Nhịp kép (Compound Meter): Phách chia ba (như 6/8, 9/8, 12/8).",

    experimentTitle: "Phòng thử nghiệm Tiết tấu & Nhịp",
    experimentPrompt:
      "Chuyển đổi giữa nhịp 4/4, 3/4, 6/8 và điều chỉnh tốc độ BPM để nghe nhịp điệu biến chuyển.",
    experimentType: "meter_grooves",

    comparison: {
      id: "comp-meter-44-34",
      title: "Nhịp 4/4 (Nhịp Pop/Rock) vs Nhịp 3/4 (Nhịp Valse)",
      description: "Hai cấu trúc nhịp kinh điển định hình toàn bộ dáng điệu của âm nhạc.",
      optionA: {
        label: "Nhịp 4/4 (4 Phách)",
        sublabel: "Bước đi vững chãi, vuông vắn, nhịp nhàng",
        example: {
          id: "cmp-m4",
          label: "4/4 Meter",
          timeSignature: "4/4",
          bpm: 100,
          type: "meter",
        },
      },
      optionB: {
        label: "Nhịp 3/4 (3 Phách)",
        sublabel: "Xoay tròn, dập dìu, mềm mại như cánh buồm",
        example: {
          id: "cmp-m3",
          label: "3/4 Meter",
          timeSignature: "3/4",
          bpm: 105,
          type: "meter",
        },
      },
      whyDifferenceMatters:
        "Chọn đúng số chỉ nhịp là bước đầu tiên để truyền tải đúng linh hồn của thể loại bài hát bạn muốn sáng tác.",
    },

    challenge: {
      id: "ch-11",
      question: "Một bản nhạc có nhịp đếm dập dìu '1 - 2 - 3, 1 - 2 - 3' thuộc số chỉ nhịp nào?",
      audioPrompt: {
        id: "ch11-audio",
        label: "Nghe nhịp 3/4",
        timeSignature: "3/4",
        bpm: 100,
        type: "meter",
      },
      options: [
        {
          label: "Nhịp 3/4 (3 phách mỗi ô nhịp)",
          isCorrect: true,
          explanation: "Chính xác! Nhịp 3/4 gồm 3 phách trong một ô nhịp, đặc trưng của điệu Valse.",
        },
        {
          label: "Nhịp 4/4 (4 phách mỗi ô nhịp)",
          isCorrect: false,
          explanation: "Nhịp 4/4 đếm theo chu kỳ 4 phách (1-2-3-4), không phải 3.",
        },
      ],
      hint: "Đếm số tiếng gõ máy đếm nhịp giữa mỗi lần xuất hiện tiếng gõ cao.",
    },
  },

  {
    id: "lesson-12",
    number: 12,
    title: "Tự Tạo Tiến Trình Hợp Âm Hoàn Chỉnh",
    subtitle: "Áp dụng toàn bộ kiến thức vào sáng tác âm nhạc",
    level: "Level 2 — Harmony in Motion",
    category: "harmony",
    estimatedMinutes: 6,
    conceptTags: ["Sáng tác", "Tiến trình hợp âm", "Chủ âm", "Căng thẳng", "Giải quyết", "Sáng tạo"],
    summary:
      "Chúc mừng bạn đã hoàn thành hành trình! Giờ là lúc kết hợp mọi kỹ năng: Nốt nhạc, Quãng, Hợp âm Trưởng/Thứ, Đảo hợp âm và Nhịp điệu để tự tay tạo nên tiến trình hòa âm độc đáo của riêng mình.",

    listenExamples: [
      {
        id: "ex-complete-prog",
        label: "Tiến trình Ballad giàu cảm xúc: Cmaj7 → Em7 → Fmaj7 → G7",
        description: "Sử dụng hợp âm 7 và chuyển động dẫn bè mượt mà.",
        chords: [
          { id: "cp1", name: "Cmaj7", root: "C", quality: "maj7", beats: 4, notes: ["C4", "E4", "G4", "B4"], midiNotes: [60, 64, 67, 71], romanNumeral: "Imaj7" },
          { id: "cp2", name: "Em7", root: "E", quality: "m7", beats: 4, notes: ["B3", "E4", "G4", "B4"], midiNotes: [59, 64, 67, 71], romanNumeral: "iii7" },
          { id: "cp3", name: "Fmaj7", root: "F", quality: "maj7", beats: 4, notes: ["A3", "C4", "F4", "A4"], midiNotes: [57, 60, 65, 69], romanNumeral: "IVmaj7" },
          { id: "cp4", name: "G7", root: "G", quality: "7", beats: 4, notes: ["G3", "B3", "D4", "F4"], midiNotes: [55, 59, 62, 65], romanNumeral: "V7" },
        ],
        type: "progression",
      },
    ],
    listenGuidance:
      "Lắng nghe cách G7 (V7) ở cuối chu kỳ tạo lực căng hòa âm thôi thúc, chuẩn bị mở đường quay lại Cmaj7 (Imaj7) ở đầu vòng lặp tiếp theo.",

    visualizeTitle: "Hành trình Hòa âm 4 bước",
    visualizeCaption:
      "Khởi hành (Tonic / I) → Đi xa (Subdominant / IV) → Căng thẳng (Dominant / V) → Về nhà (Tonic / I).",
    visualizeNotes: [
      { name: "Cmaj7", midi: 60, label: "1. Khởi hành (I)", color: "#8b5cf6" },
      { name: "Em7", midi: 64, label: "2. Phát triển (iii)", color: "#3b82f6" },
      { name: "Fmaj7", midi: 65, label: "3. Mở rộng (IV)", color: "#10b981" },
      { name: "G7", midi: 67, label: "4. Đỉnh điểm (V7)", color: "#f59e0b" },
    ],
    highlightedMidis: [60, 64, 65, 67],

    beginnerExplanation:
      "Công thức vàng để tạo một bài nhạc cuốn hút: 1) Chọn một giọng chủ đạo (như C Trưởng); 2) Bắt đầu từ hợp âm Nhà (I); 3) Thêm một hợp âm màu sắc (như vi hoặc IV); 4) Đưa vào một hợp âm thúc giục (V hoặc V7); 5) Trở về nhà!",
    bulletPoints: [
      "Nguyên lý HEAR → SEE → UNDERSTAND → EXPERIMENT → CREATE (Nghe → Nhìn → Hiểu → Thử → Tạo).",
      "Sử dụng công cụ 'Progression Playground' và 'Bàn Hòa Âm' để xuất tệp MIDI / WAV cho bài hát của bạn.",
      "Thực hành luyện tai thường xuyên tại 'Trung Tâm Luyện Tai' để đôi tai ngày càng nhạy bén.",
    ],
    whyItWorks:
      "Khi bạn hiểu được logic toán học và cảm xúc đằng sau âm nhạc, bạn sẽ không còn sáng tác dựa vào may rủi mà hoàn toàn làm chủ câu chuyện hòa âm của chính mình.",
    theoryDetails:
      "Bạn có thể áp dụng thêm Modulation (Chuyển giọng), Secondary Dominant (Át âm phụ), và Modal Interchange (Vay mượn hợp âm) từ các phân hệ Lab nâng cao của HarmonicX.",

    experimentTitle: "Sân chơi Sáng tác Tự do",
    experimentPrompt:
      "Tự do thêm, xóa, đổi nhịp độ và thử nghiệm các hợp âm theo cảm xúc của riêng bạn.",
    experimentType: "progression_tweak",

    challenge: {
      id: "ch-12",
      question: "Để tạo cảm giác kết thúc viên mãn và trọn vẹn nhất cho một câu nhạc, chúng ta thường giải quyết từ hợp âm nào về hợp âm Chủ âm (I)?",
      audioPrompt: {
        id: "ch12-audio",
        label: "Nghe kết V7 về I (G7 → C)",
        chords: [
          { id: "c1", name: "G7", root: "G", quality: "7", beats: 2, notes: ["G3", "B3", "D4", "F4"], midiNotes: [55, 59, 62, 65] },
          { id: "c2", name: "C", root: "C", quality: "major", beats: 4, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
        ],
        type: "progression",
      },
      options: [
        {
          label: "Từ hợp âm Át âm V (hoặc V7) về Chủ âm I (Kết trọn - Authentic Cadence)",
          isCorrect: true,
          explanation: "Xuất sắc! Chuyển động V → I (hoặc V7 → I) là công thức kết thúc kinh điển và thỏa mãn nhất trong mọi thể loại âm nhạc.",
        },
        {
          label: "Từ hợp âm Giảm vii° đi xa mãi mãi",
          isCorrect: false,
          explanation: "Không giải quyết sẽ khiến câu nhạc bị dang dở lơ lửng.",
        },
      ],
      hint: "Hợp âm nào mang năng lượng át âm mạnh nhất muốn kéo về I?",
    },
  },
];

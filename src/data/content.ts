// All page copy, English and Vietnamese side by side.
// Robot arm copy (arm) is kept for later but the page is hidden: see HIDDEN in i18n.ts.
// Facts: MTR-Q one-pager (/home/tom/Downloads/MTR-Q_OnePager-1.pdf) and the founder profile.
// Never add a number or claim that is not in a source. Unknown → leave it out or mark TODO.
import type { Locale } from './i18n';

type L<T> = Record<Locale, T>;

export const stats: L<{ value: string; label: string }[]> = {
  en: [
    { value: '0.4s', label: 'per part' },
    { value: '<1mm', label: 'accuracy' },
    { value: '>99.5%', label: 'defects caught' },
    { value: 'On-site', label: 'no cloud delay' },
  ],
  vi: [
    { value: '0,4s', label: 'mỗi sản phẩm' },
    { value: '<1mm', label: 'độ chính xác' },
    { value: '>99,5%', label: 'lỗi được phát hiện' },
    { value: 'Tại chỗ', label: 'không phụ thuộc cloud' },
  ],
};

export const steps: L<{ title: string; body: string }[]> = {
  en: [
    { title: 'Line survey', body: 'We look at your product, line speed and current reject process.' },
    { title: 'Install & calibrate', body: 'Trained on your defects, not generic examples.' },
    { title: 'Run alongside your team', body: 'Operators confirm it before it takes over.' },
  ],
  vi: [
    { title: 'Khảo sát dây chuyền', body: 'Chúng tôi xem sản phẩm, tốc độ dây chuyền và quy trình loại bỏ hàng lỗi hiện tại.' },
    { title: 'Lắp đặt & hiệu chỉnh', body: 'Huấn luyện trên chính các lỗi của bạn, không dùng ví dụ chung chung.' },
    { title: 'Chạy song song với đội ngũ', body: 'Nhân viên vận hành xác nhận kết quả trước khi hệ thống chạy độc lập.' },
  ],
};

export const products: L<{ key: 'mtrq' | 'amr' | 'arm'; name: string; summary: string; status?: 'wip' | 'soon'; image: string; alt: string }[]> = {
  en: [
    { key: 'mtrq', name: 'MTR-Q', summary: 'Vision inspection, built into the line you already run.', image: '/images/mtr-q/mtr-q-cell.webp', alt: 'MTR-Q inspection cell with a camera mounted over the conveyor' },
    { key: 'amr', name: 'AMR', summary: 'Autonomous mobile robot for moving material inside your site.', status: 'soon', image: '/images/sensq/sensq-platform.jpg', alt: 'MTRobotix autonomous mobile robot with LiDAR' },
    { key: 'arm', name: 'Robot arm', summary: '6-DOF arm for pick-and-place alongside a conveyor.', status: 'wip', image: '/images/robot-arm/robot-arm-hero.jpg', alt: 'The 6-DOF robot arm' },
  ],
  vi: [
    { key: 'mtrq', name: 'MTR-Q', summary: 'Kiểm tra bằng thị giác máy, lắp ngay trên dây chuyền bạn đang chạy.', image: '/images/mtr-q/mtr-q-cell.webp', alt: 'Trạm kiểm tra MTR-Q với camera gắn phía trên băng tải' },
    { key: 'amr', name: 'AMR', summary: 'Robot di động tự hành vận chuyển vật liệu trong nhà xưởng.', status: 'soon', image: '/images/sensq/sensq-platform.jpg', alt: 'Robot di động tự hành của MTRobotix với cảm biến LiDAR' },
    { key: 'arm', name: 'Cánh tay robot', summary: 'Cánh tay 6 bậc tự do gắp - đặt cạnh băng tải.', status: 'wip', image: '/images/robot-arm/robot-arm-hero.jpg', alt: 'Cánh tay robot 6 bậc tự do' },
  ],
};

export const home = {
  en: {
    title: 'MTRobotix — Vision inspection built into your line',
    description: 'MTRobotix builds MTR-Q, vision inspection that flags defects in real time on the line you already run. HCMC, Vietnam and Toronto, Canada.',
    kicker: 'MTRobotix · Vision inspection',
    h1: 'Vision inspection, built into the line you already run.',
    lead: 'We build vision inspection and robotics for production lines — hardware, models and software, from one team.',
    ctaPrimary: 'See MTR-Q',
    ctaSecondary: 'Contact us',
    heroCaption: 'MTR-Q inspection cell — camera mounted over the conveyor.',
    solutionKicker: 'Our solution',
    solutionTitle: 'MTR-Q checks every unit, right on the line',
    solutionLead: 'A camera over your conveyor watches each part as it passes and flags defects in real time — on every unit, every shift.',
    solutionPoints: [
      'Fits onto the line you already run — no process redesign.',
      'Trained on your defects, not generic examples.',
      'Runs on-site — no cloud delay.',
    ],
    animationLabel: 'Animation of the MTR-Q line: a camera over the conveyor checks each part, marking good parts green and defects red. An optional pusher add-on moves defects into a reject tray.',
    productsKicker: 'Products',
    productsTitle: 'What we build',
    stepsKicker: 'Getting started',
    stepsTitle: 'Three steps to a running line',
    contactTitle: 'Talk to us about your line',
    contactLead: 'Tell us your product and line speed. We reply by email or phone.',
  },
  vi: {
    title: 'MTRobotix — Kiểm tra bằng thị giác máy ngay trên dây chuyền',
    description: 'MTRobotix phát triển MTR-Q, hệ thống kiểm tra bằng thị giác máy phát hiện lỗi theo thời gian thực trên dây chuyền hiện có. TP. HCM, Việt Nam và Toronto, Canada.',
    kicker: 'MTRobotix · Kiểm tra bằng thị giác máy',
    h1: 'Kiểm tra bằng thị giác máy, lắp ngay trên dây chuyền bạn đang chạy.',
    lead: 'Chúng tôi phát triển hệ thống kiểm tra bằng thị giác máy và robot cho dây chuyền sản xuất — phần cứng, mô hình và phần mềm, từ một đội ngũ.',
    ctaPrimary: 'Xem MTR-Q',
    ctaSecondary: 'Liên hệ',
    heroCaption: 'Trạm kiểm tra MTR-Q — camera gắn phía trên băng tải.',
    solutionKicker: 'Giải pháp',
    solutionTitle: 'MTR-Q kiểm tra từng sản phẩm, ngay trên dây chuyền',
    solutionLead: 'Camera gắn phía trên băng tải quan sát từng sản phẩm khi đi qua và báo lỗi theo thời gian thực — trên từng sản phẩm, mọi ca làm việc.',
    solutionPoints: [
      'Lắp vào dây chuyền hiện có — không cần thiết kế lại quy trình.',
      'Huấn luyện trên chính các lỗi của bạn, không dùng ví dụ chung chung.',
      'Chạy tại chỗ — không phụ thuộc cloud.',
    ],
    animationLabel: 'Hình động dây chuyền MTR-Q: camera phía trên băng tải kiểm tra từng sản phẩm, sản phẩm đạt hiện màu xanh, sản phẩm lỗi hiện màu đỏ. Bộ đẩy tùy chọn đưa sản phẩm lỗi vào khay loại.',
    productsKicker: 'Sản phẩm',
    productsTitle: 'Sản phẩm của chúng tôi',
    stepsKicker: 'Bắt đầu',
    stepsTitle: 'Ba bước để dây chuyền đi vào vận hành',
    contactTitle: 'Trao đổi với chúng tôi về dây chuyền của bạn',
    contactLead: 'Cho chúng tôi biết sản phẩm và tốc độ dây chuyền. Chúng tôi phản hồi qua email hoặc điện thoại.',
  },
};

export const mtrq = {
  en: {
    title: 'MTR-Q — Vision inspection for existing lines | MTRobotix',
    description: 'MTR-Q flags defects in real time: 0.4s per part, <1mm accuracy, >99.5% of defects caught, running on-site with no cloud delay.',
    kicker: 'Product',
    h1: 'MTR-Q',
    tagline: 'Vision inspection, built into the line you already run.',
    intro: 'MTR-Q watches your product as it moves and flags problems in real time — the way an experienced inspector would, but on every unit, every shift, without getting tired.',
    heroCaption: 'MTR-Q inspection cell — camera mounted over the conveyor.',
    whyTitle: 'Why it matters',
    why: [
      'Fewer defective units reaching packing or your customer.',
      'The same standard of QC on every shift, every unit.',
      'Your QC team spends time on exceptions, not watching the line.',
      'Fits onto the line you already run — no process redesign.',
    ],
    practiceTitle: 'In practice',
    practiceCaption: 'Real MTR-Q output — every piece graded and sorted as it passes.',
    practiceAlt: 'MTR-Q camera view: pieces on the conveyor outlined green when good and red when defective',
    stepsTitle: 'Getting started',
    ctaTitle: 'See MTR-Q on your product',
    ctaLead: 'Start with a line survey. Tell us your product, line speed and current reject process.',
    cta: 'Contact us',
  },
  vi: {
    title: 'MTR-Q — Kiểm tra bằng thị giác máy cho dây chuyền hiện có | MTRobotix',
    description: 'MTR-Q phát hiện lỗi theo thời gian thực: 0,4 giây mỗi sản phẩm, độ chính xác <1mm, phát hiện >99,5% lỗi, chạy tại chỗ không phụ thuộc cloud.',
    kicker: 'Sản phẩm',
    h1: 'MTR-Q',
    tagline: 'Kiểm tra bằng thị giác máy, lắp ngay trên dây chuyền bạn đang chạy.',
    intro: 'MTR-Q quan sát sản phẩm khi di chuyển và báo lỗi theo thời gian thực — như một kiểm tra viên giàu kinh nghiệm, nhưng trên từng sản phẩm, mọi ca làm việc, không mệt mỏi.',
    heroCaption: 'Trạm kiểm tra MTR-Q — camera gắn phía trên băng tải.',
    whyTitle: 'Lợi ích',
    why: [
      'Ít sản phẩm lỗi đến khâu đóng gói hoặc đến tay khách hàng hơn.',
      'Cùng một tiêu chuẩn kiểm tra chất lượng cho mọi ca, mọi sản phẩm.',
      'Đội QC tập trung xử lý ngoại lệ, không phải ngồi canh dây chuyền.',
      'Lắp vào dây chuyền hiện có — không cần thiết kế lại quy trình.',
    ],
    practiceTitle: 'Thực tế vận hành',
    practiceCaption: 'Kết quả thực tế của MTR-Q — từng sản phẩm được đánh giá và phân loại khi đi qua.',
    practiceAlt: 'Hình ảnh camera MTR-Q: sản phẩm đạt được viền xanh, sản phẩm lỗi được viền đỏ',
    stepsTitle: 'Bắt đầu',
    ctaTitle: 'Xem MTR-Q hoạt động với sản phẩm của bạn',
    ctaLead: 'Bắt đầu bằng một buổi khảo sát dây chuyền. Cho chúng tôi biết sản phẩm, tốc độ dây chuyền và quy trình loại bỏ hàng lỗi hiện tại.',
    cta: 'Liên hệ',
  },
};

// TODO(owner): AMR page is placeholder content. Replace every field below with real copy and specs.
export const amr = {
  en: {
    title: 'AMR — Autonomous mobile robot | MTRobotix',
    description: 'MTRobotix autonomous mobile robot. Details coming soon.',
    kicker: 'Product',
    h1: 'Autonomous mobile robot',
    lead: 'An AMR for moving material inside your site. Full details are coming soon.',
    imageCaption: 'MTRobotix AMR platform.',
    overviewTitle: 'Overview',
    overview: 'Placeholder: describe what the AMR does, where it fits, and who it is for.',
    specsTitle: 'Specifications',
    specs: [
      { label: 'Payload', value: 'TBD' },
      { label: 'Speed', value: 'TBD' },
      { label: 'Runtime', value: 'TBD' },
      { label: 'Navigation', value: 'TBD' },
      { label: 'Charging', value: 'TBD' },
    ],
    ctaTitle: 'Interested in the AMR?',
    ctaLead: 'Tell us what you need to move and where.',
    cta: 'Contact us',
  },
  vi: {
    title: 'AMR — Robot di động tự hành | MTRobotix',
    description: 'Robot di động tự hành của MTRobotix. Thông tin chi tiết sắp có.',
    kicker: 'Sản phẩm',
    h1: 'Robot di động tự hành',
    lead: 'AMR vận chuyển vật liệu trong nhà xưởng. Thông tin chi tiết sắp có.',
    imageCaption: 'Nền tảng AMR của MTRobotix.',
    overviewTitle: 'Tổng quan',
    overview: 'Nội dung tạm: mô tả AMR làm gì, phù hợp ở đâu và dành cho ai.',
    specsTitle: 'Thông số kỹ thuật',
    specs: [
      { label: 'Tải trọng', value: 'Sắp có' },
      { label: 'Tốc độ', value: 'Sắp có' },
      { label: 'Thời gian hoạt động', value: 'Sắp có' },
      { label: 'Điều hướng', value: 'Sắp có' },
      { label: 'Sạc', value: 'Sắp có' },
    ],
    ctaTitle: 'Bạn quan tâm đến AMR?',
    ctaLead: 'Cho chúng tôi biết bạn cần vận chuyển gì và ở đâu.',
    cta: 'Liên hệ',
  },
};

export const arm = {
  en: {
    title: 'Robot arm (in development) | MTRobotix',
    description: 'A 6-DOF robot arm with custom kinematics, being developed into a pick-and-place demo alongside a conveyor.',
    kicker: 'In development',
    h1: 'Robot arm',
    lead: 'A six-axis arm with custom kinematics and optimization-based path planning, now being extended into a pick-and-place demo alongside a small conveyor.',
    note: 'This page tracks an active demo, not a finished product.',
    factsTitle: 'Where it stands',
    facts: [
      { label: 'Degrees of freedom', value: '6' },
      { label: 'Kinematics', value: 'Custom forward and inverse' },
      { label: 'Path planning', value: 'L-BFGS-B constrained optimization' },
      { label: 'Tooling', value: 'Python, ROS, RViz, SolidWorks' },
      { label: 'Current focus', value: 'Pick-and-place alongside a conveyor' },
    ],
    gallery: [
      { src: '/images/robot-arm/robot-arm-cad.png', alt: 'CAD render of the arm and its base' },
      { src: '/images/robot-arm/robot-arm-conveyor.jpg', alt: 'The arm next to a small conveyor, pick-and-place demo in progress' },
    ],
  },
  vi: {
    title: 'Cánh tay robot (đang phát triển) | MTRobotix',
    description: 'Cánh tay robot 6 bậc tự do với động học tự phát triển, đang được mở rộng thành demo gắp - đặt cạnh băng tải.',
    kicker: 'Đang phát triển',
    h1: 'Cánh tay robot',
    lead: 'Cánh tay 6 trục với động học tự phát triển và lập quỹ đạo bằng tối ưu hóa, đang được mở rộng thành demo gắp - đặt cạnh một băng tải nhỏ.',
    note: 'Trang này theo dõi một demo đang thực hiện, chưa phải sản phẩm hoàn chỉnh.',
    factsTitle: 'Tiến độ hiện tại',
    facts: [
      { label: 'Bậc tự do', value: '6' },
      { label: 'Động học', value: 'Thuận và nghịch, tự phát triển' },
      { label: 'Lập quỹ đạo', value: 'Tối ưu hóa có ràng buộc L-BFGS-B' },
      { label: 'Công cụ', value: 'Python, ROS, RViz, SolidWorks' },
      { label: 'Trọng tâm hiện tại', value: 'Gắp - đặt cạnh băng tải' },
    ],
    gallery: [
      { src: '/images/robot-arm/robot-arm-cad.png', alt: 'Bản vẽ CAD của cánh tay và đế' },
      { src: '/images/robot-arm/robot-arm-conveyor.jpg', alt: 'Cánh tay bên cạnh băng tải nhỏ, demo gắp - đặt đang thực hiện' },
    ],
  },
};

// TODO(owner): story is drafted only from facts already on the site (founder background, products).
// Replace with the real founding story: when and why MTRobotix started.
export const about = {
  en: {
    title: 'About | MTRobotix',
    description: 'MTRobotix builds vision inspection and robotics for production lines, from hardware to software. HCMC, Vietnam and Toronto, Canada.',
    kicker: 'About',
    h1: 'We build inspection and robotics for the line you already run.',
    lead: 'MTRobotix designs the hardware, trains the models and writes the software that ties them together — so a system fits your line instead of the other way round.',
    whereTitle: 'Where we are',
    storyTitle: 'Our story',
    story: [
      'MTRobotix comes from hands-on robotics work: computer vision, autonomous mobile robots and automation, built from the hardware up.',
      'Our first product, MTR-Q, brings that work to the production line: vision inspection that fits the line you already run. An autonomous mobile robot is next.',
    ],
    howTitle: 'How we work',
    founderKicker: 'Founder',
    founderName: 'Thong Huynh',
    founderRole: 'Founder, robotics engineer',
    founderBody: 'Robotics engineer working across computer vision, autonomous mobile robots and automation.',
    education: 'B.Eng. Mechatronics Engineering, Ontario Tech University',
    journeyTitle: 'Journey',
    journey: [
      { org: 'ABI Ltd.', role: 'Robotics Software Engineer', period: 'May 2026 – present' },
      { org: 'MARS Lab', role: 'Research Assistant', period: 'May 2025 – May 2026' },
      { org: 'Ontario Tech RoboMaster', role: 'Design Team Lead', period: 'Sep 2024 – present' },
    ],
  },
  vi: {
    title: 'Giới thiệu | MTRobotix',
    description: 'MTRobotix phát triển hệ thống kiểm tra bằng thị giác máy và robot cho dây chuyền sản xuất, từ phần cứng đến phần mềm. TP. HCM, Việt Nam và Toronto, Canada.',
    kicker: 'Giới thiệu',
    h1: 'Chúng tôi xây dựng hệ thống kiểm tra và robot cho dây chuyền bạn đang chạy.',
    lead: 'MTRobotix thiết kế phần cứng, huấn luyện mô hình và viết phần mềm kết nối tất cả — để hệ thống phù hợp với dây chuyền của bạn, không phải ngược lại.',
    whereTitle: 'Văn phòng',
    storyTitle: 'Câu chuyện của chúng tôi',
    story: [
      'MTRobotix bắt nguồn từ công việc thực tế trong lĩnh vực robot: thị giác máy tính, robot di động tự hành và tự động hóa, xây dựng từ phần cứng trở lên.',
      'Sản phẩm đầu tiên, MTR-Q, đưa kinh nghiệm đó vào dây chuyền sản xuất: hệ thống kiểm tra bằng thị giác máy lắp ngay trên dây chuyền bạn đang chạy. Tiếp theo là robot di động tự hành.',
    ],
    howTitle: 'Cách chúng tôi làm việc',
    founderKicker: 'Nhà sáng lập',
    founderName: 'Thong Huynh',
    founderRole: 'Nhà sáng lập, kỹ sư robot',
    founderBody: 'Kỹ sư robot làm việc trong lĩnh vực thị giác máy tính, robot di động tự hành và tự động hóa.',
    education: 'Kỹ sư Cơ điện tử (B.Eng.), Đại học Ontario Tech',
    journeyTitle: 'Hành trình',
    journey: [
      { org: 'ABI Ltd.', role: 'Kỹ sư Phần mềm Robot', period: 'Tháng 5/2026 – nay' },
      { org: 'MARS Lab', role: 'Trợ lý nghiên cứu', period: 'Tháng 5/2025 – Tháng 5/2026' },
      { org: 'Ontario Tech RoboMaster', role: 'Trưởng nhóm thiết kế', period: 'Tháng 9/2024 – nay' },
    ],
  },
};

export const contact = {
  en: {
    title: 'Contact | MTRobotix',
    description: 'Contact MTRobotix by email or phone. Offices in Ho Chi Minh City, Vietnam and Toronto, Canada.',
    kicker: 'Contact',
    h1: 'Contact us',
    lead: 'Tell us about your product and line. We reply by email or phone.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    whereLabel: 'Locations',
    linkedinLabel: 'LinkedIn',
    includeTitle: 'Useful to include',
    include: ['Your product and its defects', 'Line speed', 'Your current reject process'],
    formTitle: 'Send us a message',
    formName: 'Name',
    formCompany: 'Company (optional)',
    formEmail: 'Your email',
    formMessage: 'Message',
    formMessageHint: 'Your product, line speed and current reject process.',
    formSubmit: 'Send message',
    formNote: 'Opens your email app with the message ready to send to',
    formSubject: 'Website enquiry from',
  },
  vi: {
    title: 'Liên hệ | MTRobotix',
    description: 'Liên hệ MTRobotix qua email hoặc điện thoại. Văn phòng tại TP. Hồ Chí Minh, Việt Nam và Toronto, Canada.',
    kicker: 'Liên hệ',
    h1: 'Liên hệ',
    lead: 'Cho chúng tôi biết về sản phẩm và dây chuyền của bạn. Chúng tôi phản hồi qua email hoặc điện thoại.',
    emailLabel: 'Email',
    phoneLabel: 'Điện thoại',
    whereLabel: 'Địa điểm',
    linkedinLabel: 'LinkedIn',
    includeTitle: 'Nên cung cấp',
    include: ['Sản phẩm và các loại lỗi thường gặp', 'Tốc độ dây chuyền', 'Quy trình loại bỏ hàng lỗi hiện tại'],
    formTitle: 'Gửi tin nhắn cho chúng tôi',
    formName: 'Họ tên',
    formCompany: 'Công ty (không bắt buộc)',
    formEmail: 'Email của bạn',
    formMessage: 'Nội dung',
    formMessageHint: 'Sản phẩm, tốc độ dây chuyền và quy trình loại bỏ hàng lỗi hiện tại.',
    formSubmit: 'Gửi tin nhắn',
    formNote: 'Mở ứng dụng email của bạn với nội dung sẵn sàng gửi đến',
    formSubject: 'Liên hệ từ website:',
  },
};

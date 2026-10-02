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
    { key: 'amr', name: 'MTR-M', summary: 'Autonomous mobile robot for moving material inside your site.', status: 'soon', image: '/images/amr/amr-render.webp', alt: 'Render of MTR-M, the MTRobotix autonomous mobile robot: light grey body, navy load deck with the MTR logo, lidar on top, drive wheels in the sides' },
    { key: 'arm', name: 'Robot arm', summary: '6-DOF arm for pick-and-place alongside a conveyor.', status: 'wip', image: '/images/robot-arm/robot-arm-hero.jpg', alt: 'The 6-DOF robot arm' },
  ],
  vi: [
    { key: 'mtrq', name: 'MTR-Q', summary: 'Kiểm tra bằng thị giác máy, lắp ngay trên dây chuyền bạn đang chạy.', image: '/images/mtr-q/mtr-q-cell.webp', alt: 'Trạm kiểm tra MTR-Q với camera gắn phía trên băng tải' },
    { key: 'amr', name: 'MTR-M', summary: 'Robot di động tự hành vận chuyển vật liệu trong nhà xưởng.', status: 'soon', image: '/images/amr/amr-render.webp', alt: 'Hình dựng 3D MTR-M, robot di động tự hành của MTRobotix: thân xám nhạt, mặt chở hàng xanh navy có logo MTR, LiDAR phía trên, bánh xe hai bên' },
    { key: 'arm', name: 'Cánh tay robot', summary: 'Cánh tay 6 bậc tự do gắp - đặt cạnh băng tải.', status: 'wip', image: '/images/robot-arm/robot-arm-hero.jpg', alt: 'Cánh tay robot 6 bậc tự do' },
  ],
};

export const home = {
  en: {
    title: 'MTRobotix — Vision inspection built into your line',
    description: 'MTRobotix builds MTR-Q, vision inspection that flags defects in real time on the line you already run. HCMC, Vietnam and Toronto, Canada.',
    h1: 'Introducing MTR-Q',
    lead: 'Vision inspection, live on your line in hours. The fastest deployment you’ll see.',
    ctaPrimary: 'See MTR-Q',
    ctaSecondary: 'Contact us',
    cellAlt: 'MTR-Q inspection cell — camera mounted over the conveyor.',
    solutionKicker: 'Our solution',
    solutionTitle: 'MTR-Q checks every unit, right on the line',
    solutionPoints: ['Fits your line with 0 downtime.', 'Real-time inspection.', 'Anomaly and <1mm defect detection.', 'Deploys in hours.'],
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
    h1: 'Giới thiệu MTR-Q',
    lead: 'Kiểm tra bằng thị giác máy, chạy trên dây chuyền của bạn chỉ sau vài giờ. Triển khai nhanh nhất bạn từng thấy.',
    ctaPrimary: 'Xem MTR-Q',
    ctaSecondary: 'Liên hệ',
    cellAlt: 'Trạm kiểm tra MTR-Q — camera gắn phía trên băng tải.',
    solutionKicker: 'Giải pháp',
    solutionTitle: 'MTR-Q kiểm tra từng sản phẩm, ngay trên dây chuyền',
    solutionPoints: [
      'Lắp vào dây chuyền của bạn với 0 thời gian dừng máy.',
      'Kiểm tra theo thời gian thực.',
      'Phát hiện bất thường và lỗi nhỏ hơn 1 mm.',
      'Triển khai trong vài giờ.',
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
    title: 'MTR-M — Autonomous mobile robot | MTRobotix',
    description: 'MTR-M, the MTRobotix autonomous mobile robot: point-to-point navigation, automatic mapping, replanning around obstacles, several robots on one map. 200 kg payload.',
    kicker: 'Product',
    h1: 'MTR-M',
    tagline: 'Autonomous mobile robot.',
    lead: 'Moves material between points in your site on its own.',
    imageAlt: 'Render of MTR-M: light grey body, navy load deck with the MTR logo, lidar on top, drive wheels in the sides',
    imageCaption: 'MTR-M (render).',
    overviewTitle: 'Overview',
    overview: 'MTR-M maps your floor as it drives, plans a route to each point and replans when something blocks the way. Several robots share one map.',
    features: ['Point-to-point navigation', 'Automatic mapping', 'Replans around obstacles', 'Several robots on one map'],
    specsTitle: 'Specifications',
    specs: [
      { label: 'Payload', value: '200 kg' },
      { label: 'Speed', value: 'TBD' },
      { label: 'Runtime', value: 'TBD' },
      { label: 'Navigation', value: 'TBD' },
      { label: 'Charging', value: 'TBD' },
    ],
    routeTitle: 'From A to B, around obstacles',
    routeLabel:
      'Top view of a warehouse: MTR-M drives from station A to station B along its planned path. A pallet drops into the aisle; the lidar marks it red and the robot takes an adjusted path around it without stopping.',
    routeCaption: 'Planned path in blue. When a pallet blocks the aisle, the robot replans and keeps moving.',
    ctaTitle: 'Interested in MTR-M?',
    ctaLead: 'Tell us what you need to move and where.',
    cta: 'Contact us',
  },
  vi: {
    title: 'MTR-M — Robot di động tự hành | MTRobotix',
    description: 'MTR-M, robot di động tự hành của MTRobotix: điều hướng điểm - điểm, tự động lập bản đồ, tự lập lại lộ trình khi gặp vật cản, nhiều robot trên một bản đồ. Tải trọng 200 kg.',
    kicker: 'Sản phẩm',
    h1: 'MTR-M',
    tagline: 'Robot di động tự hành.',
    lead: 'Tự vận chuyển vật liệu giữa các điểm trong nhà xưởng của bạn.',
    imageAlt: 'Hình dựng 3D MTR-M: thân xám nhạt, mặt chở hàng xanh navy có logo MTR, LiDAR phía trên, bánh xe hai bên',
    imageCaption: 'MTR-M (hình dựng 3D).',
    overviewTitle: 'Tổng quan',
    overview: 'MTR-M tự lập bản đồ nhà xưởng khi di chuyển, lên lộ trình đến từng điểm và lập lại lộ trình khi có vật cản. Nhiều robot dùng chung một bản đồ.',
    features: ['Điều hướng điểm - điểm', 'Tự động lập bản đồ', 'Tự lập lại lộ trình khi gặp vật cản', 'Nhiều robot trên cùng một bản đồ'],
    specsTitle: 'Thông số kỹ thuật',
    specs: [
      { label: 'Tải trọng', value: '200 kg' },
      { label: 'Tốc độ', value: 'Sắp có' },
      { label: 'Thời gian hoạt động', value: 'Sắp có' },
      { label: 'Điều hướng', value: 'Sắp có' },
      { label: 'Sạc', value: 'Sắp có' },
    ],
    routeTitle: 'Từ A đến B, vượt qua vật cản',
    routeLabel:
      'Nhìn từ trên xuống nhà kho: MTR-M di chuyển từ trạm A đến trạm B theo lộ trình dự kiến. Một pallet rơi vào lối đi; LiDAR đánh dấu màu đỏ và robot đi vòng qua theo lộ trình mới mà không dừng lại.',
    routeCaption: 'Lộ trình dự kiến màu xanh. Khi pallet chặn lối đi, robot lập lại lộ trình và tiếp tục di chuyển.',
    ctaTitle: 'Bạn quan tâm đến MTR-M?',
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

// Philosophy and story milestones: from the owner (Oct 2026). Milestones have no dates yet; add them when known.
export const about = {
  en: {
    title: 'About | MTRobotix',
    description: 'MTRobotix builds vision inspection and robotics for production lines, from hardware to software. HCMC, Vietnam and Toronto, Canada.',
    kicker: 'Philosophy',
    h1: 'Bring technology closer to customers.',
    lead: 'MTR was established with one simple goal: excellent-quality products at an affordable price.',
    whereTitle: 'Where we are',
    storyTitle: 'Our story',
    // Newest first: the line reads down from what is next to where it started.
    milestones: [
      { label: 'Next', title: 'MTR-M', body: 'Autonomous mobile robot.', link: 'amr' as const, next: true },
      {
        label: 'First product',
        title: 'MTR-Q',
        body: 'Our first prototype: a state-of-the-art computer vision system.',
        photo: { src: '/images/about/mtr-q-prototype.webp', alt: 'The first MTR-Q prototype: a conveyor with the camera bracket over the belt' },
      },
      {
        label: 'Start',
        title: 'The team',
        body: 'MT Robotics & Automation comes from a team of excellent engineers with hands-on experience in industrial robotics and AI systems.',
      },
    ],
    howTitle: 'How we work',
    founderKicker: 'Founder',
    founderName: 'Thong Huynh',
    founderPhotoAlt: 'Thong Huynh, founder of MTRobotix',
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
    kicker: 'Triết lý',
    h1: 'Đưa công nghệ đến gần hơn với khách hàng.',
    lead: 'MTR được thành lập với một mục tiêu đơn giản: sản phẩm chất lượng xuất sắc với giá thành hợp lý.',
    whereTitle: 'Văn phòng',
    storyTitle: 'Câu chuyện của chúng tôi',
    milestones: [
      { label: 'Tiếp theo', title: 'MTR-M', body: 'Robot di động tự hành.', link: 'amr' as const, next: true },
      {
        label: 'Sản phẩm đầu tiên',
        title: 'MTR-Q',
        body: 'Nguyên mẫu đầu tiên của chúng tôi: hệ thống thị giác máy tính hiện đại.',
        photo: { src: '/images/about/mtr-q-prototype.webp', alt: 'Nguyên mẫu MTR-Q đầu tiên: băng tải với giá đỡ camera phía trên' },
      },
      {
        label: 'Khởi đầu',
        title: 'Đội ngũ',
        body: 'MT Robotics & Automation bắt nguồn từ một đội ngũ kỹ sư xuất sắc với kinh nghiệm thực tế về robot công nghiệp và hệ thống AI.',
      },
    ],
    howTitle: 'Cách chúng tôi làm việc',
    founderKicker: 'Nhà sáng lập',
    founderName: 'Thong Huynh',
    founderPhotoAlt: 'Thong Huynh, nhà sáng lập MTRobotix',
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

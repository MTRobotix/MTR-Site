export const homeContent = {
  title: '2D and 3D vision inspection at line speed.',
  intro: 'MTRobotics designs synchronized 2D and 3D vision inspection cells with <1 mm measurement tolerance. We grade and divert defects in under 0.4 seconds, with autonomous mobile robot fleets and controls integration downstream.',
  schematicTitle: 'From 2D/3D inspection to downstream dispatch',
  schematic: [
    {
      num: '01',
      title: 'Inspect',
      body: 'Synchronized 2D imaging and 3D depth measurement grade every part to <1 mm tolerance in 0.4 s. Defect classes come from your reject bin.',
      specs: ['Combined 2D and 3D measurement', '<1 mm dimensional tolerance', 'Edge inference, zero cloud latency'],
    },
    {
      num: '02',
      title: 'Move',
      body: 'Graded parts route downstream automatically. Rejects divert before assembly while AMR fleets transport verified stock.',
      specs: ['1,500 kg payload class', '±8 mm docking accuracy', 'Mixed fleet, one dispatcher'],
    },
    {
      num: '03',
      title: 'Integrate',
      body: 'We write the PLC, MES and WMS glue to link the vision cell and mobile fleet directly into your line.',
      specs: ['OPC-UA, REST, discrete dry contact', 'Site acceptance test included', '11-day mean handover'],
    },
  ],
  proof: 'Deployed across 27 lines in automotive, food and 3PL logistics.',
  clientMarks: ['[ Client mark ]', '[ Client mark ]', '[ Client mark ]', '[ Client mark ]'],
  solutionsTitle: 'Start with the constraint on your floor',
  solutionsIntro: 'From high-precision vision inspection cells to downstream AMR dispatch and controls integration. Choose the measured constraint; the survey defines the hardware and handover boundary.',
  solutionLinks: [
    { slug: 'inspection', num: '01', title: 'Inspect', body: 'Grade parts with 2D and 3D measurement to <1 mm tolerance, diverting defects before assembly.' },
    { slug: 'amr-fleet', num: '02', title: 'Move', body: 'Route mixed mobile robots downstream through the floor plan already in use.' },
    { slug: 'retrofit', num: '03', title: 'Phase', body: 'Commission inspection cells and robot zones around the production calendar.' },
  ],
  processTitle: 'From line survey to handover',
  process: [
    { num: '01', title: 'Measure', body: 'Record part geometry, dimensional tolerances (<1 mm), cycle times and the current reject path.' },
    { num: '02', title: 'Define', body: 'Set 2D/3D sensor envelope, acceptance criteria, cell boundary and installation phases.' },
    { num: '03', title: 'Commission', body: 'Calibrate optics, test with line operators and hand over the as-built controls package.' },
  ],
} as const;

export const homeContentVi = {
  title: 'Kiểm tra thị giác 2D và 3D ở tốc độ dây chuyền.',
  intro: 'MTRobotics thiết kế trạm thị giác đồng bộ 2D và 3D với dung sai đo dưới 1 mm. Chúng tôi phân loại và chuyển hướng lỗi trong 0,4 giây, kết hợp đội robot di động và tích hợp điều khiển ở hạ nguồn.',
  schematicTitle: 'Từ trạm kiểm tra 2D/3D đến điều phối hạ nguồn',
  schematic: [
    { num: '01', title: 'Kiểm tra', body: 'Hình ảnh 2D và đo độ sâu 3D đồng bộ phân loại từng chi tiết với dung sai <1 mm trong 0,4 giây. Nhóm lỗi được xây dựng từ thùng sản phẩm loại của bạn.', specs: ['Đo lường kết hợp 2D và 3D', 'Dung sai kích thước <1 mm', 'Suy luận biên, không độ trễ đám mây'] },
    { num: '02', title: 'Vận chuyển', body: 'Chi tiết đã phân loại được định tuyến tự động. Sản phẩm lỗi chuyển hướng trước lắp ráp trong khi đội AMR vận chuyển hàng đạt chuẩn.', specs: ['Nhóm tải trọng 1.500 kg', 'Độ chính xác cập bến ±8 mm', 'Đội xe hỗn hợp, một bộ điều phối'] },
    { num: '03', title: 'Tích hợp', body: 'Chúng tôi viết phần kết nối PLC, MES và WMS để liên kết trạm thị giác và đội xe trực tiếp vào dây chuyền.', specs: ['OPC-UA, REST, tiếp điểm khô', 'Bao gồm kiểm thử nghiệm thu tại hiện trường', 'Thời gian bàn giao trung bình 11 ngày'] },
  ],
  proof: 'Đã triển khai trên 27 dây chuyền trong ngành ô tô, thực phẩm và logistics 3PL.',
  clientMarks: ['[ Logo khách hàng ]', '[ Logo khách hàng ]', '[ Logo khách hàng ]', '[ Logo khách hàng ]'],
  solutionsTitle: 'Bắt đầu từ điểm nghẽn trên nhà máy',
  solutionsIntro: 'Từ trạm kiểm tra thị giác độ chính xác cao đến điều phối robot AMR hạ nguồn và tích hợp điều khiển. Chọn điểm nghẽn đã đo; khảo sát sẽ xác định phần cứng và ranh giới bàn giao.',
  solutionLinks: [
    { slug: 'inspection', num: '01', title: 'Kiểm tra', body: 'Đo 2D và 3D với dung sai <1 mm, phân loại chi tiết trong 0,4 giây và chuyển hướng lỗi.' },
    { slug: 'amr-fleet', num: '02', title: 'Vận chuyển', body: 'Điều phối robot di động ở hạ nguồn trên mặt bằng nhà xưởng đang sử dụng.' },
    { slug: 'retrofit', num: '03', title: 'Phân kỳ', body: 'Nghiệm thu trạm thị giác và khu vực robot theo lịch sản xuất.' },
  ],
  processTitle: 'Từ khảo sát dây chuyền đến bàn giao',
  process: [
    { num: '01', title: 'Đo lường', body: 'Ghi nhận hình học chi tiết, dung sai kích thước (<1 mm), chu kỳ và tuyến loại lỗi hiện tại.' },
    { num: '02', title: 'Xác định', body: 'Xác định vị trí cảm biến 2D/3D, tiêu chí nghiệm thu, ranh giới trạm và các giai đoạn lắp đặt.' },
    { num: '03', title: 'Nghiệm thu', body: 'Hiệu chuẩn quang học, kiểm thử cùng vận hành viên và bàn giao bộ điều khiển hoàn công.' },
  ],
} as const;

export const aboutContent = {
  kicker: 'About MTRobotics',
  title: 'Forty-one engineers who would rather be on your floor than in ours.',
  intro: 'We started in 2019 doing vision retrofits nobody else would quote. The robots came later, because customers kept asking who would move the parts we had just graded. Today we do both, and we still write the integration ourselves.',
  register: [
    { value: '2019', label: 'Founded, Rotterdam' },
    { value: '41', label: 'Engineers of 52 staff' },
    { value: '27', label: 'Lines commissioned' },
    { value: '3', label: 'Service hubs' },
  ],
  leaders: [
    { name: 'M. Terlouw', role: 'Founder · Managing director', enabled: true },
    { name: 'A. Kaur', role: 'Head of perception', enabled: false },
    { name: 'J. Brandt', role: 'Head of controls & integration', enabled: false },
    { name: 'S. Okonkwo', role: 'Commercial director', enabled: false },
  ],
  milestones: [
    { year: '2019', note: 'First vision retrofit, two cameras, one line.' },
    { year: '2021', note: 'Edge inference in-house; cloud dependency dropped.' },
    { year: '2023', note: 'First AMR fleet, 34 units, automotive tier 1.' },
    { year: '2025', note: 'Stuttgart and Monterrey hubs open. Series A closed.' },
    { year: '2026', note: '412 units in service across 27 lines.' },
  ],
} as const;

export const aboutContentVi = {
  kicker: 'Về MTRobotics',
  title: 'Bốn mươi mốt kỹ sư ưu tiên làm việc tại nhà máy của bạn.',
  intro: 'Chúng tôi bắt đầu năm 2019 với các dự án nâng cấp thị giác máy mà những đơn vị khác không nhận báo giá. Robot xuất hiện sau đó, khi khách hàng liên tục hỏi ai sẽ vận chuyển những chi tiết vừa được phân loại. Hiện nay chúng tôi thực hiện cả hai và vẫn trực tiếp viết phần tích hợp.',
  register: [
    { value: '2019', label: 'Thành lập tại Rotterdam' },
    { value: '41', label: 'Kỹ sư trong tổng số 52 nhân sự' },
    { value: '27', label: 'Dây chuyền đã nghiệm thu' },
    { value: '3', label: 'Trung tâm dịch vụ' },
  ],
  leaders: [
    { name: 'M. Terlouw', role: 'Nhà sáng lập · Giám đốc điều hành', enabled: true },
    { name: 'A. Kaur', role: 'Trưởng bộ phận nhận thức máy', enabled: false },
    { name: 'J. Brandt', role: 'Trưởng bộ phận điều khiển và tích hợp', enabled: false },
    { name: 'S. Okonkwo', role: 'Giám đốc thương mại', enabled: false },
  ],
  milestones: [
    { year: '2019', note: 'Dự án nâng cấp thị giác đầu tiên: hai camera, một dây chuyền.' },
    { year: '2021', note: 'Tự phát triển suy luận biên; loại bỏ phụ thuộc đám mây.' },
    { year: '2023', note: 'Đội AMR đầu tiên gồm 34 xe cho nhà cung cấp ô tô cấp 1.' },
    { year: '2025', note: 'Mở trung tâm Stuttgart và Monterrey. Hoàn tất vòng Series A.' },
    { year: '2026', note: '412 thiết bị hoạt động trên 27 dây chuyền.' },
  ],
} as const;

export const demoContent = {
  kicker: 'Request a demo',
  title: 'Bring us a line and a problem.',
  intro: 'A survey engineer answers within one working day. No slide deck — we ask for cycle times, layout and your current reject rate.',
  steps: [
    { num: '01', title: 'Call, one working day', body: 'Thirty minutes with a survey engineer, not a salesperson.' },
    { num: '02', title: 'Site survey, half a day', body: 'We walk the line, measure aisles, sample your reject bin.' },
    { num: '03', title: 'Quote with numbers', body: 'Expected recall, cycle impact, phase plan and price. No options matrix.' },
  ],
} as const;

export const demoContentVi = {
  kicker: 'Yêu cầu demo',
  title: 'Cho chúng tôi biết dây chuyền và vấn đề.',
  intro: 'Kỹ sư khảo sát phản hồi trong một ngày làm việc. Không trình bày slide — chúng tôi hỏi về chu kỳ, mặt bằng và tỷ lệ loại lỗi hiện tại.',
  steps: [
    { num: '01', title: 'Trao đổi trong một ngày làm việc', body: 'Ba mươi phút với kỹ sư khảo sát, không phải nhân viên bán hàng.' },
    { num: '02', title: 'Khảo sát hiện trường trong nửa ngày', body: 'Chúng tôi đi dọc dây chuyền, đo lối đi và lấy mẫu thùng sản phẩm loại.' },
    { num: '03', title: 'Báo giá có số liệu', body: 'Độ bao phủ lỗi dự kiến, ảnh hưởng chu kỳ, kế hoạch giai đoạn và chi phí.' },
  ],
} as const;

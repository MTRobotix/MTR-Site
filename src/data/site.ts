export const homeContent = {
  title: 'The line you have, running the way you specced it.',
  intro: 'MTRobotics designs the inspection cell, builds the robot fleet, and writes the integration itself. One accountable vendor between your reject rate and your throughput target.',
  schematicTitle: 'How the three lines connect',
  schematic: [
    {
      num: '01',
      title: 'Inspect',
      body: 'On-device models grade every part in 0.4 s. Defect classes come from your reject bin.',
      specs: ['6-camera cell, GigE', 'Edge inference, no cloud round-trip', 'Retrain on shift boundaries'],
    },
    {
      num: '02',
      title: 'Move',
      body: 'Graded parts route themselves. Rejects divert before they reach assembly.',
      specs: ['1,500 kg payload class', '±8 mm docking accuracy', 'Mixed fleet, one dispatcher'],
    },
    {
      num: '03',
      title: 'Integrate',
      body: 'We write the PLC, MES and WMS glue and hand over a commissioned cell.',
      specs: ['OPC-UA, REST, flat file', 'Site acceptance test included', '11-day mean handover'],
    },
  ],
  proof: 'Deployed across 27 lines in automotive, food and 3PL logistics.',
  clientMarks: ['[ Client mark ]', '[ Client mark ]', '[ Client mark ]', '[ Client mark ]'],
  solutionsTitle: 'Start with the constraint on your floor',
  solutionsIntro: 'Each scope begins with the line as it runs today. Choose the measured constraint; the survey defines the hardware, controls and handover boundary.',
  solutionLinks: [
    { slug: 'inspection', num: '01', title: 'Inspect', body: 'Grade parts at line speed and divert rejects before assembly.' },
    { slug: 'amr-fleet', num: '02', title: 'Move', body: 'Route mixed mobile robots through the floor plan already in use.' },
    { slug: 'integration', num: '03', title: 'Connect', body: 'Join the cell to PLC, MES and WMS interfaces and test the handover.' },
    { slug: 'retrofit', num: '04', title: 'Phase', body: 'Commission zone by zone around the production calendar.' },
  ],
  processTitle: 'From line survey to handover',
  process: [
    { num: '01', title: 'Measure', body: 'Record cycle time, aisle geometry, interfaces and the current reject path.' },
    { num: '02', title: 'Define', body: 'Set the cell boundary, acceptance test and installation phases.' },
    { num: '03', title: 'Commission', body: 'Install, test with operators and hand over the as-built controls package.' },
  ],
} as const;

export const homeContentVi = {
  title: 'Dây chuyền hiện có, vận hành đúng theo thông số của bạn.',
  intro: 'MTRobotics thiết kế trạm kiểm tra, xây dựng đội robot và trực tiếp viết phần tích hợp. Một đơn vị chịu trách nhiệm từ tỷ lệ loại lỗi đến mục tiêu sản lượng.',
  schematicTitle: 'Ba tuyến kết nối như thế nào',
  schematic: [
    { num: '01', title: 'Kiểm tra', body: 'Mô hình tại thiết bị phân loại từng chi tiết trong 0,4 giây. Nhóm lỗi được xây dựng từ thùng sản phẩm loại của bạn.', specs: ['Trạm 6 camera, GigE', 'Suy luận biên, không truyền vòng qua đám mây', 'Huấn luyện lại tại thời điểm đổi ca'] },
    { num: '02', title: 'Vận chuyển', body: 'Chi tiết đã phân loại được định tuyến tự động. Sản phẩm lỗi được chuyển hướng trước công đoạn lắp ráp.', specs: ['Nhóm tải trọng 1.500 kg', 'Độ chính xác cập bến ±8 mm', 'Đội xe hỗn hợp, một bộ điều phối'] },
    { num: '03', title: 'Tích hợp', body: 'Chúng tôi viết phần kết nối PLC, MES và WMS, sau đó bàn giao một trạm đã nghiệm thu.', specs: ['OPC-UA, REST, tệp phẳng', 'Bao gồm kiểm thử nghiệm thu tại hiện trường', 'Thời gian bàn giao trung bình 11 ngày'] },
  ],
  proof: 'Đã triển khai trên 27 dây chuyền trong ngành ô tô, thực phẩm và logistics 3PL.',
  clientMarks: ['[ Logo khách hàng ]', '[ Logo khách hàng ]', '[ Logo khách hàng ]', '[ Logo khách hàng ]'],
  solutionsTitle: 'Bắt đầu từ điểm nghẽn trên nhà máy',
  solutionsIntro: 'Mỗi phạm vi bắt đầu từ cách dây chuyền đang vận hành. Chọn điểm nghẽn đã đo; khảo sát sẽ xác định phần cứng, điều khiển và ranh giới bàn giao.',
  solutionLinks: [
    { slug: 'inspection', num: '01', title: 'Kiểm tra', body: 'Phân loại ở tốc độ dây chuyền và chuyển hướng sản phẩm lỗi trước lắp ráp.' },
    { slug: 'amr-fleet', num: '02', title: 'Vận chuyển', body: 'Điều phối nhiều loại robot di động trên mặt bằng đang sử dụng.' },
    { slug: 'integration', num: '03', title: 'Kết nối', body: 'Nối trạm với PLC, MES và WMS, sau đó kiểm thử bàn giao.' },
    { slug: 'retrofit', num: '04', title: 'Phân kỳ', body: 'Nghiệm thu từng khu vực theo lịch sản xuất.' },
  ],
  processTitle: 'Từ khảo sát dây chuyền đến bàn giao',
  process: [
    { num: '01', title: 'Đo lường', body: 'Ghi nhận chu kỳ, hình học lối đi, giao diện và tuyến loại lỗi hiện tại.' },
    { num: '02', title: 'Xác định', body: 'Chốt ranh giới trạm, bài kiểm thử nghiệm thu và các giai đoạn lắp đặt.' },
    { num: '03', title: 'Nghiệm thu', body: 'Lắp đặt, kiểm thử cùng vận hành viên và bàn giao bộ điều khiển hoàn công.' },
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

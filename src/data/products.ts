export interface Product {
  slug: 'inspection' | 'amr-fleet' | 'integration' | 'retrofit';
  num: '01' | '02' | '03' | '04';
  nav: string;
  kicker: string;
  title: string;
  blurb: string;
  video: {
    src: string;
    poster: string;
    caption: string;
    duration: string;
    durationSeconds: number;
    note: string;
    placeholder: string;
    assetReady: boolean;
  };
  specs: { label: string; value: string; unit: string }[];
  rows: { key: string; value: string }[];
  figure: string;
}

export const products: Product[] = [
  {
    slug: 'inspection',
    num: '01',
    nav: 'Vision inspection cells',
    kicker: 'Product 01 — Vision inspection cells',
    title: 'Grade every part in 0.4 seconds.',
    blurb: 'Six-camera cell with on-device inference, defect classes trained on your reject bin, retrained at shift boundaries without stopping the line.',
    video: {
      src: '/videos/inspection-loop.mp4',
      poster: '/videos/inspection-poster.jpg',
      caption: '[ In-action video — cell grading parts at line speed, overhead ]',
      duration: '00:24',
      durationSeconds: 24,
      note: 'Loop · muted · defect HUD drawn in page',
      placeholder: '[ Full-bleed in-action video, 1920×1080 — client asset pending ]',
      assetReady: false,
    },
    specs: [
      { label: 'Defect recall', value: '99.2', unit: '%' },
      { label: 'Added cycle time', value: '0.4', unit: 's' },
      { label: 'Cameras per cell', value: '6', unit: 'GigE' },
    ],
    rows: [
      { key: 'Inference', value: 'On-device 8 TOPS edge module, no cloud round-trip' },
      { key: 'Retraining', value: 'Shift-boundary, operator-labelled reject bin' },
      { key: 'Interface', value: 'OPC-UA, REST, dry-contact reject divert' },
      { key: 'Enclosure', value: 'IP65, IEC 61496 light-curtain compatible' },
    ],
    figure: '[ Product shot — six-camera cell over a moving conveyor ]',
  },
  {
    slug: 'amr-fleet',
    num: '02',
    nav: 'AMR fleet & dispatcher',
    kicker: 'Product 02 — AMR fleet & dispatcher',
    title: 'Material moves itself. The floor plan stays.',
    blurb: 'No rails, no beacons, no anchors in the slab. Tuggers, forks and shuttles draw from one dispatcher and re-plan in under 200 ms when the aisle changes.',
    video: {
      src: '/videos/amr-fleet-loop.mp4',
      poster: '/videos/amr-fleet-poster.jpg',
      caption: '[ In-action video — tugger docking to a pallet stand, tracking shot ]',
      duration: '00:31',
      durationSeconds: 31,
      note: 'Loop · muted · route overlay drawn in page',
      placeholder: '[ In-action video, 1920×1080 — client asset pending ]',
      assetReady: false,
    },
    specs: [
      { label: 'Payload class', value: '1,500', unit: 'kg' },
      { label: 'Docking accuracy', value: '±8', unit: 'mm' },
      { label: 'Fleet uptime 90d', value: '99.4', unit: '%' },
    ],
    rows: [
      { key: 'Localisation', value: 'Solid-state lidar + stereo depth, map-free' },
      { key: 'Re-plan latency', value: 'Under 200 ms on aisle change' },
      { key: 'Fleet size', value: '4 to 400 units, mixed classes' },
      { key: 'WMS link', value: 'REST, AMQP or nightly flat file' },
    ],
    figure: '[ Product shot — tugger crossing a dock lane, low angle ]',
  },
  {
    slug: 'integration',
    num: '03',
    nav: 'Custom integration',
    kicker: 'Product 03 — Custom integration',
    title: 'We own the last mile of the install.',
    blurb: 'Our engineers write the PLC, MES and WMS glue and stay on site until the acceptance test passes. You take delivery of a commissioned cell, not a crate and a manual.',
    video: {
      src: '/videos/integration-loop.mp4',
      poster: '/videos/integration-poster.jpg',
      caption: '[ In-action video — engineer wiring the cell into the PLC cabinet ]',
      duration: '00:18',
      durationSeconds: 18,
      note: 'Loop · muted · signal pulse drawn in page',
      placeholder: '[ Three in-action video strips, 1920×1080 — client assets pending ]',
      assetReady: false,
    },
    specs: [
      { label: 'Survey to handover', value: '11', unit: 'days' },
      { label: 'Lines commissioned', value: '27', unit: '' },
      { label: 'Acceptance pass 1st run', value: '94', unit: '%' },
    ],
    rows: [
      { key: 'Protocols', value: 'OPC-UA, Modbus TCP, Profinet, REST' },
      { key: 'Deliverables', value: 'I/O schedule, FAT + SAT reports, as-built drawings' },
      { key: 'Team on site', value: 'Two controls engineers, one vision engineer' },
      { key: 'Handover', value: 'Operator training, 30-day hypercare' },
    ],
    figure: '[ Diagram — signal path from cell to PLC to MES ]',
  },
  {
    slug: 'retrofit',
    num: '04',
    nav: 'Retrofit & commissioning',
    kicker: 'Product 04 — Retrofit & commissioning',
    title: 'Autonomy into a plant that never stops.',
    blurb: 'Phased commissioning around your production calendar. Cells go in between shifts and the fleet grows one zone at a time — no downtime window to negotiate.',
    video: {
      src: '/videos/retrofit-loop.mp4',
      poster: '/videos/retrofit-poster.jpg',
      caption: '[ In-action video — night-shift commissioning, time-lapse ]',
      duration: '00:42',
      durationSeconds: 42,
      note: 'Loop · muted · duotone field drawn in page',
      placeholder: '[ Time-lapse in-action video, 1920×1080 — client asset pending ]',
      assetReady: false,
    },
    specs: [
      { label: 'Production downtime', value: '0', unit: 'hrs' },
      { label: 'Zones per phase', value: '1–3', unit: '' },
      { label: 'Mean phase length', value: '9', unit: 'days' },
    ],
    rows: [
      { key: 'Phase 1 — Survey', value: 'Network audit, floor-plan mapping, risk register' },
      { key: 'Phase 2 — Install', value: 'Between shifts, zone-by-zone, no line stoppage' },
      { key: 'Phase 3 — Fleet ramp', value: 'Incremental unit commissioning, dispatcher tuning' },
      { key: 'Phase 4 — Handover', value: 'SAT, operator training, 30-day hypercare' },
    ],
    figure: '[ Photo — night-shift commissioning, duotone ]',
  },
];

const viProductCopy: Record<Product['slug'], Pick<Product, 'kicker' | 'title' | 'blurb' | 'specs' | 'rows' | 'figure'> & { video: Pick<Product['video'], 'caption' | 'note' | 'placeholder'> }> = {
  inspection: {
    kicker: 'Sản phẩm 01 — Trạm kiểm tra thị giác',
    title: 'Phân loại từng chi tiết trong 0,4 giây.',
    blurb: 'Trạm sáu camera với suy luận tại thiết bị, nhóm lỗi được huấn luyện từ thùng sản phẩm loại và cập nhật khi đổi ca mà không dừng dây chuyền.',
    video: { caption: '[ Video vận hành — trạm phân loại chi tiết ở tốc độ dây chuyền, góc nhìn trên cao ]', note: 'Lặp · tắt tiếng · HUD lỗi vẽ trên trang', placeholder: '[ Video vận hành toàn khung, 1920×1080 — đang chờ tài sản khách hàng ]' },
    specs: [
      { label: 'Độ bao phủ lỗi', value: '99.2', unit: '%' },
      { label: 'Chu kỳ tăng thêm', value: '0.4', unit: 's' },
      { label: 'Camera mỗi trạm', value: '6', unit: 'GigE' },
    ],
    rows: [
      { key: 'Suy luận', value: 'Mô-đun biên 8 TOPS tại thiết bị, không truyền vòng qua đám mây' },
      { key: 'Huấn luyện lại', value: 'Tại thời điểm đổi ca, dùng thùng sản phẩm loại do vận hành viên gán nhãn' },
      { key: 'Giao diện', value: 'OPC-UA, REST, ngõ ra chuyển hướng tiếp điểm khô' },
      { key: 'Vỏ bảo vệ', value: 'IP65, tương thích màn chắn sáng IEC 61496' },
    ],
    figure: '[ Hình sản phẩm — trạm sáu camera phía trên băng tải đang chạy ]',
  },
  'amr-fleet': {
    kicker: 'Sản phẩm 02 — Đội AMR và bộ điều phối',
    title: 'Vật liệu tự di chuyển. Mặt bằng được giữ nguyên.',
    blurb: 'Không ray, không beacon, không neo xuống sàn. Xe kéo, xe nâng và xe trung chuyển dùng chung một bộ điều phối, lập lại tuyến dưới 200 ms khi lối đi thay đổi.',
    video: { caption: '[ Video vận hành — xe kéo cập bến giá pallet, góc máy bám theo ]', note: 'Lặp · tắt tiếng · tuyến đường vẽ trên trang', placeholder: '[ Video vận hành, 1920×1080 — đang chờ tài sản khách hàng ]' },
    specs: [
      { label: 'Nhóm tải trọng', value: '1,500', unit: 'kg' },
      { label: 'Độ chính xác cập bến', value: '±8', unit: 'mm' },
      { label: 'Thời gian hoạt động 90 ngày', value: '99.4', unit: '%' },
    ],
    rows: [
      { key: 'Định vị', value: 'Lidar trạng thái rắn + độ sâu stereo, không cần bản đồ cố định' },
      { key: 'Độ trễ lập lại tuyến', value: 'Dưới 200 ms khi lối đi thay đổi' },
      { key: 'Quy mô đội xe', value: '4 đến 400 thiết bị, nhiều nhóm xe' },
      { key: 'Kết nối WMS', value: 'REST, AMQP hoặc tệp phẳng mỗi đêm' },
    ],
    figure: '[ Hình sản phẩm — xe kéo đi qua làn bến hàng, góc máy thấp ]',
  },
  integration: {
    kicker: 'Sản phẩm 03 — Tích hợp theo yêu cầu',
    title: 'Chúng tôi chịu trách nhiệm đến bước cuối của lắp đặt.',
    blurb: 'Kỹ sư của chúng tôi viết phần kết nối PLC, MES và WMS, đồng thời ở lại hiện trường đến khi kiểm thử nghiệm thu đạt yêu cầu. Bạn nhận một trạm đã nghiệm thu, không phải một kiện hàng kèm hướng dẫn.',
    video: { caption: '[ Video vận hành — kỹ sư đấu nối trạm vào tủ PLC ]', note: 'Lặp · tắt tiếng · xung tín hiệu vẽ trên trang', placeholder: '[ Ba dải video vận hành, 1920×1080 — đang chờ tài sản khách hàng ]' },
    specs: [
      { label: 'Từ khảo sát đến bàn giao', value: '11', unit: 'ngày' },
      { label: 'Dây chuyền đã nghiệm thu', value: '27', unit: '' },
      { label: 'Đạt ngay lần nghiệm thu đầu', value: '94', unit: '%' },
    ],
    rows: [
      { key: 'Giao thức', value: 'OPC-UA, Modbus TCP, Profinet, REST' },
      { key: 'Hồ sơ bàn giao', value: 'Bảng I/O, báo cáo FAT + SAT, bản vẽ hoàn công' },
      { key: 'Đội hiện trường', value: 'Hai kỹ sư điều khiển, một kỹ sư thị giác' },
      { key: 'Bàn giao', value: 'Đào tạo vận hành, hỗ trợ tăng cường 30 ngày' },
    ],
    figure: '[ Sơ đồ — tuyến tín hiệu từ trạm đến PLC và MES ]',
  },
  retrofit: {
    kicker: 'Sản phẩm 04 — Nâng cấp và nghiệm thu',
    title: 'Đưa tự động hóa vào nhà máy không thể dừng.',
    blurb: 'Nghiệm thu theo giai đoạn quanh lịch sản xuất. Trạm được lắp giữa các ca và đội xe mở rộng từng khu vực — không cần thương lượng một khoảng dừng dây chuyền.',
    video: { caption: '[ Video vận hành — nghiệm thu ca đêm, tua nhanh thời gian ]', note: 'Lặp · tắt tiếng · trường hai tông màu vẽ trên trang', placeholder: '[ Video tua nhanh vận hành, 1920×1080 — đang chờ tài sản khách hàng ]' },
    specs: [
      { label: 'Dừng sản xuất', value: '0', unit: 'giờ' },
      { label: 'Khu vực mỗi giai đoạn', value: '1–3', unit: '' },
      { label: 'Thời lượng trung bình', value: '9', unit: 'ngày' },
    ],
    rows: [
      { key: 'Giai đoạn 1 — Khảo sát', value: 'Kiểm tra mạng, lập bản đồ mặt bằng, sổ đăng ký rủi ro' },
      { key: 'Giai đoạn 2 — Lắp đặt', value: 'Giữa các ca, theo từng khu vực, không dừng dây chuyền' },
      { key: 'Giai đoạn 3 — Tăng đội xe', value: 'Nghiệm thu từng thiết bị, tinh chỉnh bộ điều phối' },
      { key: 'Giai đoạn 4 — Bàn giao', value: 'SAT, đào tạo vận hành, hỗ trợ tăng cường 30 ngày' },
    ],
    figure: '[ Ảnh — nghiệm thu ca đêm, hai tông màu ]',
  },
};

export const productsVi: Product[] = products.map((product) => {
  const copy = viProductCopy[product.slug];
  return {
    ...product,
    ...copy,
    video: { ...product.video, ...copy.video },
  };
});

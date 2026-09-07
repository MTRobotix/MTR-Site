export interface Product {
  slug: 'inspection' | 'amr-fleet' | 'retrofit';
  num: '01' | '02' | '03';
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
  figureImage?: string;
}

export const products: Product[] = [
  {
    slug: 'inspection',
    num: '01',
    nav: 'Vision inspection cells',
    kicker: 'Product 01 — Vision inspection cells',
    title: '2D and 3D inspection with <1 mm tolerance.',
    blurb: 'Synchronized 2D and 3D vision cell with on-device edge inference. Measures part dimensions to <1 mm tolerance, grades defects in 0.4 seconds, and diverts rejects before assembly without cloud latency.',
    video: {
      src: '/videos/inspection-loop.mp4',
      poster: '/videos/inspection-poster.jpg',
      caption: '[ In-action video — 2D and 3D cell grading parts at line speed, overhead ]',
      duration: '00:24',
      durationSeconds: 24,
      note: 'Loop · muted · defect HUD drawn in page',
      placeholder: '[ Full-bleed in-action video, 1920×1080 — client asset pending ]',
      assetReady: false,
    },
    specs: [
      { label: 'Measurement tolerance', value: '<1', unit: 'mm' },
      { label: 'Defect recall', value: '99.2', unit: '%' },
      { label: 'Grading cycle', value: '0.4', unit: 's' },
    ],
    rows: [
      { key: 'Optical architecture', value: 'Synchronized 2D surface imaging and 3D depth measurement' },
      { key: 'Accuracy', value: '<1 mm dimensional and volumetric measurement tolerance' },
      { key: 'Inference', value: 'On-device edge inference, zero cloud round-trip latency' },
      { key: 'Retraining', value: 'Shift-boundary defect updating from operator-labelled reject bin' },
      { key: 'Interface', value: 'OPC-UA, REST, discrete dry-contact reject divert' },
      { key: 'Enclosure', value: 'IP65 industrial housing, IEC 61496 light-curtain compatible' },
    ],
    figure: '[ Technical drawing — 2D and 3D vision inspection cell over a moving conveyor ]',
    figureImage: '/images/inspection-cell.jpg',
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
    slug: 'retrofit',
    num: '03',
    nav: 'Automation Integration',
    kicker: 'Product 03 — Automation Integration',
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
    title: 'Kiểm tra 2D và 3D với dung sai <1 mm.',
    blurb: 'Trạm thị giác 2D và 3D đồng bộ với suy luận biên tại thiết bị. Đo kích thước chi tiết với dung sai <1 mm, phân loại lỗi trong 0,4 giây và chuyển hướng sản phẩm loại trước lắp ráp mà không có độ trễ đám mây.',
    video: { caption: '[ Video vận hành — trạm 2D và 3D phân loại chi tiết ở tốc độ dây chuyền, góc nhìn trên cao ]', note: 'Lặp · tắt tiếng · HUD lỗi vẽ trên trang', placeholder: '[ Video vận hành toàn khung, 1920×1080 — đang chờ tài sản khách hàng ]' },
    specs: [
      { label: 'Dung sai đo lường', value: '<1', unit: 'mm' },
      { label: 'Độ bao phủ lỗi', value: '99.2', unit: '%' },
      { label: 'Chu kỳ phân loại', value: '0.4', unit: 's' },
    ],
    rows: [
      { key: 'Kiến trúc quang học', value: 'Hình ảnh bề mặt 2D và đo độ sâu 3D đồng bộ' },
      { key: 'Độ chính xác', value: 'Dung sai đo kích thước và thể tích dưới 1 mm (<1 mm)' },
      { key: 'Suy luận', value: 'Mô-đun biên tại thiết bị, không độ trễ truyền qua đám mây' },
      { key: 'Huấn luyện lại', value: 'Tại thời điểm đổi ca, dùng thùng sản phẩm loại do vận hành viên gán nhãn' },
      { key: 'Giao diện', value: 'OPC-UA, REST, ngõ ra chuyển hướng tiếp điểm khô' },
      { key: 'Vỏ bảo vệ', value: 'IP65, tương thích màn chắn an toàn IEC 61496' },
    ],
    figure: '[ Bản vẽ kỹ thuật — trạm kiểm tra thị giác 2D và 3D phía trên băng tải đang chạy ]',
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
  retrofit: {
    kicker: 'Sản phẩm 03 — Nâng cấp và nghiệm thu',
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

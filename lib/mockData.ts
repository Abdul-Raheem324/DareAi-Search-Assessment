import { Order, OrderStatus, OrderPriority, OrderRegion, OrderCategory, OrderItem, AuditLog } from './types';

function createPrng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Chris', 'Pat', 'Riley', 'Avery',
  'Logan', 'Dakota', 'Cameron', 'Reese', 'Quinn', 'Harper', 'Rowan', 'Finley', 'Hayden', 'Emerson',
  'Elena', 'Marcus', 'Sophia', 'Liam', 'Zoe', 'Noah', 'Amara', 'Mateo', 'Aria', 'Kaelen',
  'Ananya', 'Tariq', 'Chloe', 'Dmitri', 'Fatima', 'Lucas', 'Mei', 'Hiroshi', 'Siddharth', 'Freja'
];

const LAST_NAMES = [
  'Vance', 'Chen', 'O\'Connor', 'Patel', 'Kowalski', 'Tanaka', 'Müller', 'Al-Mansoor', 'Silva', 'Lindqvist',
  'Dubois', 'Washington', 'Nakamura', 'Gupta', 'Hansen', 'Rossi', 'Santos', 'Kim', 'Schneider', 'Novak',
  'Sterling', 'Mercer', 'Blackwood', 'Frost', 'Sinclair', 'Cross', 'Knight', 'Vogel', 'Winters', 'Stark'
];

const COMPANIES = [
  'Stripe Technologies', 'Datadog Systems', 'Snowflake Analytics', 'Vercel Edge Labs', 'Figma Design Group',
  'Anthropic AI', 'Scale Computing', 'Palantir Defense Corp', 'Cloudflare Networks', 'Retool Platforms',
  'MongoDB Core', 'HashiCorp Infra', 'Confluent Stream', 'Supabase Cloud', 'OpenAI Research',
  'Neon Serverless', 'Postman API Labs', 'Linear Engineering', 'Notion Spaces', 'Docker Containerics',
  'Databricks AI', 'Elastic Searchworks', 'Grafana Labs', 'Snyk CyberSec', 'CrowdStrike Intelligence'
];

const CATEGORIES: OrderCategory[] = [
  'Cloud Infrastructure',
  'AI Hardware',
  'Security Suite',
  'Enterprise Licenses',
  'Dedicated Transit'
];

const REGIONS: OrderRegion[] = ['North America', 'EMEA', 'APAC', 'LATAM'];
const STATUSES: OrderStatus[] = ['delivered', 'processing', 'in_transit', 'pending', 'cancelled', 'refunded'];
const PRIORITIES: OrderPriority[] = ['critical', 'high', 'medium', 'low'];
const PAYMENT_METHODS: Order['paymentMethod'][] = ['Credit Card', 'Wire Transfer', 'ACH Direct', 'Crypto / USDC'];
const CARRIERS = ['FedEx Priority Express', 'DHL Worldwide Global', 'UPS Next Day Air', 'Apex Dedicated Logistics', 'BlueDart Global'];

const PRODUCT_CATALOG: Record<OrderCategory, { name: string; skuPrefix: string; basePrice: number }[]> = {
  'Cloud Infrastructure': [
    { name: 'Bare Metal GPU Cluster 8x H100', skuPrefix: 'GPU-H100', basePrice: 28500 },
    { name: 'Multi-Region VPC Peering Mesh', skuPrefix: 'VPC-MESH', basePrice: 4200 },
    { name: 'Distributed NVMe Storage Array 50TB', skuPrefix: 'NVME-50T', basePrice: 6800 },
    { name: 'High-Throughput Ingress Load Balancer', skuPrefix: 'LB-INGR', basePrice: 1500 },
    { name: 'Edge CDN Dedicated PoP Tier-1', skuPrefix: 'CDN-POP1', basePrice: 3100 },
  ],
  'AI Hardware': [
    { name: 'NVIDIA DGX GH200 Grace Hopper Superchip', skuPrefix: 'NV-GH200', basePrice: 49500 },
    { name: 'Custom Liquid Cooling Rack System 42U', skuPrefix: 'COOL-42U', basePrice: 12500 },
    { name: 'InfiniBand Quantum-2 400G Switch', skuPrefix: 'IB-Q2-400', basePrice: 8900 },
    { name: 'FPGA Acceleration Blade Array', skuPrefix: 'FPGA-BLD', basePrice: 14200 },
    { name: 'Optic Fiber Tranceiver Bundle 800Gbps', skuPrefix: 'OPT-800G', basePrice: 3800 },
  ],
  'Security Suite': [
    { name: 'Zero-Trust SASE Enterprise Subscription', skuPrefix: 'SASE-ENT', basePrice: 7500 },
    { name: 'Automated Red Team SIEM Defense Bot', skuPrefix: 'SIEM-RED', basePrice: 9400 },
    { name: 'Hardware Security Module (HSM) Level 4', skuPrefix: 'HSM-LV4', basePrice: 11200 },
    { name: 'Quantum-Resistant Key Exchange Appliance', skuPrefix: 'PQC-KEY', basePrice: 16000 },
    { name: 'DDoS Scrubber 100Tbps Protection Pool', skuPrefix: 'DDOS-100T', basePrice: 5300 },
  ],
  'Enterprise Licenses': [
    { name: 'Nexus AI Copilot 500-Seat Tier', skuPrefix: 'COPILOT-500', basePrice: 12000 },
    { name: 'Unlimited Developer Workspace Matrix', skuPrefix: 'WS-UNLIM', basePrice: 8500 },
    { name: 'SOC-2 Compliance Continuous Auditing Engine', skuPrefix: 'SOC2-ENG', basePrice: 4900 },
    { name: '24/7 Dedicated Staff Engineering SLA', skuPrefix: 'SLA-VIP', basePrice: 15000 },
    { name: 'Enterprise Data Lake Query Accelerator', skuPrefix: 'LAKE-ACC', basePrice: 6200 },
  ],
  'Dedicated Transit': [
    { name: 'Transatlantic Dark Fiber Pair Lease', skuPrefix: 'FIBER-TA', basePrice: 35000 },
    { name: 'Direct BGP Transit 100Gbps Tier-1', skuPrefix: 'BGP-100G', basePrice: 9800 },
    { name: 'Low-Latency Equinix Cross-Connect NY4', skuPrefix: 'XC-NY4', basePrice: 2200 },
    { name: 'Satellite Backup Uplink Array (LEO)', skuPrefix: 'LEO-UPL', basePrice: 4800 },
    { name: 'Anycast DNS Route Shield Global Network', skuPrefix: 'DNS-AC', basePrice: 3400 },
  ]
};

let cachedDataset: Order[] | null = null;

export function getMockOrdersDataset(): Order[] {
  if (cachedDataset) {
    return cachedDataset;
  }

  const rng = createPrng(42070); 
  const totalRecords = 12000;
  const orders: Order[] = new Array(totalRecords);

  const baseDate = new Date('2026-10-06T12:00:00.000Z').getTime();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < totalRecords; i++) {
    const orderIndex = i + 1;
    const orderNumber = `ORD-2026-${orderIndex.toString().padStart(5, '0')}`;
    const id = `ord_${orderIndex.toString().padStart(6, '0')}`;

    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
    const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) + '.io';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const phone = `+1 (${Math.floor(rng() * 800 + 200)}) ${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 9000 + 1000)}`;

    const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
    const region = REGIONS[Math.floor(rng() * REGIONS.length)];
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(rng() * PRIORITIES.length)];
    const paymentMethod = PAYMENT_METHODS[Math.floor(rng() * PAYMENT_METHODS.length)];
    const carrier = CARRIERS[Math.floor(rng() * CARRIERS.length)];

    // Generate 1 to 4 items
    const catalog = PRODUCT_CATALOG[category];
    const itemCount = Math.floor(rng() * 3) + 1;
    const items: OrderItem[] = [];
    let orderTotal = 0;

    for (let k = 0; k < itemCount; k++) {
      const prod = catalog[Math.floor(rng() * catalog.length)];
      const qty = Math.floor(rng() * 3) + 1;
      const unitPrice = prod.basePrice * (1 + (rng() * 0.2 - 0.1)); // +/- 10%
      const roundedUnitPrice = Math.round(unitPrice * 100) / 100;
      const total = Math.round(roundedUnitPrice * qty * 100) / 100;

      items.push({
        id: `item_${orderIndex}_${k + 1}`,
        name: prod.name,
        sku: `${prod.skuPrefix}-${Math.floor(rng() * 900 + 100)}`,
        qty,
        unitPrice: roundedUnitPrice,
        total
      });

      orderTotal += total;
    }

    orderTotal = Math.round(orderTotal * 100) / 100;

    // Date generation
    const createdAtMs = baseDate - Math.floor(rng() * oneYearMs);
    const createdAt = new Date(createdAtMs).toISOString();
    const updatedAt = new Date(createdAtMs + Math.floor(rng() * 86400000 * 5)).toISOString();
    const estimatedDelivery = new Date(createdAtMs + 86400000 * (Math.floor(rng() * 14) + 2)).toISOString();

    const trackingNumber = `TRK-${Math.floor(rng() * 899999 + 100000)}-${region.slice(0, 2).toUpperCase()}`;

    const auditTrail: AuditLog[] = [
      {
        id: `audit_${orderIndex}_1`,
        timestamp: createdAt,
        action: 'Order Placed & Contract Provisioned',
        actor: `${firstName} ${lastName} (${company})`,
        note: `Electronic signature verified via DocuSign.`
      },
      {
        id: `audit_${orderIndex}_2`,
        timestamp: new Date(createdAtMs + 3600000 * 2).toISOString(),
        action: 'Payment Processing Settled',
        actor: 'Stripe Gateway Gateway daemon',
        note: `Payment via ${paymentMethod} verified.`
      }
    ];

    if (status === 'delivered') {
      auditTrail.push({
        id: `audit_${orderIndex}_3`,
        timestamp: estimatedDelivery,
        action: 'Delivery Finalized & Confirmed',
        actor: carrier,
        note: `Signed by security dock manager at client HQ.`
      });
    } else if (status === 'cancelled') {
      auditTrail.push({
        id: `audit_${orderIndex}_3`,
        timestamp: updatedAt,
        action: 'Order Cancelled by Customer Ops',
        actor: 'Admin Override',
        note: 'Customer initiated service scope modification.'
      });
    }

    orders[i] = {
      id,
      orderNumber,
      customer: {
        name: `${firstName} ${lastName}`,
        company,
        email,
        phone,
        avatarSeed: `${firstName}_${lastName}`
      },
      status,
      priority,
      amount: orderTotal,
      currency: 'USD',
      region,
      category,
      paymentMethod,
      itemsCount: items.length,
      items,
      trackingNumber,
      carrier,
      createdAt,
      updatedAt,
      estimatedDelivery,
      notes: `Enterprise tier fulfillment. Designated for ${region} data center node.`,
      auditTrail
    };
  }

  cachedDataset = orders;
  return orders;
}

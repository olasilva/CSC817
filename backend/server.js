const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'dev-user', role: 'admin' };
  next();
};

// ============ IN-MEMORY DATABASE ============
let products = [
  // IT Equipment (10 items)
  {
    id: 'INV-001', name: 'Dell Latitude 5540', sku: 'IT-LAP-001', category: 'IT Equipment',
    quantity: 5, location: 'Server Room', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    description: 'Business laptop for staff use', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-002', name: 'HP EliteBook 840 G8', sku: 'IT-LAP-002', category: 'IT Equipment',
    quantity: 3, location: 'IT Office', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
    description: 'Executive laptop', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-003', name: 'Cisco IP Phone 8841', sku: 'IT-PHN-001', category: 'IT Equipment',
    quantity: 8, location: 'Comms Room', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    description: 'VoIP desk phone', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-004', name: 'Logitech C920 Webcam', sku: 'IT-CAM-001', category: 'IT Equipment',
    quantity: 10, location: 'IT Store', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400',
    description: 'HD Pro Webcam', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-005', name: 'Dell 27" 4K Monitor', sku: 'IT-MON-001', category: 'IT Equipment',
    quantity: 4, location: 'IT Office', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=400',
    description: 'UltraSharp U2720Q', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-006', name: 'Seagate 2TB HDD', sku: 'IT-HDD-001', category: 'IT Equipment',
    quantity: 6, location: 'Server Room', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    description: 'External hard drive', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-007', name: 'Logitech MX Mouse', sku: 'IT-MOU-001', category: 'IT Equipment',
    quantity: 12, location: 'IT Store', min_stock: 5,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    description: 'Wireless mouse', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-008', name: 'Anker USB-C Hub', sku: 'IT-USB-001', category: 'IT Equipment',
    quantity: 15, location: 'IT Store', min_stock: 5,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    description: '7-in-1 adapter', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-009', name: 'Cisco 24-Port Switch', sku: 'IT-SWT-001', category: 'IT Equipment',
    quantity: 2, location: 'Server Room', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    description: 'Network switch', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-010', name: 'APC UPS 1500VA', sku: 'IT-UPS-001', category: 'IT Equipment',
    quantity: 3, location: 'Server Room', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1575909817553-db5b2d3fd3a9?w=400',
    description: 'Battery backup', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  // Office Supplies (10 items)
  {
    id: 'INV-011', name: 'A4 Paper Ream 500sht', sku: 'OS-PAP-001', category: 'Office Supplies',
    quantity: 20, location: 'Stationery Cabinet', min_stock: 5,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    description: 'Standard printing paper', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-012', name: 'Heavy Duty Stapler', sku: 'OS-STP-001', category: 'Office Supplies',
    quantity: 8, location: 'Stationery Cabinet', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=400',
    description: 'Office stapler', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-013', name: 'File Folders Box 100', sku: 'OS-FLD-001', category: 'Office Supplies',
    quantity: 10, location: 'Archive Room', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400',
    description: 'Manila folders', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-014', name: 'Whiteboard Markers Set', sku: 'OS-WBM-001', category: 'Office Supplies',
    quantity: 6, location: 'Training Room', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    description: '4-color marker set', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-015', name: 'A4 Envelopes Pack', sku: 'OS-ENV-001', category: 'Office Supplies',
    quantity: 4, location: 'Mail Room', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400',
    description: 'White envelopes', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-016', name: 'Notepad A5 Set', sku: 'OS-NTP-001', category: 'Office Supplies',
    quantity: 9, location: 'Stationery Cabinet', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400',
    description: 'Lined notepads', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-017', name: 'HP Ink Cartridge 952XL', sku: 'OS-INK-001', category: 'Office Supplies',
    quantity: 3, location: 'IT Store', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1553729459-afe8f2f7b0ad?w=400',
    description: 'Printer cartridge', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-018', name: 'Desk Organizer 3-Tier', sku: 'OS-DSK-001', category: 'Office Supplies',
    quantity: 7, location: 'Stationery Cabinet', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',
    description: 'Document tray', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-019', name: 'Sticky Notes Bulk', sku: 'OS-STK-001', category: 'Office Supplies',
    quantity: 15, location: 'Stationery Cabinet', min_stock: 5,
    image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400',
    description: 'Colorful sticky notes', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-020', name: 'Scissors Pack 5', sku: 'OS-SCS-001', category: 'Office Supplies',
    quantity: 5, location: 'Stationery Cabinet', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400',
    description: 'Office scissors', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  // Furniture (10 items)
  {
    id: 'INV-021', name: 'Ergonomic Office Chair', sku: 'FN-CHR-001', category: 'Furniture',
    quantity: 6, location: 'Main Office', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
    description: 'Adjustable office chair', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-022', name: 'Standing Desk Electric', sku: 'FN-DSK-001', category: 'Furniture',
    quantity: 4, location: 'Main Office', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
    description: 'Height-adjustable desk', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-023', name: '4-Drawer Filing Cabinet', sku: 'FN-CAB-001', category: 'Furniture',
    quantity: 2, location: 'Archive Room', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400',
    description: 'Metal filing cabinet', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-024', name: 'Bookshelf 5-Tier', sku: 'FN-BKS-001', category: 'Furniture',
    quantity: 3, location: 'Library', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    description: 'Wooden bookshelf', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-025', name: 'Conference Table 12-Seat', sku: 'FN-CTB-001', category: 'Furniture',
    quantity: 1, location: 'Board Room', min_stock: 0,
    image_url: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?w=400',
    description: 'Large meeting table', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-026', name: 'Reception Desk Modern', sku: 'FN-REC-001', category: 'Furniture',
    quantity: 1, location: 'Lobby', min_stock: 0,
    image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    description: 'Front desk reception', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-027', name: 'Visitor Chair Set 4', sku: 'FN-VCH-001', category: 'Furniture',
    quantity: 3, location: 'Reception', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400',
    description: 'Guest chairs', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-028', name: 'Storage Cabinet Metal', sku: 'FN-STC-001', category: 'Furniture',
    quantity: 2, location: 'Store Room', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400',
    description: 'Lockable storage', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-029', name: 'Office Divider Panel', sku: 'FN-DIV-001', category: 'Furniture',
    quantity: 5, location: 'Open Area', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400',
    description: 'Room divider', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-030', name: 'Coat Rack Stand', sku: 'FN-CRT-001', category: 'Furniture',
    quantity: 4, location: 'Hallway', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
    description: 'Wooden coat rack', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  // Tools & Equipment (10 items)
  {
    id: 'INV-031', name: 'DeWalt Power Drill 20V', sku: 'TE-DRL-001', category: 'Tools & Equipment',
    quantity: 2, location: 'Workshop', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
    description: 'Cordless drill', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-032', name: 'Safety Helmet Yellow', sku: 'TE-HLM-001', category: 'Tools & Equipment',
    quantity: 10, location: 'Workshop', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    description: 'Hard hat', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-033', name: 'Fluke Digital Multimeter', sku: 'TE-MLT-001', category: 'Tools & Equipment',
    quantity: 3, location: 'Lab', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    description: 'Testing equipment', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-034', name: 'Complete Toolbox Set', sku: 'TE-TBX-001', category: 'Tools & Equipment',
    quantity: 4, location: 'Workshop', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1597423498219-04418210827d?w=400',
    description: 'General toolkit', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-035', name: 'Extension Cord 25m', sku: 'TE-EXT-001', category: 'Tools & Equipment',
    quantity: 5, location: 'Workshop', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1581147036324-c1c7e8d8b2e6?w=400',
    description: 'Heavy-duty cord', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-036', name: 'Aluminum Ladder 8ft', sku: 'TE-LDR-001', category: 'Tools & Equipment',
    quantity: 1, location: 'Store Room', min_stock: 0,
    image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
    description: 'Step ladder', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-037', name: 'Work Gloves Pack 12', sku: 'TE-GLV-001', category: 'Tools & Equipment',
    quantity: 8, location: 'Workshop', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1513467655676-561b7d489a88?w=400',
    description: 'Protective gloves', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-038', name: 'Measuring Tape 25ft', sku: 'TE-MTP-001', category: 'Tools & Equipment',
    quantity: 6, location: 'Workshop', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    description: 'Tape measure', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-039', name: 'Safety Goggles Pack', sku: 'TE-GOG-001', category: 'Tools & Equipment',
    quantity: 12, location: 'Workshop', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    description: 'Eye protection', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-040', name: 'Angle Grinder 4.5"', sku: 'TE-AGR-001', category: 'Tools & Equipment',
    quantity: 2, location: 'Workshop', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    description: 'Power tool', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  // Consumables (10 items)
  {
    id: 'INV-041', name: 'Hand Sanitizer 5L', sku: 'CN-SAN-001', category: 'Consumables',
    quantity: 4, location: 'Cleaning Closet', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    description: 'Alcohol-based sanitizer', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-042', name: 'Coffee Beans 1kg', sku: 'CN-COF-001', category: 'Consumables',
    quantity: 3, location: 'Kitchen', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
    description: 'Premium coffee', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-043', name: 'Multi-Surface Cleaner 5L', sku: 'CN-CLN-001', category: 'Consumables',
    quantity: 6, location: 'Cleaning Closet', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?w=400',
    description: 'All-purpose cleaner', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-044', name: 'Paper Cups 100pk', sku: 'CN-CUP-001', category: 'Consumables',
    quantity: 5, location: 'Kitchen', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1596566820777-4a43eb709d93?w=400',
    description: 'Disposable cups', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-045', name: 'Bottled Water 24pk', sku: 'CN-WTR-001', category: 'Consumables',
    quantity: 7, location: 'Kitchen', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    description: 'Drinking water', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-046', name: 'AA Batteries 48pk', sku: 'CN-BAT-001', category: 'Consumables',
    quantity: 8, location: 'IT Store', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    description: 'Alkaline batteries', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-047', name: 'Trash Bags Heavy Duty', sku: 'CN-TRB-001', category: 'Consumables',
    quantity: 4, location: 'Cleaning Closet', min_stock: 2,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    description: 'Large trash bags', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-048', name: 'Paper Towels Bulk', sku: 'CN-PTW-001', category: 'Consumables',
    quantity: 9, location: 'Cleaning Closet', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    description: 'Roll paper towels', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-049', name: 'Printer Paper A3', sku: 'CN-PPA-001', category: 'Consumables',
    quantity: 2, location: 'Stationery Cabinet', min_stock: 1,
    image_url: 'https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?w=400',
    description: 'Large format paper', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'INV-050', name: 'Disposable Gloves Box', sku: 'CN-GLV-001', category: 'Consumables',
    quantity: 11, location: 'Cleaning Closet', min_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    description: 'Nitrile gloves', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }
];

let checkouts = [];
let activities = [];
let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@inventory.com' },
  { id: 2, username: 'manager', password: 'manager123', role: 'manager', email: 'manager@inventory.com' },
  { id: 3, username: 'staff', password: 'staff123', role: 'staff', email: 'staff@inventory.com' }
];

// ============ AUTH ROUTES ============
const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64');
    res.json({ 
      success: true, 
      token,
      user: { id: user.id, username: user.username, role: user.role, email: user.email }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

authRouter.post('/register', (req, res) => {
  const { username, password, email, role } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email: email || `${username}@inventory.com`,
    role: role || 'staff'
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, message: 'User registered successfully' });
});

// ============ PRODUCT ROUTES ============
const productsRouter = express.Router();

productsRouter.get('/', authMiddleware, (req, res) => {
  try {
    const { category, search, status } = req.query;
    let filtered = [...products];

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    if (status === 'low_stock') {
      filtered = filtered.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock || 2));
    } else if (status === 'out_of_stock') {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

productsRouter.get('/categories', authMiddleware, (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const categoryData = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
    totalQuantity: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.quantity, 0),
    lowStock: products.filter(p => p.category === cat && p.quantity > 0 && p.quantity <= (p.min_stock || 2)).length,
    outOfStock: products.filter(p => p.category === cat && p.quantity === 0).length
  }));
  res.json({ success: true, data: categoryData });
});

productsRouter.get('/stats', authMiddleware, (req, res) => {
  const stats = {
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
    totalCategories: [...new Set(products.map(p => p.category))].length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock || 2)).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    checkedOut: checkouts.length
  };
  res.json({ success: true, data: stats });
});

productsRouter.get('/:id', authMiddleware, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, data: product });
});

productsRouter.post('/', authMiddleware, (req, res) => {
  try {
    const { name, sku, category, quantity, location, description, imageUrl } = req.body;
    if (!name || !sku || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, sku, category' });
    }
    if (products.find(p => p.sku === sku)) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const newProduct = {
      id: 'INV-' + Date.now().toString(36).toUpperCase(),
      name, sku, category,
      quantity: parseInt(quantity) || 0,
      location: location || 'Main Store',
      image_url: imageUrl || null,
      description: description || '',
      min_stock: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(newProduct);
    activities.unshift({ type: 'PRODUCT_ADDED', details: `Added: ${name}`, timestamp: new Date().toISOString() });
    io.emit('product:created', newProduct);
    io.emit('stats:updated');
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

productsRouter.put('/:id', authMiddleware, (req, res) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const { name, sku, category, quantity, location, description, imageUrl } = req.body;
    products[index] = {
      ...products[index],
      name: name || products[index].name,
      sku: sku || products[index].sku,
      category: category || products[index].category,
      quantity: quantity !== undefined ? parseInt(quantity) : products[index].quantity,
      location: location !== undefined ? location : products[index].location,
      image_url: imageUrl !== undefined ? imageUrl : products[index].image_url,
      description: description !== undefined ? description : products[index].description,
      updated_at: new Date().toISOString()
    };

    activities.unshift({ type: 'PRODUCT_UPDATED', details: `Updated: ${products[index].name}`, timestamp: new Date().toISOString() });
    io.emit('product:updated', products[index]);
    io.emit('stats:updated');
    res.json({ success: true, data: products[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

productsRouter.delete('/:id', authMiddleware, (req, res) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const deleted = products[index];
    products.splice(index, 1);
    activities.unshift({ type: 'PRODUCT_DELETED', details: `Deleted: ${deleted.name}`, timestamp: new Date().toISOString() });
    io.emit('product:deleted', { id: req.params.id });
    io.emit('stats:updated');
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

productsRouter.post('/:id/restock', authMiddleware, (req, res) => {
  try {
    const { quantity, source, notes } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const oldQty = products[index].quantity;
    products[index].quantity += parseInt(quantity);
    products[index].updated_at = new Date().toISOString();

    activities.unshift({ type: 'PRODUCT_RESTOCKED', details: `Restocked ${products[index].name}: ${oldQty} → ${products[index].quantity}`, timestamp: new Date().toISOString() });
    io.emit('product:updated', products[index]);
    io.emit('stats:updated');
    res.json({ success: true, data: products[index], message: `Restocked. New quantity: ${products[index].quantity}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restock' });
  }
});

// ============ CHECKOUT ROUTES ============
const checkoutsRouter = express.Router();

checkoutsRouter.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: checkouts, total: checkouts.length });
});

checkoutsRouter.post('/', authMiddleware, (req, res) => {
  try {
    const { productId, location, refNumber, assignedTo, department, notes } = req.body;
    if (!productId || !location || !refNumber) {
      return res.status(400).json({ error: 'Missing required fields: productId, location, refNumber' });
    }

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.quantity <= 0) return res.status(400).json({ error: 'Product out of stock' });

    const checkout = {
      id: 'CO-' + Date.now().toString(36).toUpperCase(),
      productId: product.id, productName: product.name,
      productSku: product.sku, category: product.category,
      location, refNumber, assignedTo: assignedTo || '',
      department: department || '', notes: notes || '',
      checkedOutAt: new Date().toISOString()
    };

    checkouts.push(checkout);
    product.quantity -= 1;
    product.updated_at = new Date().toISOString();

    activities.unshift({ type: 'PRODUCT_CHECKED_OUT', details: `${product.name} → ${location} (Ref: ${refNumber})`, timestamp: new Date().toISOString() });
    io.emit('product:checked-out', checkout);
    io.emit('product:updated', product);
    io.emit('stats:updated');
    res.status(201).json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ error: 'Failed to checkout' });
  }
});

checkoutsRouter.post('/:id/return', authMiddleware, (req, res) => {
  try {
    const index = checkouts.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Checkout not found' });

    const checkout = checkouts[index];
    checkouts.splice(index, 1);

    const product = products.find(p => p.id === checkout.productId);
    if (product) {
      product.quantity += 1;
      product.updated_at = new Date().toISOString();
    }

    activities.unshift({ type: 'PRODUCT_RETURNED', details: `${checkout.productName} returned`, timestamp: new Date().toISOString() });
    io.emit('product:returned', { checkoutId: req.params.id, productId: checkout.productId });
    io.emit('stats:updated');
    res.json({ success: true, message: 'Returned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to return' });
  }
});

// ============ ACTIVITY ROUTES ============
const activityRouter = express.Router();

activityRouter.get('/', authMiddleware, (req, res) => {
  const { limit = 50 } = req.query;
  res.json({ success: true, data: activities.slice(0, parseInt(limit)) });
});

activityRouter.delete('/', authMiddleware, (req, res) => {
  activities = [];
  res.json({ success: true, message: 'Cleared' });
});

// ============ SETTINGS ROUTES ============
const settingsRouter = express.Router();

settingsRouter.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      appName: 'My Inventory System',
      version: '2.0.0',
      categories: [...new Set(products.map(p => p.category))],
      totalProducts: products.length,
      totalCheckouts: checkouts.length
    }
  });
});

settingsRouter.put('/profile', authMiddleware, (req, res) => {
  const { username, email } = req.body;
  if (req.user) {
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      if (username) user.username = username;
      if (email) user.email = email;
    }
  }
  res.json({ success: true, message: 'Profile updated' });
});

// ============ MOUNT ALL ROUTES ============
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/checkouts', checkoutsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);

// ============ SERVE FRONTEND FILES ============
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Specific page routes
const pages = ['main.html', 'dashboard.html', 'inventory.html', 'analysis.html', 'supplies.html', 'settings.html', 'auth.html'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(frontendPath, page));
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: { products: products.length, checkouts: checkouts.length, activities: activities.length, users: users.length }
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'main.html'));
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).sendFile(path.join(frontendPath, 'main.html'));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : '' });
});

// ============ SOCKET.IO ============
io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  socket.on('join-room', (room) => socket.join(room));

  socket.on('request-stats', () => {
    socket.emit('stats:updated', {
      totalProducts: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      checkedOut: checkouts.length,
      lowStock: products.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock || 2)).length
    });
  });

  socket.on('disconnect', () => console.log('🔌 Disconnected:', socket.id));
});

// ============ START ============
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MY INVENTORY SYSTEM SERVER');
  console.log('═══════════════════════════════════════════');
  console.log(`  📡 Port: ${PORT}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🔗 API: http://localhost:${PORT}/api`);
  console.log(`  💻 App: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════');
  console.log('  📊 Data Loaded:');
  console.log(`     Products: ${products.length}`);
  console.log(`     Categories: ${[...new Set(products.map(p => p.category))].length}`);
  console.log(`     Checkouts: ${checkouts.length}`);
  console.log(`     Users: ${users.length}`);
  console.log('═══════════════════════════════════════════');
  console.log('  🔑 Test Login:');
  console.log('     admin / admin123');
  console.log('     manager / manager123');
  console.log('     staff / staff123');
  console.log('═══════════════════════════════════════════');
});
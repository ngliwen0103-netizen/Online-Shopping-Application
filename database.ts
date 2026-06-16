// ============================================
// LOCAL DATABASE (SQLITE) OPERATIONS
// This file handles creation of tables,
// insertion of sample data, and all queries
// for products, categories, and brands
// ============================================
import { getDBConnection } from './db';

// ============================================
// CREATE PRODUCT TABLES
// Initializes all product-related tables:
// Categories, Brands, Products, ProductColors
// ============================================
export const createProductTables = async (): Promise<void> => {
  const db = await getDBConnection();

  try {
    await db.executeSql(`PRAGMA foreign_keys = ON;`);

    // CATEGORIES TABLE
    // Stores product categories (Mouse, Keyboard, etc.)
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS Categories (
        category_id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        image_url TEXT
      );
    `);

    // BRANDS TABLE
    // Stores product brands (Razer, Logitech, etc.)
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS Brands (
        brand_id TEXT PRIMARY KEY NOT NULL,
        brand_name TEXT NOT NULL,
        logo_url TEXT
      );
    `);

    // PRODUCTS TABLE
    // Stores main product information
    // Linked to Categories and Brands using foreign keys
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS Products (
        product_id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        brand_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        details TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        average_rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY (category_id) REFERENCES Categories(category_id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
        FOREIGN KEY (brand_id) REFERENCES Brands(brand_id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `);

    // PRODUCT COLORS TABLE
    // Stores different color variations and stock quantity for each product
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ProductColors (
        product_color_id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        color_name TEXT NOT NULL,
        stock_qty INTEGER DEFAULT 0,
        image_url TEXT,
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      );
    `);

    console.log('Product tables created successfully.');
  } catch (error) {
    console.error('Error creating product tables:', error);
    throw error;
  }
};

// ============================================
// CLEAR PRODUCT TABLES (DEVELOPMENT ONLY)
// Deletes all product-related data for testing purposes
// ============================================
export const clearProductTables = async (): Promise<void> => {
  const db = await getDBConnection();

  await db.executeSql(`PRAGMA foreign_keys = OFF;`);
  await db.executeSql(`DELETE FROM ProductColors;`);
  await db.executeSql(`DELETE FROM Products;`);
  await db.executeSql(`DELETE FROM Brands;`);
  await db.executeSql(`DELETE FROM Categories;`);
  await db.executeSql(`PRAGMA foreign_keys = ON;`);
};

// ============================================
// INSERT SAMPLE DATA
// Inserts predefined categories, brands, products,
// and product color variations into the database
// ============================================
export const insertSampleData = async (): Promise<void> => {
  const db = await getDBConnection();

  try {
    await db.executeSql(`
      INSERT OR IGNORE INTO Categories (category_id, name, image_url) VALUES
      ('C01', 'Gaming Mouse', '../ProductImage/icon/mouse.jpg'),
      ('C02', 'Gaming Keyboard', '../ProductImage/icon/keyboard.jpg'),
      ('C03', 'Gaming Audio', '../ProductImage/icon/headphone.jpg'),
      ('C04', 'Gaming Monitor', '../ProductImage/icon/monitor.jpg');
    `);

    await db.executeSql(`
      INSERT OR IGNORE INTO Brands (brand_id, brand_name, logo_url) VALUES
      ('B01', 'Razer', '../ProductImage/logo/Razer-logo.jpg'),
      ('B02', 'Logitech', '../ProductImage/logo/Logitech-logo.jpg'),
      ('B03', 'SteelSeries', '../ProductImage/logo/steelseries-logo.jpg'),
      ('B04', 'ASUS', '../ProductImage/logo/asus-logo.jpg'),
      ('B05', 'Corsair', '../ProductImage/logo/corsair-logo.jpg'),
      ('B06', 'HyperX', '../ProductImage/logo/HyperX-logo.jpg'),
      ('B07', 'AOC', '../ProductImage/logo/AOC-logo.jpg'),
      ('B08', 'DELL', '../ProductImage/logo/Dell-logo.jpg');
    `);

    await db.executeSql(`
      INSERT OR IGNORE INTO Products
      (product_id, category_id, brand_id, name, description, details, price, image_url, average_rating, review_count, created_at)
      VALUES
      (
        'P01',
        'C01',
        'B04', 
        'ASUS ROG Gladius III',
        'Wireless AimPoint Gaming Mouse',
        'ROG Gladius III features a 19,000 dpi optical sensor with 1% deviation (tuned to 26,000 dpi) for near-zero latency and unrivaled precision. Its ergonomic shape offers comfort for marathon gaming sessions, and a unique Push-Fit Switch Socket II design ensures compatibility with both mechanical and Omron optical micro switches. Finishing touches include a flexible ROG Paracord and round-edged 100% TPFE mouse feet for an ultra-smooth glide, plus laser-engraved ROG markings with RGB lighting on the textured, nonslip side panel.',
        499.00,
        '../ProductImage/mouse/asus-rog-gladius-iii.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P02',
        'C01',
        'B04', 
        'ASUS TUF Gaming M4 Air',
        'Lightweight wireless gaming mouse',
        'A lightweight wired gaming mouse with 16,000 dpi sensor, six programmable buttons, ultralight Air Shell, IPX6 water resistance , ASUS Antibacterial Guard, TUF Gaming Paracord and pure PTFE feet',
        159.00,
        '../ProductImage/mouse/asus-tuf-gaming-m4.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P03',
        'C01',
        'B01', 
        'Razer DeathAdder V3 Pro',
        'Ergonomic Esports Mouse with Gen-3 Optical Switches',
        'The Razer DeathAdder V3 Pro is a lightweight, wireless gaming mouse that continues Razer''s DeathAdder lineup. Like earlier versions, this mouse has a right-handed design and is best suited for larger-sized hands. As a departure from previous models, this version has a slightly different shape and is significantly more lightweight. It also includes several significant upgrades under the hood, including a new sensor, a new generation of optical switches, and improved battery life.',
        699.00,
        '../ProductImage/mouse/razer-deathadder-v3pro.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P04',
        'C01',
        'B01', 
        'Razer Viper V3 Pro',
        'Ultralight Wireless Esports Mouse',
        'The Razer Viper V3 Pro is a lightweight wireless gaming mouse that continues Razer''s popular Viper lineup. Its symmetrical shape is identical to the Razer Viper V3 HyperSpeed, where it also adopts its new, more subdued design language. Compared to the previous generation Razer Viper V2 Pro, it has an updated sensor that now supports a maximum wireless polling rate of 8000Hz out of the box.',
        701.00,
        '../ProductImage/mouse/razer-viper-v3pro.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P05',
        'C01',
        'B02', 
        'Logitech G Pro X Superlight',
        'LIGHTSPEED Wireless Gaming Mouse',
        'The Logitech® G PRO X SUPERLIGHT wireless gaming mouse weighs less than 63 grams and features advanced low-latency LIGHTSPEED wireless technology. Equipped with the HERO 25K sensor, the Logitech PRO X SUPERLIGHT wireless mouse delivers sub-micron precision and great tracking accuracy. One of our lightest and fastest PRO mice, the PRO X SUPERLIGHT is engineered for professional esports athletes looking to level up their game with smooth play and unmatched performance.',
        689.00,
        '../ProductImage/mouse/logitech-g-pro-x-superlight-2.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P06',
        'C01',
        'B02', 
        'Logitech G502 X LightSpeed',
        'Wireless Gaming Mouse',
        'G502 X LIGHTSPEED wireless gaming mouse features LIGHTFORCE hybrid optical-mechanical switches and has a 68% faster response rate than the previous generation. Play comfortably and precisely with this high-performance gaming mouse',
        689.00,
        '../ProductImage/mouse/logitech-g502-x-lightspeed.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P07',
        'C01',
        'B05', 
        'Corsair M75 Air',
        'Wireless Gaming Mouse',
        'Defined in Ambition. Built Through Rigor: Our most diligently crafted mouse that lets nothing come between you and your best competitive play. Meticulously designed. Ridiculously lightweight',
        499.00,
        '../ProductImage/mouse/corsair-m75-air.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
        'P08',
        'C01',
        'B03', 
        'SteelSeries Prime Wireless',
        'Wireless Gaming Mouse',
        'Defined in Ambition. Built Through Rigor: Our most diligently crafted mouse that lets nothing come between you and your best competitive play. Meticulously designed. Ridiculously lightweight',
        559.00,
        '../ProductImage/mouse/steelseries-prime-wireless.jpg',
        0.0,
        0,
        '2026-04-16 10:00:00'
      ),
      (
      'P09',
      'C02',
      'B04', 
      'ASUS ROG Strix Scope RX',
      'Wireless Mechanical Gaming Keyboard',
      'ROG Strix Scope RX optical RGB gaming keyboard for FPS gamers, with ROG RX optical mechanical switches, all-round Aura Sync RGB illumination, IP57 waterproof and dust resistance , USB 2.0 passthrough, and alloy top plate',
      730.00,
      '../ProductImage/keyboard/asus-rog-strix-scope-rx.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P10',
      'C02',
      'B04', 
      'Asus TUF Gaming K3',
      'Mechanical RGB Keyboard',
      'ASUS TUF Gaming K3 is a mechanical RGB keyboard that features durable switches for responsive and reliable performance. Its customizable all-key RGB lighting offers unlimited personalization options, while the detachable magnetic wrist rest gives you extra support and comfort for gaming marathons. In addition, K3 offers convenient USB 2.0 passthrough, an aerospace-grade aluminum top cover, eight fully programmable keys with onboard memory and media keys — so you''ll be ready to play like a pro',
      338.00,
      '../ProductImage/keyboard/asus-tug-gaming-k3.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P11',
      'C02',
      'B01', 
      'Razer BlackWidow V4 Pro',
      'Mechanical Gaming Keyboard',
      'Empower your play with a centerpiece that elevates your entire setup. Enter the next phase of battlestation evolution with the ultimate mechanical gaming keyboard. Take full command with a set of features designed for advanced control, and enhance your immersion with full-blown Razer Chroma™ RGB.',
      1199.00,
      '../ProductImage/keyboard/razer-blackwidow-v4-pro.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
      (
      'P12',
      'C02',
      'B01', 
      'Razer Huntsman Mini',
      'Mechanical Gaming Keyboard',
      'Enter a new dimension of deadly with the Razer Huntsman Mini—a 60% gaming keyboard with cutting-edge Razer Optical Switches. Highly portable and ideal for streamlined setups, it''s time to experience lightning-fast actuation in our most compact form factor yet.',
      620.00,
      '../ProductImage/keyboard/razer-huntsman-mini.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P13',
      'C02',
      'B02', 
      'Logitech G Pro X TKL',
      'Lightweight Gaming Keyboard',
      'A championship-trusted wireless gaming keyboard designed for the highest levels of competitive play. Designed with pros and engineered to win. Logitech G Hub gives you a single portal for optimizing and customizing all your supported Logitech G gear.',
      689.00,
      '../ProductImage/keyboard/logitech-g-pro-x-tkl.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P14',
      'C02',
      'B02', 
      'Logitech G913 LIGHTSPEED',
      'Wireless RGB Mechanical Gaming Keyboard',
      'A breakthrough in design and engineering, the G913 features LIGHTSPEED pro-grade wireless, advanced LIGHTSYNC RGB, and new high-performance low-profile mechanical switches. Meticulously crafted from premium materials, the G913 is a sophisticated design of unparalleled beauty, strength, and performance. Meet G913 LIGHTSPEED and play the next dimension.',
      999.00,
      '../ProductImage/keyboard/logitech-g913-lightspeed.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P15',
      'C02',
      'B05', 
      'Corsair K70 RGB Pro',
      'Mechanical Gaming Keyboard with PBT DOUBLE SHOT PRO Keycaps',
      'The K70 RGB PRO retains the iconic elements of our award-winning K70 series with a durable aluminum frame, CHERRY MX mechanical keyswitches, and per-key RGB backlighting, while setting a new bar for performance with AXON technology and a tournament switch',
      1199.00,
      '../ProductImage/keyboard/corsair-k70-rgb-pro.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P16',
      'C02',
      'B03', 
      'SteelSeries Apex Pro TKL',
      'Wired Tenkeyless Esports Keyboard with Adjustable Switches',
      'New OmniPoint 2.0 switches use state-of-the-art magnetic sensors for instant, zero contact keystroke activation to give you what you want — speed.',
      989.00,
      '../ProductImage/keyboard/steelseries-apex-pro-tkl.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P17',
      'C03',
      'B04', 
      'ASUS ROG Delta S Animate',
      'Lightweight USB-C gaming headset',
      'Lightweight USB-C gaming headset with AI noise-canceling mic, MQA rendering technology, Hi-Res ESS 9281 QUAD DAC, RGB lighting, compatible with PC, Nintendo Switch™ and Sony PlayStation®5',
      1289.00,
      '../ProductImage/audio/asus-rog-delta-s-animate.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P18',
      'C03',
      'B04', 
      'Asus Tuf Gaming H3',
      'Lightweight heading gaming headset',
      'The new TUF Gaming H3 headset is designed to provide incredible comfort and durability for gamers who play or stream for extended periods of time. Featuring lightweight construction, ASUS fast-cooling ear cushions, stainless-steel headband, 50 mm ASUS Essence drivers and an airtight chamber design, TUF Gaming H3 headset upgrades your in-game audio experience with wonderfully rich, immersive sound.',
      190.00,
      '../ProductImage/audio/asus-tuf-gaming-h3.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P19',
      'C03',
      'B01', 
      'Razer BlackShark V2 Pro',
      'Premium Wireless Esports Headset',
      'The new Razer BlackShark V2 Pro comes with a next-generation super wideband mic for unrivalled vocal clarity, on-board audio profiles for competitive FPS titles, updates to Type C charging, and over triple the battery life at 70 hours. It is designed to be the ultimate wireless headset with mic for esports.',
      789.00,
      '../ProductImage/audio/razer-blackshark-v2-pro.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
      (
      'P20',
      'C03',
      'B01', 
      'Razer Kraken V3 X',
      'Wired USB Gaming Headset',
      'Feel complete immersion without feeling the weight—introducing the Razer Kraken V3 X, a USB PC gaming headset that allows you to game on, and on, and on. Upgraded with patented Razer™ TriForce drivers for incredibly realistic sound, it''s time to lose yourself with an audio experience that''s always a win.',
      259.00,
      '../ProductImage/audio/razer-kraken-v3-x.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P21',
      'C03',
      'B02', 
      'Logitech G Pro X',
      'Wired 7.1 Gaming Headset',
      'The Logitech® PRO X wired gaming headset is designed in collaboration with and for pros. Next-gen 7.1 surround sound and PRO-G 50 mm drivers ensure premium gaming audio. The external USB sound card features Blue VO!CE broadcast filters that deliver crystal-clear mic quality.',
      699.00,
      '../ProductImage/audio/logitech-g-pro-x.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P22',
      'C03',
      'B02', 
      'Logitech G435 LIGHTSPEED',
      'LIGHTSPEED Wireless Gaming Headset',
      'Play games and music with featherlight comfort and powerful, clean sound. The Logitech G435 wireless headset''s dual beamforming mics reduce background noise. Connect to your devices via gaming-grade LIGHTSPEED wireless and Bluetooth®. Stay locked in a readied up for every round.',
      307.00,
      '../ProductImage/audio/logitech-g435-lightspeed.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P23',
      'C03',
      'B06', 
      'HyperX Cloud II Core ',
      'Wireless Gaming Headset',
      'For gamers looking for a comfortable 2.4GHz wireless headset at a great price, the HyperX Cloud II Core Wireless headset is a standout performer. With a battery life of up to 80 hours[1], the Cloud II Core Wireless has more than enough battery life for multiple days of gaming. Enhance your gaming and audio entertainment with premium DTS® Headphone:X® Spatial Audio[2], and the Cloud II Core''s 53mm drivers. Plush memory foam earcups and signature Cloud comfort ensure that you''re able to stay focused on the win and keep yourself in the zone. Ditch the wires without fear of losing connection thanks to the fast, 2.4GHz connection. Easily mute your mic and adjust your headset''s volume with the quick access controls right on the earcup.',
      709.00,
      '../ProductImage/audio/hyperx-cloud-ii-core-wireless.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P24',
      'C03',
      'B03', 
      'SteelSeries Arctis Nova 7P',
      'Multi-Platform Premium Wireless Gaming Headset',
      'Premium Neodymium Magnetic Drivers for an ultra-detailed soundscape; AI-powered noise cancelling mic with stealth retractable design; 38-hour battery life with USB-C Fast Charge; Multi-platform USB-C dongle works with PlayStation 4/5, PC, Mac, Switch, Meta Quest 2, and mobile; ComfortMAX System for adjustable fit with a PVD-coated steel headband',
      1021.00,
      '../ProductImage/audio/steelseries-arctis-nova-7p.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P25',
      'C04',
      'B04', 
      'ASUS TUF Gaming VG27AQ',
      'HDR Gaming Monitor',
      'TUF Gaming VG27AQ is a 27-inch, WQHD (2560x1440), HDR IPS display with an ultrafast 165Hz* designed for professional gamers and those seeking immersive gameplay. Those are some serious specs, but not even the most exciting thing the VG27AQ has in store',
      1425.00,
      '../ProductImage/monitor/asus-tuf-gaming-vg27aq.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P26',
      'C04',
      'B04', 
      'Asus ROG Strix XG27ACS',
      '27" Gaming Monitor',
      '27-inch 2560 x 1440 HDR gaming monitor with ultrafast 180Hz refresh rate designed for professional gamers and immersive gameplay; ASUS Fast IPS technology enables a 1ms response time (GTG) for sharp gaming visuals with high frame rates',
      1699.00,
      '../ProductImage/monitor/asus-rog-strix-xg27acs.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P27',
      'C04',
      'B01', 
      'Razer Raptor 27',
      '27" Gaming Monitor',
      'A gaming monitor requires extreme performance with speed and clarity, so you can react in a split-second. It also needs to be able to display deep vibrant colors and a natural life-like image to create a sense of immersion. The Razer Raptor was created to be a true expression of this, and more—a no-compromise display that produces breathtaking image quality for your battlestation.',
      3300.00,
      '../ProductImage/monitor/razer-raptor-27.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
      (
      'P28',
      'C04',
      'B07', 
      'AOC Q27G3XMN',
      '27" Gaming Monitor',
      'The AOC Q27G3XMN is a 27-inch budget gaming monitor. Competing with the Acer Nitro XV275U P3biipx, it''s rather unique for a low-cost monitor as it features Mini LED backlighting with 336 dimming zones, which is mainly something more expensive monitors have. It also has VESA DisplayHDR 1000 certification to ensure a high brightness and contrast ratio. Besides that, it''s focused on gaming as it has a VA panel with a 1440p resolution and a 180Hz max refresh rate. It also has variable refresh rate (VRR) support. It comes with an ergonomic stand, one DisplayPort 1.4 input, and two HDMI 2.0 ports, but other than that, it''s barebones in extra features.',
      1900.00,
      '../ProductImage/monitor/aoc-q27g3xmn.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P29',
      'C04',
      'B05', 
      'Corsair XENEON 27QHD240',
      'OLED 27-Inch Gaming Monitor',
      'The Corsair XENEON 27QHD240 is a 27-inch gaming monitor with a 1440p resolution. Alongside the Corsair XENEON FLEX 45WQHD240, it''s one of two OLEDs that Corsair has, and it uses the same panel as the LG 27GR95QE-B and ASUS ROG Swift OLED PG27AQDM. It has everything you''d expect in a high-end gaming monitor, like a 240Hz refresh rate, variable refresh rate (VRR) support, and HDMI 2.1 bandwidth. Although it''s focused on gaming, it has a few features for other uses like productivity, as it has a KVM switch that makes it easy to use the same keyboard and mouse connected to the monitor with two different sources. It has a few settings to combat permanent burn-in, which OLEDs are prone to, and Corsair advertises that there''s a warranty against burn-in, but it''s unclear what specific burn-in is covered as the warranty excludes normal wear and tear.',
      5666.00,
      '../ProductImage/monitor/corsair-xeneon-27qhd240.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P30',
      'C04',
      'B05', 
      'Corsair XENEON FLEX 45WQHD240',
      '45-Inch Bendable Gaming Monitor',
      'The Corsair XENEON FLEX 45WQHD240 is a high-end 45-inch OLED gaming monitor. It''s the biggest option in Corsair''s lineup, with the Corsair XENEON 34WQHD240-C and the Corsair XENEON 27QHD240 as the smaller options. With a 3440x1440 resolution and 240Hz refresh rate, it uses a panel from LG Display, like the LG 45GR95QE-B, but the main difference is that it has a bendable screen that you can adjust up to a curve of 800R. It has typical gaming features, like HDMI 2.1 bandwidth and FreeSync and G-SYNC Compatibility VRR. It even has productivity features like a KVM switch and a USB-C port with DisplayPort Alt Mode. As it''s an OLED panel, it has a few settings to reduce the risk of permanent burn-in, and Corsair advertises a warranty for OLED burn-in, but there are limitations to its warranty.',
      7999.00,
      '../ProductImage/monitor/corsair-xeneon-flex-45wqhd240.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P31',
      'C04',
      'B08', 
      'Dell Alienware AW2725DF',
      '27" 360Hz QD-OLED Gaming Monitor',
      'Immerse yourself in splendid visuals and thrilling speeds with our fastest QD-OLED gaming monitor, featuring QHD resolution, 360Hz refresh rate, and VESA DisplayHDR True Black 400.',
      3599.00,
      '../ProductImage/monitor/dell-alienware-aw2725df.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    ),
    (
      'P32',
      'C04',
      'B06', 
      'HyperX Armada 27',
      '27" Gaming Monitor',
      'The HyperX Armada 27 is a 27-inch QHD/IPS gaming monitor with 165 Hz, Adaptive-Sync, HDR and extended color with a mounting arm instead of a stand.',
      2299.00,
      '../ProductImage/monitor/hyperx-armada-27.jpg',
      0.0,
      0,
      '2026-04-16 10:00:00'
    );
    `);

    await db.executeSql(`
      INSERT OR IGNORE INTO ProductColors
      (product_color_id, product_id, color_name, stock_qty, image_url)
      VALUES
      ('PC01', 'P01', 'Black', 10, '../ProductImage/mouse/asus-rog-gladius-iii-B.jpg'),
      ('PC02', 'P01', 'White', 18, '../ProductImage/mouse/asus-rog-gladius-iii-W.jpg'),
      ('PC03', 'P02', 'Black', 23, '../ProductImage/mouse/asus-tuf-gaming-m4.jpg'),
      ('PC04', 'P03', 'Black', 13, '../ProductImage/mouse/razer-deathadder-v3pro-B.jpg'),
      ('PC05', 'P03', 'White', 17, '../ProductImage/mouse/razer-deathadder-v3pro-W.jpg'),
      ('PC06', 'P04', 'Black', 20, '../ProductImage/mouse/razer-viper-v3pro-B.jpg'),
      ('PC07', 'P04', 'White', 15, '../ProductImage/mouse/razer-viper-v3pro-W.jpg'),
      ('PC08', 'P05', 'Black', 9, '../ProductImage/mouse/logitech-g-pro-x-superlight-2-B.jpg'),
      ('PC09', 'P05', 'White', 12, '../ProductImage/mouse/logitech-g-pro-x-superlight-2-W.jpg'),
      ('PC10', 'P05', 'Pink', 17, '../ProductImage/mouse/logitech-g-pro-x-superlight-2-P.jpg'),
      ('PC11', 'P06', 'Black', 22, '../ProductImage/mouse/logitech-g502-x-lightspeed-B.jpg'),
      ('PC12', 'P06', 'White', 19, '../ProductImage/mouse/logitech-g502-x-lightspeed-W.jpg'),
      ('PC13', 'P07', 'Black', 14, '../ProductImage/mouse/corsair-m75-air-B.jpg'),
      ('PC14', 'P07', 'White', 12, '../ProductImage/mouse/corsair-m75-air-W.jpg'),
      ('PC15', 'P08', 'Black', 16, '../ProductImage/mouse/steelseries-prime-wireless.jpg'),
      ('PC16', 'P09', 'Black', 21, '../ProductImage/keyboard/asus-rog-strix-scope-rx.jpg'),
    ('PC17', 'P10', 'Black', 18, '../ProductImage/keyboard/asus-tug-gaming-k3.jpg'),
    ('PC18', 'P11', 'Black', 6, '../ProductImage/keyboard/razer-blackwidow-v4-pro.jpg'),
    ('PC19', 'P12', 'Black', 11, '../ProductImage/keyboard/razer-huntsman-mini-B.jpg'),
    ('PC20', 'P12', 'White', 9, '../ProductImage/keyboard/razer-huntsman-mini-W.jpg'),
    ('PC21', 'P13', 'Black', 14, '../ProductImage/keyboard/logitech-g-pro-x-tkl-B.jpg'),
    ('PC22', 'P13', 'White', 10, '../ProductImage/keyboard/logitech-g-pro-x-tkl-W.jpg'),
    ('PC23', 'P13', 'Pink', 25, '../ProductImage/keyboard/logitech-g-pro-x-tkl-P.jpg'),
    ('PC24', 'P14', 'Black', 17, '../ProductImage/keyboard/logitech-g913-lightspeed.jpg'),
    ('PC25', 'P15', 'Black', 13, '../ProductImage/keyboard/corsair-k70-rgb-pro-B.jpg'),
    ('PC26', 'P15', 'White', 8, '../ProductImage/keyboard/corsair-k70-rgb-pro-W.jpg'),
    ('PC27', 'P16', 'Black', 19, '../ProductImage/keyboard/steelseries-apex-pro-tkl.jpg'),
    ('PC28', 'P17', 'Black', 12, '../ProductImage/audio/asus-rog-delta-s-animate.jpg'),
    ('PC29', 'P18', 'Black', 22, '../ProductImage/audio/asus-tuf-gaming-h3-B.jpg'),
    ('PC30', 'P18', 'White', 16, '../ProductImage/audio/asus-tuf-gaming-h3-W.jpg'),
    ('PC31', 'P18', 'Grey', 22, '../ProductImage/audio/asus-tuf-gaming-h3-G.jpg'),
    ('PC32', 'P18', 'Red', 16, '../ProductImage/audio/asus-tuf-gaming-h3-R.jpg'),
    ('PC33', 'P19', 'Black', 14, '../ProductImage/audio/razer-blackshark-v2-pro-B.jpg'),
    ('PC34', 'P19', 'White', 10, '../ProductImage/audio/razer-blackshark-v2-pro-W.jpg'),
    ('PC35', 'P20', 'Black', 0, '../ProductImage/audio/razer-kraken-v3-x.jpg'),
    ('PC36', 'P21', 'Black', 20, '../ProductImage/audio/logitech-g-pro-x.jpg'),
    ('PC37', 'P22', 'Black', 13, '../ProductImage/audio/logitech-g435-lightspeed-B.jpg'),
    ('PC38', 'P22', 'White', 19, '../ProductImage/audio/logitech-g435-lightspeed-W.jpg'),
    ('PC39', 'P22', 'Blue', 32, '../ProductImage/audio/logitech-g435-lightspeed-P.jpg'),
    ('PC40', 'P23', 'Red', 15, '../ProductImage/audio/hyperx-cloud-ii-core-wireless.jpg'),
    ('PC41', 'P24', 'Black', 9, '../ProductImage/audio/steelseries-arctis-nova-7p-B.jpg'),
    ('PC42', 'P24', 'White', 11, '../ProductImage/audio/steelseries-arctis-nova-7p-W.jpg'),
    ('PC43', 'P24', 'Magenta', 19, '../ProductImage/audio/steelseries-arctis-nova-7p-M.jpg'),
    ('PC44', 'P25', 'Black', 17, '../ProductImage/monitor/asus-tuf-gaming-vg27aq.jpg'),
    ('PC45', 'P26', 'Black', 14, '../ProductImage/monitor/asus-rog-strix-xg27acs.jpg'),
    ('PC46', 'P27', 'Black', 8, '../ProductImage/monitor/razer-raptor-27.jpg'),
    ('PC47', 'P28', 'Black', 12, '../ProductImage/monitor/aoc-q27g3xmn.jpg'),
    ('PC48', 'P29', 'Black', 9, '../ProductImage/monitor/corsair-xeneon-27qhd240.jpg'),
    ('PC49', 'P30', 'Black', 7, '../ProductImage/monitor/corsair-xeneon-flex-45wqhd240.jpg'),
    ('PC50', 'P31', 'Black', 5, '../ProductImage/monitor/dell-alienware-aw2725df.jpg'),
    ('PC51', 'P32', 'Black', 11, '../ProductImage/monitor/hyperx-armada-27.jpg')
      `);

    console.log('Sample product data inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample product:', error);
    throw error;
  }
};

// ============================================
// GET ALL PRODUCTS
// Retrieves all products with category and brand information
// ============================================
export const getAllProducts = async () => {
  const db = await getDBConnection();
  const results = await db.executeSql(`
    SELECT
      p.product_id,
      p.name AS product_name,
      c.name AS category_name,
      b.brand_name,
      p.price,
      p.image_url,
      p.average_rating,
      p.review_count
    FROM Products p
    INNER JOIN Categories c ON p.category_id = c.category_id
    INNER JOIN Brands b ON p.brand_id = b.brand_id
    ORDER BY p.product_id;
  `);
  return results[0].rows.raw();
};

// GET PRODUCT COLORS
// Retrieves all available color variations for a specific product
export const getColorsByProductId = async (productId: string) => {
  const db = await getDBConnection();
  const results = await db.executeSql(
    `SELECT * FROM ProductColors WHERE product_id = ? ORDER BY product_color_id;`,
    [productId]
  );
  return results[0].rows.raw();
};

// GET LATEST PRODUCTS
// Retrieves the 5 most recently added products
export const getLatestProducts = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`
    SELECT *
    FROM Products
    ORDER BY datetime(created_at) DESC, product_id DESC
    LIMIT 5;
  `);

  return results[0].rows.raw();
};

// GET ALL CATEGORIES
// Retrieves all product categories
export const getAllCategories = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`
    SELECT * FROM Categories;
  `);

  return results[0].rows.raw();
};

// GET RANDOM PRODUCTS
// Retrieves random products for recommendation section
export const getRandomProducts = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`
    SELECT *
    FROM Products
    ORDER BY RANDOM()
    LIMIT 4;
  `);

  return results[0].rows.raw();
};

// GET ALL BRANDS
// Retrieves all available product brands
export const getAllBrands = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`
    SELECT * FROM Brands;
  `);

  return results[0].rows.raw();
};

// SEARCH PRODUCTS
// Searches products based on name, category, or brand using keyword
export const searchProducts = async (keyword: string) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `
    SELECT
      p.product_id,
      p.name AS product_name,
      c.name AS category_name,
      b.brand_name,
      p.price,
      p.image_url,
      p.description,
      p.details,
      p.average_rating,
      p.review_count
    FROM Products p
    INNER JOIN Categories c ON p.category_id = c.category_id
    INNER JOIN Brands b ON p.brand_id = b.brand_id
    WHERE
      LOWER(p.name) LIKE LOWER(?) OR
      LOWER(c.name) LIKE LOWER(?) OR
      LOWER(b.brand_name) LIKE LOWER(?)
    ORDER BY p.product_id;
    `,
    [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
  );

  return results[0].rows.raw();
};

// GET SOLD COUNT
// Calculates total quantity sold for a specific product
export const getSoldCountByProductId = async (productId: string) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `
    SELECT SUM(quantity) as total_sold
    FROM OrderItems
    WHERE product_id = ?;
    `,
    [productId]
  );

  const value = results[0].rows.item(0).total_sold;

  return value ? value : 0;
};

// GET PRODUCTS BY CATEGORY
// Retrieves products filtered by selected category
export const getProductsByCategoryId = async (categoryId: string) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `
    SELECT
      p.product_id,
      p.name AS product_name,
      p.price,
      p.image_url,
      p.description,
      p.details,
      p.average_rating,
      p.review_count,
      c.category_id,
      c.name AS category_name,
      b.brand_name
    FROM Products p
    INNER JOIN Categories c ON p.category_id = c.category_id
    INNER JOIN Brands b ON p.brand_id = b.brand_id
    WHERE p.category_id = ?
    ORDER BY p.product_id;
    `,
    [categoryId]
  );

  return results[0].rows.raw();
};

// GET PRODUCTS BY BRAND
// Retrieves products filtered by selected brand
export const getProductsByBrandId = async (brandId: string) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `
    SELECT
      p.product_id,
      p.name AS product_name,
      p.price,
      p.image_url,
      p.description,
      p.details,
      p.average_rating,
      p.review_count,
      b.brand_id,
      b.brand_name,
      c.name AS category_name
    FROM Products p
    INNER JOIN Brands b ON p.brand_id = b.brand_id
    INNER JOIN Categories c ON p.category_id = c.category_id
    WHERE p.brand_id = ?
    ORDER BY p.product_id;
    `,
    [brandId]
  );

  return results[0].rows.raw();
};

// GET PRODUCT BY COLOR ID
// Retrieves product details based on selected color variation
export const getProductByColorId = async (productColorId: string) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `
    SELECT
      pc.product_color_id,
      pc.color_name,
      pc.image_url AS color_image_url,
      p.product_id,
      p.name,
      p.price,
      p.image_url AS product_image_url
    FROM ProductColors pc
    INNER JOIN Products p ON pc.product_id = p.product_id
    WHERE pc.product_color_id = ?;
    `,
    [productColorId]
  );

  if (results[0].rows.length > 0) {
    return results[0].rows.item(0);
  }

  return null;
};



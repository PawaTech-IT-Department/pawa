const products = [
  {
    id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image: "images/products/laptop-ultrabook-x1.jpg",
    name: "Ultrabook X1 Pro Laptop",
    rating: {
      stars: 4.5,
      count: 87,
    },
    priceCents: 109000,
    keywords: ["laptop", "ultrabook", "computers"],
    description:
      "Experience lightning-fast performance with the Ultrabook X1 Pro, perfect for multitasking and heavy-duty applications.",
  },
  {
    id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    image: "images/products/wireless-printer-jetpro.jpg",
    name: "JetPro Wireless Inkjet Printer",
    rating: {
      stars: 4,
      count: 127,
    },
    priceCents: 20999,
    keywords: ["printer", "wireless", "office"],
    description:
      "Print from anywhere with the JetPro Wireless Inkjet Printer, offering high-quality prints and easy connectivity.",
  },
  {
    id: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
    image: "images/products/gaming-mouse-rgb.jpg",
    name: "RGB Gaming Mouse",
    rating: {
      stars: 4.5,
      count: 56,
    },
    priceCents: 7999,
    keywords: ["accessories", "mouse", "gaming"],
    type: "accessory",
    description:
      "Enhance your gaming experience with the RGB Gaming Mouse, featuring customizable lighting and precise controls.",
  },
  {
    id: "54e0eccd-8f36-462b-b68a-8182611d9add",
    image: "images/products/4k-projector-hd.jpg",
    name: "HD 4K Home Projector",
    rating: {
      stars: 5,
      count: 2197,
    },
    priceCents: 189999,
    keywords: ["projector", "4k", "home theater"],
    description:
      "Transform your living room into a cinema with the HD 4K Home Projector, delivering stunning visuals and immersive sound.",
  },
  {
    id: "3ebe75dc-64d2-4137-8860-1f5a963e534b",
    image: "images/products/wireless-keyboard.jpg",
    name: "Wireless Mechanical Keyboard",
    rating: {
      stars: 4,
      count: 37,
    },
    priceCents: 20699,
    keywords: ["keyboard", "accessories", "wireless"],
    description:
      "Type in comfort with the Wireless Mechanical Keyboard, offering tactile feedback and seamless wireless connectivity.",
  },
  {
    id: "8c9c52b5-5a19-4bcb-a5d1-158a74287c53",
    image: "images/products/usb-c-hub.jpg",
    name: "USB-C Multiport Hub",
    rating: {
      stars: 4.5,
      count: 175,
    },
    priceCents: 3499,
    keywords: ["accessories", "usb-c", "hub"],
    description:
      "Expand your connectivity with the USB-C Multiport Hub, supporting multiple devices and high-speed data transfer.",
  },
  {
    id: "dd82ca78-a18b-4e2a-9250-31e67412f98d",
    image: "images/products/noise-cancelling-headphones.jpg",
    name: "Noise Cancelling Headphones",
    rating: {
      stars: 4.5,
      count: 317,
    },
    priceCents: 24000,
    keywords: ["headphones", "audio", "accessories"],
    description:
      "Immerse yourself in pure sound with the Noise Cancelling Headphones, blocking out distractions for an unparalleled listening experience.",
  },
  {
    id: "77919bbe-0e56-475b-adde-4f24dfed3a04",
    image: "images/products/portable-ssd-1tb.jpg",
    name: "Portable SSD 1TB",
    rating: {
      stars: 4.5,
      count: 144,
    },
    priceCents: 35999,
    keywords: ["storage", "ssd", "accessories"],
    description:
      "Store and transfer large files effortlessly with the Portable SSD 1TB, offering fast speeds and reliable performance.",
  },
  {
    id: "3fdfe8d6-9a15-4979-b459-585b0d0545b9",
    image: "images/products/wireless-router.jpg",
    name: "Dual-Band Wireless Router",
    rating: {
      stars: 4.5,
      count: 305,
    },
    priceCents: 28999,
    keywords: ["network", "router", "wireless"],
    description:
      "Enjoy seamless internet connectivity with the Dual-Band Wireless Router, providing strong signals and stable performance.",
  },
  {
    id: "58b4fc92-e98c-42aa-8c55-b6b79996769a",
    image: "images/products/bluetooth-speaker.jpg",
    name: "Bluetooth Portable Speaker",
    rating: {
      stars: 4,
      count: 89,
    },
    priceCents: 33900,
    keywords: ["audio", "speaker", "bluetooth"],
    description:
      "Fill your space with rich, clear sound using the Bluetooth Portable Speaker, perfect for both indoor and outdoor use.",
  },
  {
    id: "a1b2c3d4-e5f6-4789-8101-112131415161",
    image: "images/products/27-inch-monitor.jpg",
    name: "27-Inch 4K Gaming Monitor",
    rating: {
      stars: 4.8,
      count: 456,
    },
    priceCents: 39999,
    keywords: ["monitor", "gaming", "4k"],
    description:
      "Experience gaming like never before with the 27-Inch 4K Gaming Monitor, offering stunning visuals and smooth gameplay.",
  },
  {
    id: "b2c3d4e5-f6a7-489b-8212-223242526272",
    image: "images/products/ergonomic-chair.jpg",
    name: "Ergonomic Gaming Chair",
    rating: {
      stars: 4.7,
      count: 234,
    },
    priceCents: 29999,
    keywords: ["chair", "gaming", "ergonomic"],
    description:
      "Enhance your gaming setup with the Ergonomic Gaming Chair, designed for comfort and support during long gaming sessions.",
  },
  {
    id: "c3d4e5f6-a7b8-49ac-8323-334353637383",
    image: "images/products/3d-printer.jpg",
    name: "High-Precision 3D Printer",
    rating: {
      stars: 4.6,
      count: 189,
    },
    priceCents: 49999,
    keywords: ["3d printer", "tech", "creative"],
    description:
      "Bring your ideas to life with the High-Precision 3D Printer, capable of producing detailed and accurate 3D models.",
  },
  {
    id: "d4e5f6a7-b8c9-4abd-8434-445464748494",
    image: "images/products/streaming-webcam.jpg",
    name: "HD Streaming Webcam",
    rating: {
      stars: 4.4,
      count: 112,
    },
    priceCents: 14999,
    keywords: ["webcam", "streaming", "hd"],
    description:
      "Stream in high definition with the HD Streaming Webcam, ensuring clear and crisp video quality for your online presence.",
  },
  {
    id: "e5f6a7b8-c9da-4bce-8545-556575859605",
    image: "images/products/portable-charger.jpg",
    name: "Portable Power Bank",
    rating: {
      stars: 4.3,
      count: 201,
    },
    priceCents: 19999,
    keywords: ["power bank", "portable", "charger"],
    description:
      "Stay powered on the go with the Portable Power Bank, offering multiple charges for your devices with its high-capacity battery.",
  },
  {
    id: "f6a7b8c9-daea-4cbf-8656-667686970716",
    image: "images/products/blue-light-glasses.jpg",
    name: "Blue Light Blocking Glasses",
    rating: {
      stars: 4.2,
      count: 156,
    },
    priceCents: 12999,
    keywords: ["glasses", "blue light", "eye protection"],
    description:
      "Protect your eyes from harmful blue light with these Blue Light Blocking Glasses, perfect for long hours in front of screens.",
  },
  {
    id: "a7b8c9da-ebfc-4dce-8767-778798081828",
    image: "images/products/usb-c-docking-station.jpg",
    name: "USB-C Docking Station",
    rating: {
      stars: 4.9,
      count: 345,
    },
    priceCents: 49999,
    keywords: ["docking station", "usb-c", "accessories"],
    description:
      "Simplify your workspace with the USB-C Docking Station, providing multiple ports for all your peripherals in one convenient location.",
  },
  {
    id: "b8c9daeb-fcda-4edf-8878-889809192939",
    image: "images/products/laser-mouse.jpg",
    name: "High-Precision Laser Mouse",
    rating: {
      stars: 4.6,
      count: 212,
    },
    priceCents: 17999,
    keywords: ["mouse", "laser", "precision"],
    description:
      "Achieve unmatched accuracy with the High-Precision Laser Mouse, ideal for gaming and graphic design tasks.",
  },
  {
    id: "c9daebfc-dceb-4fef-8989-990910203040",
    image: "images/products/portable-hdmi-adapter.jpg",
    name: "Portable HDMI Adapter",
    rating: {
      stars: 4.1,
      count: 98,
    },
    priceCents: 10999,
    keywords: ["hdmi adapter", "portable", "accessories"],
    description:
      "Easily connect your devices with the Portable HDMI Adapter, supporting high-definition video and audio transmission.",
  },
  {
    id: "daebfcdc-efda-4ff0-8a9a-0a1b2c3d4e5f",
    image: "images/products/usb-c-to-hdmi-cable.jpg",
    name: "USB-C to HDMI Cable",
    rating: {
      stars: 4.7,
      count: 256,
    },
    priceCents: 15999,
    keywords: ["usb-c", "hdmi", "cable"],
    description:
      "Connect your USB-C devices to HDMI displays with ease using this high-quality USB-C to HDMI Cable.",
  },
  {
    id: "ebfcdcef-fdab-4001-8bac-1b2c3d4e5f6a",
    image: "images/products/portable-laptop-cooler.jpg",
    name: "Portable Laptop Cooler",
    rating: {
      stars: 4.5,
      count: 167,
    },
    priceCents: 18999,
    keywords: ["laptop cooler", "portable", "cooling"],
    description:
      "Keep your laptop running smoothly with the Portable Laptop Cooler, ensuring optimal performance and preventing overheating.",
  },
  {
    id: "fcdceffd-abcd-4112-8cbd-2c3d4e5f6a7b",
    image: "images/products/usb-c-to-usb-a-adapter.jpg",
    name: "USB-C to USB-A Adapter",
    rating: {
      stars: 4.3,
      count: 134,
    },
    priceCents: 9999,
    keywords: ["usb-c", "usb-a", "adapter"],
    description:
      "Connect your USB-A devices to USB-C ports with the USB-C to USB-A Adapter, ensuring compatibility and convenience.",
  },
  {
    id: "dceffdab-cdef-4223-8dce-3d4e5f6a7b8c",
    image: "images/products/portable-laptop-stand.jpg",
    name: "Portable Laptop Stand",
    rating: {
      stars: 4.4,
      count: 145,
    },
    priceCents: 16999,
    keywords: ["laptop stand", "portable", "ergonomic"],
    description:
      "Improve your posture and workspace with the Portable Laptop Stand, providing a comfortable and ergonomic viewing angle.",
  },
  {
    id: "effdabcde-fabc-4334-8edf-4e5f6a7b8c9d",
    image: "images/products/usb-c-to-vga-adapter.jpg",
    name: "USB-C to VGA Adapter",
    rating: {
      stars: 4.2,
      count: 119,
    },
    priceCents: 12999,
    keywords: ["usb-c", "vga", "adapter"],
    description:
      "Connect your USB-C devices to VGA displays with the USB-C to VGA Adapter, supporting high-resolution video output.",
  },
  {
    id: "fdabcdef-abcde-4445-8fef-5f6a7b8c9dae",
    image: "images/products/portable-laptop-bag.jpg",
    name: "Portable Laptop Bag",
    rating: {
      stars: 4.6,
      count: 203,
    },
    priceCents: 24999,
    keywords: ["laptop bag", "portable", "protection"],
    description:
      "Carry your laptop in style and safety with the Portable Laptop Bag, designed to protect your device from bumps and scratches.",
  },
  {
    id: "abcdefabc-defab-4556-90ef-6a7b8c9daef1",
    image: "images/products/usb-c-to-displayport-adapter.jpg",
    name: "USB-C to DisplayPort Adapter",
    rating: {
      stars: 4.8,
      count: 278,
    },
    priceCents: 19999,
    keywords: ["usb-c", "displayport", "adapter"],
    description:
      "Connect your USB-C devices to DisplayPort monitors with the USB-C to DisplayPort Adapter, ensuring high-quality visuals.",
  },
  {
    id: "bcdefabcd-efabc-4667-91fe-7b8c9daef202",
    image: "images/products/portable-laptop-charger.jpg",
    name: "Portable Laptop Charger",
    rating: {
      stars: 4.5,
      count: 188,
    },
    priceCents: 22999,
    keywords: ["laptop charger", "portable", "power"],
    description:
      "Keep your laptop charged on the go with the Portable Laptop Charger, offering fast charging and high-capacity battery.",
  },
  {
    id: "cdefabcd-efabcd-4778-92fd-8c9daef20303",
    image: "images/products/usb-c-to-ethernet-adapter.jpg",
    name: "USB-C to Ethernet Adapter",
    rating: {
      stars: 4.4,
      count: 151,
    },
    priceCents: 17999,
    keywords: ["usb-c", "ethernet", "adapter"],
    description:
      "Connect your USB-C devices to Ethernet networks with the USB-C to Ethernet Adapter, ensuring stable and fast internet connectivity.",
  },
  {
    id: "defabcdef-abcd-4889-93fe-9daef2030404",
    image: "images/products/portable-laptop-screen-protector.jpg",
    name: "Portable Laptop Screen Protector",
    rating: {
      stars: 4.3,
      count: 126,
    },
    priceCents: 11999,
    keywords: ["screen protector", "laptop", "protection"],
    description: "Protect your laptop screen from screen damage.",
  },
];

const imagesNames = [];
products.forEach((product) => {
  imagesNames.push(product.image.slice(16));
});

// Export image names to CSV file (Node.js only)
const fs = require("fs");
const path = require("path");
const csvPath = path.join(__dirname, "../imagesDownloader/imageNames.csv");
fs.writeFileSync(csvPath, imagesNames.join("\n"), "utf8");
console.log("Image names saved to", csvPath);

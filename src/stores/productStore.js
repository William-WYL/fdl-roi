import { create } from "zustand";

const useProductStore = create((set) => ({
  // Products data
  products: [
    {
      id: 1,
      sku: "101247",
      name: '4" LED Floating Gimbal, 9W, 5CCT selectable, 740lm, dimmable, 120V, round, white',
      ProductNo: "FDFG-4-9W-5CCT-WH",
      size: 4,
      shape: "round",
      finish: "white",

      wattageOptions: [9],
      voltageOptions: [120],
      lumensOptions: [740],

      cctOptions: [2700, 3000, 3500, 4000, 5000],
      dimmable: { min: 10, max: 100 },

      price: 13.5,
      bulkPricing: {
        enabled: true,
        threshold: 18,
        bulkPrice: 12.83,
      },

      category: "gimbal",
      type: "recessed",

      images: [
        "/images/products/101247a.png",
        "/images/products/101247b.png",
        "/images/products/101247c.png",
      ],
      specsLink:
        "https://drive.google.com/drive/folders/1Ni89GXh6H4ep-g8Q20EyK3qs-DZ34Mmk",
    },
    {
      id: 2,
      sku: "111350",
      name: "LED Highbay UFO Multi-Series, Pre-Select 3 Wattage 80-120-150 watts, Pre-Select 3 CCT 3K-4K-5K, 12394 -23699 lms, IP65 Rated, 9 ft Power Cord, 120-347V",
      ProductNo: "FDUFO-80-120-150W-3CCT-120-347",

      size: 13.19,
      shape: "round",
      finish: "black",

      wattageOptions: [80, 120, 150],
      voltageOptions: [120, 347],
      lumensOptions: [
        12394, 13695, 13618, 17395, 19698, 18983, 20882, 23699, 23699,
      ],

      cctOptions: [3000, 4000, 5000],
      dimmable: { min: 10, max: 100 },

      price: 95.0,

      category: "Highbay UFO",
      type: "general",

      images: [
        "/images/products/111350a.png",
        "/images/products/111350b.png",
        "/images/products/111350c.png",
      ],
      specsLink:
        "https://drive.google.com/drive/folders/1l31rmhfzKozj_eRa83d4DF2EZF9MDp05",
    },
    {
      id: 3,
      sku: "100003",
      name: "LED Panel 2x2, 32W, 3800lm, ultra-thin, dimmable, cool white",
      ProductNo: "FDPN-2x2-32W",

      size: 2,
      shape: "square",
      finish: "white",

      wattageOptions: [32, 48, 64],
      voltageOptions: [120, 240],
      lumensOptions: [3800, 5400, 7200],

      cctOptions: [3500, 4000, 5000, 6500],
      dimmable: { min: 10, max: 100 },

      price: 45.99,

      category: "panel",
      type: "panel_light",

      images: ["/images/placeholder.jpg"],
      specsLink: "https://example.com/specs/100003-panel-specs.pdf",
    },
    {
      id: 4,
      sku: "100004",
      name: "LED Tube T8, 10W, 1200lm, 2ft, ballast compatible, warm white",
      ProductNo: "FDTB-T8-10W",

      size: 2,
      shape: "tube",
      finish: "white",

      wattageOptions: [10, 14, 18],
      voltageOptions: [120],
      lumensOptions: [1200, 1680, 2160],

      cctOptions: [2700, 3000, 4000],
      dimmable: { min: 0, max: 100 },

      price: 6.99,

      category: "tube",
      type: "fluorescent_replacement",

      images: ["/images/placeholder.jpg"],
      specsLink: "https://example.com/specs/100004-tube-specs.pdf",
    },
    {
      id: 5,
      sku: "100005",
      name: "LED Flood Light, 50W, 5000lm, outdoor rated, 5000K daylight",
      ProductNo: "FDFL-50W-5000K",

      size: 5,
      shape: "flood",
      finish: "black",

      wattageOptions: [50, 75, 100],
      voltageOptions: [120, 240],
      lumensOptions: [5000, 7500, 10000],

      cctOptions: [5000],
      dimmable: { min: 0, max: 100 },

      price: 35.99,

      category: "flood",
      type: "outdoor",

      images: ["/images/placeholder.jpg"],
      specsLink: "https://example.com/specs/100005-flood-specs.pdf",
    },
    {
      id: 6,
      sku: "100006",
      name: "LED Strip Light, 7W, 300lm, 16ft flexible strip, RGB capable",
      ProductNo: "FDSL-16FT-7W",

      size: 16,
      shape: "strip",
      finish: "clear",

      wattageOptions: [7, 12, 18],
      voltageOptions: [12, 24],
      lumensOptions: [300, 540, 810],

      cctOptions: [2700, 3000, 4000, 5000, "RGB"],
      dimmable: { min: 0, max: 100 },

      price: 4.99,

      category: "strip",
      type: "accent",

      images: ["/images/placeholder.jpg"],
      specsLink: "https://example.com/specs/100006-strip-specs.pdf",
    },
  ],

  // Get all products
  getProducts: () => useProductStore.getState().products,

  // Get product by ID
  getProductById: (id) =>
    useProductStore.getState().products.find((p) => p.id === id),

  // Add or update a product
  addProduct: (product) =>
    set((state) => {
      const exists = state.products.find((p) => p.id === product.id);
      if (exists) {
        return {
          products: state.products.map((p) =>
            p.id === product.id ? product : p,
          ),
        };
      }
      return { products: [...state.products, product] };
    }),

  // Delete a product
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Search products by name or SKU
  searchProducts: (query) => {
    const state = useProductStore.getState();
    if (!query || query.trim() === "") {
      return state.products;
    }

    const lowerQuery = query.toLowerCase();
    return state.products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toString().includes(query),
    );
  },

  // Get effective price based on bulk pricing
  getEffectivePrice: (productId, quantity = 1) => {
    const state = useProductStore.getState();
    const product = state.products.find((p) => p.id === productId);
    if (!product) return 0;

    if (
      product.bulkPricing &&
      product.bulkPricing.enabled &&
      quantity >= product.bulkPricing.threshold
    ) {
      return product.bulkPricing.bulkPrice;
    }
    return product.price;
  },
}));

export default useProductStore;

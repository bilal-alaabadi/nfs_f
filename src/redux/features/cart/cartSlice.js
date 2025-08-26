// ========================= src/redux/slices/cartSlice.js =========================
import { createSlice } from "@reduxjs/toolkit";

// استعادة الحالة من localStorage إن وجدت
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("cartState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};

const initialState = loadState() || {
  products: [],
  selectedItems: 0,
  totalPrice: 0, // بالعملة الأساسية (ر.ع.)
  shippingFee: 2, // بالعملة الأساسية
  country: "عمان",
};

// مفتاح فريد للبند = المنتج + القياسات
const makeLineKey = (p) => {
  const m = p?.measurements ? JSON.stringify(p.measurements) : "{}";
  return `${p._id || p.productId || ""}::${m}`;
};

// حساب إجمالي السطر بعد خصم الأزواج في العملة الأساسية (ر.ع.)
const lineTotalBase = (product) => {
  const unit = product.price || 0; // سعر الوحدة بالأساس
  const qty = product.quantity || 0;
  const isShayla =
    product.category === "الشيلات فرنسية" ||
    product.category === "الشيلات سادة";
  const pairs = isShayla ? Math.floor(qty / 2) : 0;
  const pairDiscount = pairs * 1; // 1 ر.ع لكل زوج
  const subtotal = unit * qty;
  return Math.max(0, subtotal - pairDiscount);
};

export const setSelectedItems = (state) =>
  state.products.reduce((total, product) => total + product.quantity, 0);

export const setTotalPrice = (state) =>
  state.products.reduce((total, product) => total + lineTotalBase(product), 0);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      const _id = payload._id || payload.productId;
      const quantityToAdd = Math.max(1, Number(payload.quantity || 1));
      const lineKey = makeLineKey(payload);

      // ابحث عن بند مطابق لنفس المنتج ونفس القياسات
      const existing = state.products.find(
        (p) => p._id === _id && makeLineKey(p) === lineKey
      );

      if (existing) {
        existing.quantity += quantityToAdd;
      } else {
        state.products.push({
          ...payload,
          _id,
          quantity: quantityToAdd,
        });
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    updateQuantity: (state, action) => {
      // يدعم { id, type, lineKey } للحالات المتقدمة، ويبقى متوافقاً مع السابق
      const { id, type, lineKey } = action.payload;
      const product = state.products.find((p) => {
        if (lineKey) return makeLineKey(p) === lineKey;
        return p._id === id;
      });

      if (product) {
        if (type === "increment") product.quantity += 1;
        else if (type === "decrement" && product.quantity > 1)
          product.quantity -= 1;
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    removeFromCart: (state, action) => {
      const { id, lineKey } = action.payload || {};
      state.products = state.products.filter((p) => {
        if (lineKey) return makeLineKey(p) !== lineKey;
        return p._id !== id;
      });

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      saveState(state);
    },

    clearCart: (state) => {
      state.products = [];
      state.selectedItems = 0;
      state.totalPrice = 0;
      saveState(state);
    },

    setCountry: (state, action) => {
      state.country = action.payload;
      state.shippingFee = action.payload === "الإمارات" ? 4 : 2;
      saveState(state);
    },

    loadCart: (state, action) => {
      return action.payload;
    },
  },
});

// حفظ الحالة
const saveState = (state) => {
  try {
    localStorage.setItem("cartState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save cart state:", err);
  }
};

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCountry,
  loadCart,
} = cartSlice.actions;

export default cartSlice.reducer;

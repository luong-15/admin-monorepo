export interface AdminSettings {
  store_name: string;
  store_description: string;
  email: string;
  phone: string;
  address: string;
  currency: "VND" | "USD" | "EUR";
  timezone: string;
  maintenance_mode: boolean;
  auto_approve_orders: boolean;
  default_tax_rate: number;
  logo_url: string;
  favicon_url: string;
}

export const defaultSettings: AdminSettings = {
  store_name: "TechStore VN",
  store_description: "Cửa hàng công nghệ hàng đầu Việt Nam",
  email: "contact@techstore.vn",
  phone: "0123456789",
  address: "123 Nguyễn Trãi, Quận 5, TP.HCM",
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  maintenance_mode: false,
  auto_approve_orders: false,
  default_tax_rate: 10,
  logo_url: "",
  favicon_url: "",
};

// Runtime settings store (react context or zustand)
export const useAdminSettings = () => {
  // Implement with zustand or context
  return {
    settings: defaultSettings,
    updateSetting: (key: keyof AdminSettings, value: any) => {},
    saveAll: () => {},
    loading: false,
  };
};

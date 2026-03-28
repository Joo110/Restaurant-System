import { useTranslation } from "react-i18next";

export default function ReceiptPaperBody() {
  const { t } = useTranslation();

  const items = [
    { name: "Cheeseburger x 2",      price: 24.69 },
    { name: "Premium Cola x 1 +1",   price: 9.99  },
    { name: "Vanilla Theme x 2",     price: 10.00 },
  ];

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const vat      = subtotal * 0.1;
  const total    = subtotal + vat;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans py-10">
      <div className="bg-white w-64 rounded-2xl shadow-xl p-6 font-mono text-xs">

        {/* Header */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-10 h-10 bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <p className="font-bold text-sm text-gray-900 uppercase tracking-widest">Restaurant Name</p>
          <p className="text-gray-400 text-[10px] mt-1">Downtown Branch, Zone 1</p>
          <p className="text-gray-400 text-[10px]">123 Main Street, Flavor City</p>
          <p className="text-gray-400 text-[10px]">Tel: 01-383-221 8938</p>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        {/* Order info */}
        <div className="space-y-1 mb-4 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-500">{t("orderHash")}</span>
            <span className="font-semibold">10095</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("date")}</span>
            <span>Oct 26, 2023</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("cashier")}</span>
            <span>Ahmed S.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("table")}</span>
            <span>Dine-In / Table 5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("guests")}</span>
            <span>12</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        {/* Items */}
        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-gray-700 flex-1 pr-2">{item.name}</span>
              <span className="font-semibold">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        {/* Totals */}
        <div className="space-y-1.5 text-[11px] mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">{t("subtotal")}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("vat")} (10%)</span>
            <span>${vat.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gray-300 mb-4" />

        <div className="flex justify-between font-bold text-sm mb-4">
          <span>{t("total")}</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Payment */}
        <div className="space-y-1 text-[10px] text-gray-500 mb-4">
          <div className="flex justify-between">
            <span>{t("paymentAmount")}</span>
            <span className="font-medium">VISA ****1253</span>
          </div>
          <div className="flex justify-between">
            <span>{t("authCode")}</span>
            <span>9BQKM</span>
          </div>
          <div className="flex justify-between">
            <span>{t("refNo")}</span>
            <span>8274-RX-11</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        {/* Barcode */}
        <div className="flex justify-center gap-0.5 mb-3">
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800"
              style={{ width: i % 3 === 0 ? 3 : 1, height: 24 }}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-400 leading-relaxed">
          {t("thankYou")}<br />{t("enjoyedMeal")}
        </p>
      </div>
    </div>
  );
}
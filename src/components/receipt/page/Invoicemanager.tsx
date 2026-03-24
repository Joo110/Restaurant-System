import { useState } from "react";

interface InvoiceItem {
  name: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

export default function InvoiceManager() {
  const [printed, setPrinted] = useState(false);

  const items: InvoiceItem[] = [
    { name: "Classic Cheeseburger", description: "Extra Cheese, No Onion", qty: 2, unitPrice: 12.95, discount: 0 },
    { name: "Truffle Mushroom Burger", description: 'Premium "Truffle Mayo" Sauce', qty: 1, unitPrice: 16.30, discount: 2.30 },
    { name: "Sweet Potato Fries", description: "", qty: 2, unitPrice: 5.00, discount: 0 },
    { name: "Vanilla Milkshake", description: "", qty: 2, unitPrice: 5.50, discount: 0 },
  ];

  const itemTotals = items.map(i => i.qty * i.unitPrice - i.discount);
  const subtotal = itemTotals.reduce((a, b) => a + b, 0);
  const discountTotal = items.reduce((a, i) => a + i.discount, 0);
  const serviceCharge = subtotal * 0.1;
  const vatAmount = (subtotal) * 0.1;
  const total = subtotal + serviceCharge + vatAmount;

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden">

        {/* Invoice Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">R</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Gourmet Burger Co.</p>
              <p className="text-gray-400 text-xs mt-0.5">Floor City Branch, Zone 1</p>
              <p className="text-gray-400 text-xs">123 Burger Blvd, Cairo 1210</p>
              <p className="text-gray-400 text-xs">Tel: 01-722 265 7896</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <p className="font-semibold text-gray-700 text-sm">Invoice #INV-10245</p>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">● Paid</span>
              <button
                onClick={handlePrint}
                className={`text-[11px] border px-3 py-1 rounded-lg font-medium transition-all ${printed ? "bg-green-50 border-green-300 text-green-600" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}
              >
                {printed ? "✓ Printed" : "🖨 Print"}
              </button>
            </div>
            <p className="text-gray-400 text-xs">Oct 26, 2023</p>

            <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-right">
              <p className="text-xs text-gray-500 font-medium">Dine-in Customer</p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">● Table 5</span>
                <span className="text-[10px] text-gray-400">4 Serviced</span>
                <span className="text-[10px] text-gray-400">Guests: 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="text-left pb-3 font-semibold">Item Details</th>
                <th className="text-center pb-3 font-semibold w-16">QTY</th>
                <th className="text-right pb-3 font-semibold w-24">Unit Price</th>
                <th className="text-right pb-3 font-semibold w-24">Discount</th>
                <th className="text-right pb-3 font-semibold w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-gray-400 text-xs mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 text-center text-gray-500 text-sm">{item.qty}</td>
                  <td className="py-4 text-right text-gray-700 text-sm">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right text-sm">
                    {item.discount > 0 ? (
                      <span className="text-red-500 font-medium">-${item.discount.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-4 text-right font-semibold text-gray-900 text-sm">
                    ${itemTotals[i].toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer: Payment + Totals */}
          <div className="flex justify-between items-start gap-8 mt-6 pt-4 border-t border-gray-100">

            {/* Payment Details */}
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Payment Details</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-700 text-white text-[9px] font-extrabold px-2 py-1 rounded tracking-wider">VISA</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Visa ending in 4242</p>
                  <p className="text-xs text-gray-400">Auth Code: 9BQKM</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Transaction processed securely.</p>
            </div>

            {/* Totals */}
            <div className="w-60 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700">${subtotal.toFixed(2)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Amount</span>
                  <span className="font-medium">-${discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Service Charge (10%)</span>
                <span className="font-medium text-gray-700">${serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (10%)</span>
                <span className="font-medium text-gray-700">${vatAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right">All prices include taxes</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">
            Thank you for dining with us! We hope you enjoyed your meal!
          </p>
          <p className="text-[10px] text-gray-300 font-mono">INV-10245 · Gourmet Burger Co.</p>
        </div>
      </div>
    </div>
  );
}